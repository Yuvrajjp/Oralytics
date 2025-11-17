import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hydrophobicSegments(seq: string, window = 18, threshold = 0.6) {
  const hydrophobics = new Set('AILVFYWMC');
  let count = 0;
  for (let i = 0; i + window <= seq.length; i++) {
    let h = 0;
    for (let j = 0; j < window; j++) if (hydrophobics.has(seq[i + j])) h++;
    if (h / window >= threshold) count++;
  }
  return count;
}

function predictSignalPeptide(seq: string) {
  if (!seq || seq.length < 20) return false;
  const region = seq.slice(0, 30);
  const hydrophobic = hydrophobicSegments(region, 8, 0.7);
  const hasMotif = /[AlaCysGlySerThrValProLysMetIleLeuPheTYW]/.test(region); // placeholder
  return hydrophobic > 0 && hasMotif;
}

function approxMolWeight(seq: string) {
  if (!seq) return null;
  return Math.round(seq.length * 110);
}

function classifyFunction(header: string) {
  const h = header.toLowerCase();
  const mapping: [RegExp, string][] = [
    [/polymerase|primase|replication|dnaa|dnaB|dnaG/, 'Replication'],
    [/ribosomal|rpl|rps|ribosome|tRNA synthetase|elongation factor|translation/, 'Translation'],
    [/rna polymerase|transcription|sigma|transcription factor/, 'Transcription'],
    [/dehydrogenase|oxidoreductase|reductase|isomerase|kinase|transferase|ligase|synthase|hydrolase|lyase/, 'Metabolism / Enzyme'],
    [/transport|permease|porin|channel|transporter|symporter|antiporter/, 'Transport'],
    [/membrane|outer membrane|inner membrane|lipoprotein|porin/, 'Membrane / Transport'],
    [/adhesin|pilin|surface protein|fimbriae|flagellin|motility/, 'Adhesion / Motility'],
    [/hypothetical|unknown|uncharacterized|putative/, 'Hypothetical / Unknown'],
    [/transposase|integrase|recombinase|resolvase/, 'Mobile element / Recombinase'],
    [/chaperone|foldase|groEL|dnaK|hsp/, 'Chaperone / Folding'],
    [/synthase|synthetase/, 'Metabolism / Enzyme'],
  ];
  for (const [re, cls] of mapping) if (re.test(h)) return cls;
  return 'Other';
}

function classifyStructure(seq: string, header: string) {
  if (!seq) {
    const h = header.toLowerCase();
    if (/membrane|outer membrane|lipoprotein/.test(h)) return 'Membrane';
    return 'Unknown';
  }
  const tm = hydrophobicSegments(seq, 20, 0.75);
  const sig = predictSignalPeptide(seq);
  if (tm > 0) return 'Membrane';
  if (sig) return 'Secreted';
  return 'Soluble';
}

async function loadLocalFastaMaps() {
  const maps = new Map<string, string>();
  const dirs = [path.join(process.cwd(), 'data', 'proteins'), path.join(process.cwd(), 'data', 'bioproject_proteins')];
  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      for (const f of files) {
        if (!f.endsWith('.fasta')) continue;
        const text = await fs.readFile(path.join(dir, f), 'utf-8');
        let header = '';
        let seqParts: string[] = [];
        for (const line of text.split(/\r?\n/)) {
          if (!line) continue;
          if (line.startsWith('>')) {
            if (header) {
              const acc = header.split(/\s+/)[0].replace(/^>/, '');
              maps.set(acc, seqParts.join(''));
            }
            header = line.substring(1).trim();
            seqParts = [];
          } else seqParts.push(line.trim());
        }
        if (header) {
          const acc = header.split(/\s+/)[0].replace(/^>/, '');
          maps.set(acc, seqParts.join(''));
        }
      }
    } catch (e) {
      // ignore missing dir
    }
  }
  return maps;
}

async function classifyAll() {
  console.log('Loading local FASTA maps...');
  const fastaMap = await loadLocalFastaMaps();
  console.log(`Loaded ${fastaMap.size} sequences from local FASTA files`);

  // Process proteins in DB in batches
  const batchSize = 200;
  let skip = 0;
  while (true) {
    const proteins = await prisma.protein.findMany({ take: batchSize, skip, orderBy: { id: 'asc' }, include: { gene: true } });
    if (proteins.length === 0) break;
    for (const p of proteins) {
      let seq = p.sequence || null;
      if (!seq) {
        // try by accession variations
        const candidates = [p.accession, p.accession.split('|').pop() || p.accession];
        for (const c of candidates) {
          if (fastaMap.has(c)) { seq = fastaMap.get(c) as string; break; }
        }
      }
      const header = p.name || p.description || '';
      const functionClass = classifyFunction(header + ' ' + (p.description || ''));
      const structureClass = classifyStructure(seq || '', header);
      const predictedLocalization = structureClass === 'Membrane' ? 'membrane' : (structureClass === 'Secreted' ? 'secreted' : 'cytoplasmic');
      const molecularWeight = seq ? approxMolWeight(seq) : p.molecularWeight || approxMolWeight(''.padEnd(p.sequenceLength || 0, 'A'));

      await prisma.protein.update({ where: { id: p.id }, data: { sequence: seq, source: p.source || null, functionClass, structureClass, predictedLocalization, molecularWeight } as any }).catch(e => console.error('Update error', p.accession, e));
    }
    skip += proteins.length;
    console.log(`Processed ${skip} proteins`);
  }
  await prisma.$disconnect();
}

classifyAll().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
