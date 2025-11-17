import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BIOPROJECT = 'PRJNA735719[BioProject]';

async function esearchProteinIds(term: string): Promise<string[]> {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=protein&term=${encodeURIComponent(term)}&retmax=10000&retmode=json`;
  const res = await fetch(url);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data.esearchresult?.idlist || [];
  } catch (e) {
    // fallback XML parse
    const ids = Array.from(text.matchAll(/<Id>(\d+)<\/Id>/g)).map(m => m[1]);
    return ids;
  }
}

function chunk<T>(arr: T[], size: number) { const out: T[][] = []; for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

async function fetchBatchFasta(ids: string[]): Promise<string> {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&id=${ids.join(',')}&rettype=fasta&retmode=text`;
  const res = await fetch(url);
  return await res.text();
}

function parseFasta(fasta: string) {
  const entries: { header: string; accession: string; seq: string }[] = [];
  const lines = fasta.split(/\r?\n/);
  let header = '';
  let seqParts: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('>')) {
      if (header) entries.push({ header, accession: header.split(/\s+/)[0], seq: seqParts.join('') });
      header = line.substring(1).trim(); seqParts = [];
    } else seqParts.push(line.trim());
  }
  if (header) entries.push({ header, accession: header.split(/\s+/)[0], seq: seqParts.join('') });
  return entries;
}

async function ingest() {
  const ids = await esearchProteinIds(BIOPROJECT);
  console.log(`ESearch returned ${ids.length} protein UIDs`);
  if (ids.length === 0) return;
  const unique = Array.from(new Set(ids)).slice(0, 5000);
  console.log(`Processing ${unique.length} protein UIDs`);
  const batches = chunk(unique, 200);
  const org = await prisma.organism.findFirst({ where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } } });
  if (!org) { console.log('No Aggregatibacter organism found'); return; }
  let created = 0; let processed = 0;
  for (let i=0;i<batches.length;i++){
    const fasta = await fetchBatchFasta(batches[i]);
    const entries = parseFasta(fasta);
    const dir = path.join(process.cwd(),'data','bioproject_proteins'); await fs.mkdir(dir,{recursive:true});
    await fs.writeFile(path.join(dir,`esearch_batch_${i+1}.fasta`), fasta);
    for (const e of entries) {
      processed++;
      const accession = e.accession.split('|').pop() || e.accession;
      const exists = await prisma.protein.findUnique({ where: { accession } }).catch(()=>null);
      if (exists) continue;
      // ensure gene exists
      let gene = await prisma.gene.findFirst({ where: { organismId: org.id, symbol: accession } });
      if (!gene) gene = await prisma.gene.create({ data: { symbol: accession, name: e.header, description: `Placeholder gene for ${accession}`, organism: { connect: { id: org.id } } } as any });
      await prisma.protein.create({ data: { accession, name: e.header, description: e.header, sequenceLength: e.seq.length, gene: { connect: { id: gene.id } } } as any });
      created++;
      if (processed % 100 === 0) console.log(`Processed ${processed} entries, created ${created}`);
    }
    await new Promise(r=>setTimeout(r,500));
  }
  console.log(`Done. Processed ${processed}, created ${created}`);
  await prisma.$disconnect();
}

ingest().catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
