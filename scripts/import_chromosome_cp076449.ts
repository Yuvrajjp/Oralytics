import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fastaPath = path.resolve(__dirname, '../data/fasta/CP076449.fasta');
  const gbPath = path.resolve(__dirname, '../data/genbank/CP076449.gb');

  let accession = 'CP076449.1';
  let description = 'Aggregatibacter actinomycetemcomitans strain CU1000N chromosome, complete genome';
  let seq = '';

  if (fs.existsSync(fastaPath)) {
    const txt = fs.readFileSync(fastaPath, 'utf8');
    const lines = txt.split(/\r?\n/);
    if (lines.length > 0 && lines[0].startsWith('>')) {
      const header = lines[0].slice(1).trim();
      const parts = header.split(/\s+/);
      if (parts.length > 0) accession = parts[0];
      description = header.replace(parts[0], '').trim();
    }
    seq = lines.slice(1).join('');
  } else if (fs.existsSync(gbPath)) {
    const txt = fs.readFileSync(gbPath, 'utf8');
    // crude GenBank sequence parse: look for ORIGIN then read lines
    const originIdx = txt.indexOf('\nORIGIN');
    if (originIdx !== -1) {
      const seqPart = txt.slice(originIdx + 7);
      seq = seqPart.replace(/[^acgtACGT]/g, '').toUpperCase();
    }
    // try to get accession and definition
    const accMatch = txt.match(/^ACCESSION\s+(\S+)/m);
    if (accMatch) accession = accMatch[1];
    const defMatch = txt.match(/^DEFINITION\s+(.+)$/m);
    if (defMatch) description = defMatch[1].trim();
  } else {
    console.error('No FASTA or GenBank file found at expected paths.');
    process.exit(1);
  }

  const seqLen = seq.length;
  const gcCount = (seq.match(/[GC]/gi) || []).length;
  const gcContent = seqLen > 0 ? (gcCount / seqLen) * 100 : null;

  console.log(`Found accession=${accession} length=${seqLen} gc=${gcContent?.toFixed(2)}%`);

  try {
    // find or create organism
    let organism = await prisma.organism.findFirst({ where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } } });
    if (!organism) {
      console.log('Aggregatibacter organism not found; creating placeholder');
      organism = await prisma.organism.create({ data: { scientificName: 'Aggregatibacter actinomycetemcomitans', commonName: 'A. actinomycetemcomitans' } });
    }

    const upserted = await prisma.chromosome.upsert({
      where: { accession },
      create: {
        name: accession,
        lengthMb: seqLen > 0 ? seqLen / 1_000_000 : undefined,
        accession,
        description,
        sequenceLength: seqLen,
        gcContent: gcContent ?? undefined,
        organism: { connect: { id: organism.id } },
      },
      update: {
        name: accession,
        lengthMb: seqLen > 0 ? seqLen / 1_000_000 : undefined,
        description,
        sequenceLength: seqLen,
        gcContent: gcContent ?? undefined,
        organism: { connect: { id: organism.id } },
      },
    });

    console.log('Chromosome upserted:', upserted.id, upserted.accession);
  } catch (e) {
    console.error('Error upserting chromosome:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
