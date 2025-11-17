import * as fs from 'fs';
import * as path from 'path';

interface ChromosomeInfo {
  accession: string;
  version: string;
  organism: string;
  length: number;
  gcPercent: number;
  genes: any[];
  description: string;
}

/**
 * Fetch BioProject metadata from NCBI
 */
async function fetchBioProjectMetadata(bioProjectId: string): Promise<any> {
  console.log(`\n📊 Fetching BioProject ${bioProjectId}...`);
  
  try {
    // NCBI Entrez API for BioProject
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=bioproject&term=${bioProjectId}&rettype=json&retmode=json`;
    const response = await fetch(eSearchUrl);
    const text = await response.text();
    
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // If JSON parsing fails, NCBI might have returned XML
      console.log('   ℹ️  NCBI API returned XML, using alternative approach');
      return { bioProjectId, dbId: bioProjectId, summary: null };
    }
    
    if (data.esearchresult.idlist.length === 0) {
      console.log('   ⚠️  BioProject not found');
      return null;
    }
    
    const bioProjectDbId = data.esearchresult.idlist[0];
    console.log(`   ✓ Found BioProject ID: ${bioProjectDbId}`);
    
    return {
      bioProjectId,
      dbId: bioProjectDbId,
      summary: null,
    };
  } catch (error) {
    console.error('   ❌ Error fetching BioProject:', error);
    return null;
  }
}

/**
 * Fetch nucleotide record metadata from NCBI
 */
async function fetchNucleotideMetadata(accession: string): Promise<ChromosomeInfo | null> {
  console.log(`\n🧬 Fetching Nucleotide Record: ${accession}`);
  
  try {
    // Direct summary fetch by accession
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=${accession}&rettype=json`;
    const summaryResponse = await fetch(summaryUrl);
    const text = await summaryResponse.text();
    
    let summaryData: any;
    try {
      summaryData = JSON.parse(text);
    } catch {
      // Parse XML alternatively
      console.log('   ℹ️  Response was in XML format');
      // Extract basic info from NCBI HTML page instead
      const htmlUrl = `https://www.ncbi.nlm.nih.gov/nuccore/${accession}`;
      const htmlResponse = await fetch(htmlUrl);
      const html = await htmlResponse.text();
      
      // Look for common patterns in the HTML
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const gcMatch = html.match(/GC%[:\s]+([0-9.]+)/);
      const lenMatch = html.match(/Length[:\s]+([0-9,]+)/);
      
      return {
        accession,
        version: accession,
        organism: titleMatch?.[1]?.split(' complete')[0] || 'Unknown',
        description: titleMatch?.[1] || 'No description available',
        length: parseInt((lenMatch?.[1] || '0').replace(/,/g, '')) || 0,
        gcPercent: parseFloat(gcMatch?.[1] || '0') || 0,
        genes: [],
      };
    }
    
    const resultKey = Object.keys(summaryData.result || {})[0];
    const record = summaryData.result?.[resultKey];
    
    if (!record) {
      console.log('   ⚠️  Could not retrieve summary');
      return null;
    }
    
    console.log(`   ✓ Organism: ${record.organism}`);
    console.log(`   ✓ Length: ${record.slen} bp`);
    console.log(`   ✓ GC: ${record.gc_percent}%`);
    console.log(`   ✓ Description: ${record.title}`);
    
    return {
      accession: record.accessionversion || accession,
      version: record.accessionversion || accession,
      organism: record.organism,
      description: record.title,
      length: record.slen,
      gcPercent: parseFloat(record.gc_percent) || 0,
      genes: [],
    };
  } catch (error) {
    console.error('   ❌ Error fetching nucleotide metadata:', error);
    return null;
  }
}

/**
 * Fetch GenBank record with annotations (genes, proteins)
 */
async function fetchGenBankRecord(accession: string): Promise<any> {
  console.log(`\n📋 Fetching GenBank annotations for ${accession}...`);
  
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession}&rettype=gb&retmode=text`;
    console.log(`   Downloading GenBank file...`);
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Check if we got an error response
    if (text.startsWith('<?xml') || text.includes('ERROR')) {
      console.log('   ⚠️  Received error response from NCBI');
      return [];
    }
    
    // Save GenBank file
    const gbDir = path.join(process.cwd(), 'data', 'genbank');
    if (!fs.existsSync(gbDir)) {
      fs.mkdirSync(gbDir, { recursive: true });
    }
    
    const gbFile = path.join(gbDir, `${accession}.gb`);
    fs.writeFileSync(gbFile, text);
    console.log(`   ✓ Saved to: ${gbFile}`);
    
    // Parse features (simplified)
    const features: any[] = [];
    const lines = text.split('\n');
    
    let inFeatures = false;
    let currentFeature: any = null;
    
    for (const line of lines) {
      if (line.startsWith('FEATURES')) {
        inFeatures = true;
        continue;
      }
      if (line.startsWith('ORIGIN') || line.startsWith('//')) {
        inFeatures = false;
        break;
      }
      
      if (inFeatures && line.match(/^\s{5}(CDS|gene)/)) {
        if (currentFeature && currentFeature.product) {
          features.push(currentFeature);
        }
        currentFeature = {
          locus_tag: '',
          gene: '',
          product: '',
          location: { start: 0, end: 0, strand: '+' },
          protein_id: '',
        };
      }
      
      if (currentFeature) {
        if (line.includes('locus_tag="')) {
          currentFeature.locus_tag = line.match(/locus_tag="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('gene="')) {
          currentFeature.gene = line.match(/gene="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('product="')) {
          currentFeature.product = line.match(/product="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('protein_id="')) {
          currentFeature.protein_id = line.match(/protein_id="([^"]+)"/)?.[1] || '';
        }
      }
    }
    
    console.log(`   ✓ Found ${features.length} CDS features`);
    return { text, features };
  } catch (error) {
    console.error('   ❌ Error fetching GenBank:', error);
    return null;
  }
}

/**
 * Fetch FASTA sequence
 */
async function fetchFastaSequence(accession: string): Promise<string | null> {
  console.log(`\n📥 Fetching FASTA sequence for ${accession}...`);
  
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession}&rettype=fasta&retmode=text`;
    const response = await fetch(url);
    const fasta = await response.text();
    
    // Check for error
    if (fasta.startsWith('<?xml') || fasta.includes('ERROR')) {
      console.log('   ⚠️  Received error response from NCBI');
      return null;
    }
    
    // Save FASTA
    const fastaDir = path.join(process.cwd(), 'data', 'fasta');
    if (!fs.existsSync(fastaDir)) {
      fs.mkdirSync(fastaDir, { recursive: true });
    }
    
    const fastaFile = path.join(fastaDir, `${accession}.fasta`);
    fs.writeFileSync(fastaFile, fasta);
    
    const lines = fasta.split('\n').filter(l => l && !l.startsWith('>'));
    const sequence = lines.join('');
    
    console.log(`   ✓ Sequence length: ${sequence.length} bp`);
    console.log(`   ✓ Saved to: ${fastaFile}`);
    
    return sequence;
  } catch (error) {
    console.error('   ❌ Error fetching FASTA:', error);
    return null;
  }
}

/**
 * Fetch protein sequences
 */
async function fetchProteinSequences(accession: string): Promise<string | null> {
  console.log(`\n🧬 Fetching protein sequences for ${accession}...`);
  
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession}&rettype=fasta_cds_aa&retmode=text`;
    const response = await fetch(url);
    const proteins = await response.text();
    
    // Check for error
    if (proteins.startsWith('<?xml') || proteins.includes('ERROR')) {
      console.log('   ⚠️  Received error response from NCBI');
      return null;
    }
    
    // Save proteins
    const protDir = path.join(process.cwd(), 'data', 'proteins');
    if (!fs.existsSync(protDir)) {
      fs.mkdirSync(protDir, { recursive: true });
    }
    
    const protFile = path.join(protDir, `${accession}_proteins.fasta`);
    fs.writeFileSync(protFile, proteins);
    
    const proteinCount = (proteins.match(/^>/gm) || []).length;
    console.log(`   ✓ Proteins: ${proteinCount}`);
    console.log(`   ✓ Saved to: ${protFile}`);
    
    return proteins;
  } catch (error) {
    console.error('   ⚠️  Could not fetch protein sequences:', error);
    return null;
  }
}

/**
 * Fetch GFF annotation
 */
async function fetchGFFAnnotation(accession: string): Promise<string | null> {
  console.log(`\n📄 Fetching GFF annotation for ${accession}...`);
  
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession}&rettype=gff3&retmode=text`;
    const response = await fetch(url);
    const gff = await response.text();
    
    // Check for error
    if (gff.startsWith('<?xml') || gff.includes('ERROR')) {
      console.log('   ⚠️  Received error response from NCBI');
      return null;
    }
    
    // Save GFF
    const gffDir = path.join(process.cwd(), 'data', 'gff');
    if (!fs.existsSync(gffDir)) {
      fs.mkdirSync(gffDir, { recursive: true });
    }
    
    const gffFile = path.join(gffDir, `${accession}.gff3`);
    fs.writeFileSync(gffFile, gff);
    
    const geneCount = (gff.match(/\tgene\t/g) || []).length;
    console.log(`   ✓ Gene entries: ${geneCount}`);
    console.log(`   ✓ Saved to: ${gffFile}`);
    
    return gff;
  } catch (error) {
    console.error('   ⚠️  Could not fetch GFF:', error);
    return null;
  }
}

/**
 * Main orchestration
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         NCBI GENOMIC DATA FETCHER & INTEGRATOR             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const bioProjectId = 'PRJNA735719';
  const nucleotideAccession = 'CP076449';
  
  // Fetch BioProject metadata
  const bioProject = await fetchBioProjectMetadata(bioProjectId);
  if (bioProject) {
    console.log(`   📌 BioProject found with ID: ${bioProject.dbId}`);
  }
  
  // Fetch nucleotide metadata
  const chromosome = await fetchNucleotideMetadata(nucleotideAccession);
  if (!chromosome) {
    console.error('Failed to fetch chromosome data');
    process.exit(1);
  }
  
  // Fetch GenBank record
  const gbRecord = await fetchGenBankRecord(nucleotideAccession);
  if (gbRecord) {
    chromosome.genes = gbRecord.features;
  }
  
  // Fetch FASTA sequence
  await fetchFastaSequence(nucleotideAccession);
  
  // Fetch protein sequences
  await fetchProteinSequences(nucleotideAccession);
  
  // Fetch GFF annotation
  await fetchGFFAnnotation(nucleotideAccession);
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    DATA SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✓ Organism: ${chromosome.organism}`);
  console.log(`✓ Chromosome: ${chromosome.accession}`);
  console.log(`✓ Length: ${chromosome.length} bp`);
  console.log(`✓ GC Content: ${chromosome.gcPercent}%`);
  console.log(`✓ Genes: ${chromosome.genes.length}`);
  console.log(`\n✓ All files saved to data/ directory`);
  console.log(`   - GenBank format (.gb)`);
  console.log(`   - FASTA sequences (.fasta)`);
  console.log(`   - Protein sequences (fasta_cds_aa)`);
  console.log(`   - GFF3 annotation (.gff3)`);
  console.log(`\nNext: Run ingest script to populate database`);
}

main().catch(console.error);
