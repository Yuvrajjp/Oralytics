import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FASTA_PATH = path.join(process.cwd(), 'data', 'proteins', 'CP076449_proteins.fasta');

function parseFasta(fasta: string) {
  const entries: { header: string; accession: string; seq: string }[] = [];
  const lines = fasta.split(/\r?\n/);
  let header = '';
  let seqParts: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('>')) {
      if (header) {
        const accession = header.split(/\s+/)[0];
        entries.push({ header, accession, seq: seqParts.join('') });
      }
      header = line.substring(1).trim();
      seqParts = [];
    } else {
      seqParts.push(line.trim());
    }
  }
  if (header) {
    const accession = header.split(/\s+/)[0];
    entries.push({ header, accession, seq: seqParts.join('') });
  }
  return entries;
}

async function getOrCreateAggregatibacter() {
  const organism = await prisma.organism.findFirst({ where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } } });
  if (organism) return organism;
  return prisma.organism.create({ data: { scientificName: 'Aggregatibacter actinomycetemcomitans', commonName: 'A. actinomycetemcomitans', taxonomyId: 714962 } });
}

async function upsertFromFasta() {
  const raw = await fs.readFile(FASTA_PATH, 'utf-8');
  const entries = parseFasta(raw);
  console.log(`Parsed ${entries.length} protein entries from FASTA`);

  const organism = await getOrCreateAggregatibacter();
  console.log(`Using organism ${organism.scientificName} (id=${organism.id})`);

  let created = 0;
  let skipped = 0;

  for (const e of entries) {
    try {
      // accession may include pipe separators; take the first token
      const accession = e.accession.split('|').pop() || e.accession;
      const header = e.header;
      const seq = e.seq;

      // skip empty sequences
      if (!seq || seq.length === 0) {
        skipped++;
        continue;
      }

      // check existing protein
      const exists = await prisma.protein.findUnique({ where: { accession } }).catch(() => null);
      if (exists) continue;

      // ensure gene exists or create placeholder
      let gene = await prisma.gene.findFirst({ where: { organismId: organism.id, symbol: accession } });
      if (!gene) {
        gene = await prisma.gene.create({ data: { symbol: accession, name: header, description: `Placeholder gene for ${accession}`, organism: { connect: { id: organism.id } } } as any });
      }

      await prisma.protein.create({ data: { accession, name: header, description: header, sequenceLength: seq.length, gene: { connect: { id: gene.id } } } as any });
      created++;
      if (created % 100 === 0) console.log(`Created ${created} proteins...`);
    } catch (err) {
      skipped++;
    }
  }

  console.log(`Done. Created: ${created}, skipped: ${skipped}`);
  await prisma.$disconnect();
}

upsertFromFasta().catch(async (err) => { console.error(err); await prisma.$disconnect(); process.exit(1); });