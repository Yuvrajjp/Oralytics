import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
// Use global fetch available in Node >=18; no node-fetch dependency

const prisma = new PrismaClient();
const BIOPROJECT_ID = '735719';

async function elinkProteinIds(bioprojectId: string): Promise<string[]> {
  console.log(`Fetching protein IDs linked to BioProject ${bioprojectId}...`);
  // Use linkname/from_uid form which returns linked protein ids for a BioProject
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=bioproject&db=protein&linkname=bioproject_protein&from_uid=${bioprojectId}&retmode=json`;
  const res = await fetch(url);
  const text = await res.text();

  // Try JSON parse, otherwise fall back to XML extraction
  try {
    const data = JSON.parse(text);
    const linksets = data.linksets || [];
    const ids: string[] = [];
    for (const ls of linksets) {
      const linksetdbs = ls.linksetdbs || [];
      for (const ldb of linksetdbs) {
        if (ldb.linkname && ldb.linkname.includes('bioproject_protein') && Array.isArray(ldb.links)) {
          ids.push(...ldb.links.map((x: any) => String(x)));
        }
      }
    }
    return ids;
  } catch (e) {
    // XML fallback: extract <Id>...</Id>
    console.log('   Response not JSON; trying XML parsing fallback');
    const idMatches = Array.from(text.matchAll(/<Id>(\d+)<\/Id>/g)).map(m => m[1]);
    return idMatches;
  }
}

// Alternate method: parse the NCBI proteins listing HTML for the BioProject
async function fetchProteinAccessionsFromHtml(bioprojectId: string): Promise<string[]> {
  const url = `https://www.ncbi.nlm.nih.gov/protein?linkname=bioproject_protein&from_uid=${bioprojectId}`;
  console.log(`Falling back to scraping HTML at ${url}`);
  const res = await fetch(url);
  const html = await res.text();
  // Find occurrences of /protein/<accession> or /nuccore/ACCESSION
  const accSet = new Set<string>();
  for (const m of html.matchAll(/\/protein\/(\w+\.?\w+)/g)) {
    accSet.add(m[1]);
  }
  // Also look for refs in links like /entrez/viewer.fcgi?db=protein&val=ACCESSION
  for (const m of html.matchAll(/val=(\w+\.?\w+)/g)) {
    accSet.add(m[1]);
  }
  return Array.from(accSet);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchProteinFastaBatch(ids: string[]): Promise<string> {
  const idParam = ids.join(',');
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&id=${idParam}&rettype=fasta&retmode=text`;
  const res = await fetch(url);
  const text = await res.text();
  return text;
}

function parseFastaEntries(fastaText: string): { header: string; accession: string; seq: string }[] {
  const entries: { header: string; accession: string; seq: string }[] = [];
  const lines = fastaText.split(/\r?\n/);
  let header = '';
  let seqParts: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('>')) {
      if (header) {
        const accession = (header.split(/\s+/)[0] || '').replace(/^>/, '');
        entries.push({ header, accession, seq: seqParts.join('') });
      }
      header = line.substring(1).trim();
      seqParts = [];
    } else {
      seqParts.push(line.trim());
    }
  }
  if (header) {
    const accession = (header.split(/\s+/)[0] || '').replace(/^>/, '');
    entries.push({ header, accession, seq: seqParts.join('') });
  }
  return entries;
}

async function getOrCreateAggregatibacter() {
  const organism = await prisma.organism.findFirst({
    where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } },
  });
  if (organism) return organism;

  console.log('Organism not found; creating placeholder Aggregatibacter entry');
  return prisma.organism.create({
    data: {
      scientificName: 'Aggregatibacter actinomycetemcomitans',
      commonName: 'A. actinomycetemcomitans',
      taxonomyId: 714962,
      description: 'Created from NCBI BioProject ingestion',
    },
  });
}

async function upsertProteinForOrganism(orgId: string, accession: string, name: string, seq: string) {
  // Ensure there's a gene to attach to; create placeholder gene if missing
  let gene = await prisma.gene.findFirst({ where: { organismId: orgId, symbol: accession } });
  if (!gene) {
    gene = await prisma.gene.create({
      // Cast to any to avoid strict generated types mismatch for custom fields
      data: {
        symbol: accession,
        name,
        description: `Placeholder gene for protein ${accession}`,
        organism: { connect: { id: orgId } },
      } as any,
    });
  }

  // Upsert protein
  const existing = await prisma.protein.findUnique({ where: { accession } }).catch(() => null);
  if (existing) return false;

  await prisma.protein.create({
    data: {
      accession,
      name,
      description: name,
      sequenceLength: seq.length,
      molecularWeight: null,
      localization: null,
      gene: { connect: { id: gene.id } },
    },
  });
  return true;
}

async function main() {
  try {
    const ids = await elinkProteinIds(BIOPROJECT_ID);
    console.log(`Found ${ids.length} linked protein IDs (raw).`);

    // Deduplicate and limit (expect ~2053)
    let uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) {
      // Try HTML fallback where NCBI lists proteins for the BioProject
      const accessions = await fetchProteinAccessionsFromHtml(BIOPROJECT_ID);
      if (accessions.length > 0) {
        console.log(`Found ${accessions.length} protein accessions via HTML parsing.`);
        uniqueIds = accessions;
      }
    }
    console.log(`Deduplicated to ${uniqueIds.length} protein IDs.`);

    // Fetch in batches
    const batches = chunkArray(uniqueIds, 200);

    const organism = await getOrCreateAggregatibacter();
    console.log(`Using organism ID: ${organism.id} (${organism.scientificName})`);

    let totalCreated = 0;
    let totalProcessed = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Fetching batch ${i + 1}/${batches.length} (${batch.length} IDs)...`);
      const fasta = await fetchProteinFastaBatch(batch);

      // save batch fasta locally
      const outDir = path.join(process.cwd(), 'data', 'bioproject_proteins');
      await fs.mkdir(outDir, { recursive: true });
      const batchFile = path.join(outDir, `batch_${i + 1}.fasta`);
      await fs.writeFile(batchFile, fasta, 'utf-8');

      const entries = parseFastaEntries(fasta);
      console.log(`   Parsed ${entries.length} FASTA entries from batch`);

      for (const e of entries) {
        totalProcessed++;
        const created = await upsertProteinForOrganism(organism.id, e.accession, e.header, e.seq);
        if (created) totalCreated++;
        if (totalProcessed % 100 === 0) console.log(`   Progress: ${totalProcessed} processed, ${totalCreated} created`);
      }

      // small delay to be polite to NCBI
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\nIngestion complete. Processed: ${totalProcessed}, new proteins created: ${totalCreated}`);

    // Update organism profile estimatedProteins
    const profile = await prisma.organismProfile.findUnique({ where: { organismId: organism.id } });
    if (profile) {
      await prisma.organismProfile.update({ where: { id: profile.id }, data: { estimatedProteins: totalCreated } as any }).catch(() => {});
      console.log('Updated organism profile estimatedProteins');
    }
  } catch (err) {
    console.error('Error in ingestion:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});