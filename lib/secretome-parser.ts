// lib/secretome-parser.ts
// Parser for extracting secreted proteins and secretion systems from genomic data

import fs from 'fs/promises';
import path from 'path';

export interface ProteinEntry {
  locusTag: string;
  proteinId: string;
  geneName?: string;
  product: string;
  location: {
    start: number;
    end: number;
    strand: '+' | '-';
  };
  sequence?: string;
}

export interface SecretionSystemData {
  name: string;
  type: string;
  description: string;
  components: {
    locusTag: string;
    proteinId: string;
    geneName?: string;
    componentType: string;
    product: string;
    location: {
      start: number;
      end: number;
      strand: '+' | '-';
    };
  }[];
}

/**
 * Parse FASTA file and extract protein entries
 */
export async function parseFastaFile(filePath: string): Promise<Map<string, { header: string; sequence: string }>> {
  const content = await fs.readFile(filePath, 'utf-8');
  const entries = new Map<string, { header: string; sequence: string }>();
  
  const lines = content.split('\n');
  let currentHeader = '';
  let currentSequence = '';
  
  for (const line of lines) {
    if (line.startsWith('>')) {
      if (currentHeader) {
        // Extract locus tag from header
        const locusMatch = currentHeader.match(/\[locus_tag=([^\]]+)\]/);
        const locusTag = locusMatch ? locusMatch[1] : '';
        if (locusTag) {
          entries.set(locusTag, {
            header: currentHeader,
            sequence: currentSequence.trim()
          });
        }
      }
      currentHeader = line.substring(1);
      currentSequence = '';
    } else {
      currentSequence += line.trim();
    }
  }
  
  // Don't forget the last entry
  if (currentHeader) {
    const locusMatch = currentHeader.match(/\[locus_tag=([^\]]+)\]/);
    const locusTag = locusMatch ? locusMatch[1] : '';
    if (locusTag) {
      entries.set(locusTag, {
        header: currentHeader,
        sequence: currentSequence.trim()
      });
    }
  }
  
  return entries;
}

/**
 * Extract protein information from FASTA header
 */
export function parseProteinHeader(header: string): ProteinEntry | null {
  const locusMatch = header.match(/\[locus_tag=([^\]]+)\]/);
  const proteinIdMatch = header.match(/\[protein_id=([^\]]+)\]/);
  const geneMatch = header.match(/\[gene=([^\]]+)\]/);
  const productMatch = header.match(/\[protein=([^\]]+)\]/);
  const locationMatch = header.match(/\[location=([^\]]+)\]/);
  
  if (!locusMatch || !proteinIdMatch || !productMatch || !locationMatch) {
    return null;
  }
  
  // Parse location string like "1243548..1246715" or "complement(1000..2000)"
  const locationStr = locationMatch[1];
  const isComplement = locationStr.includes('complement');
  const coordMatch = locationStr.match(/(\d+)\.\.(\d+)/);
  
  if (!coordMatch) {
    return null;
  }
  
  return {
    locusTag: locusMatch[1],
    proteinId: proteinIdMatch[1],
    geneName: geneMatch ? geneMatch[1] : undefined,
    product: productMatch[1],
    location: {
      start: parseInt(coordMatch[1], 10),
      end: parseInt(coordMatch[2], 10),
      strand: isComplement ? '-' : '+'
    }
  };
}

/**
 * Leukotoxin T1SS system definition based on A. actinomycetemcomitans CU1000N
 */
export function getLeukotoxinSystem(): SecretionSystemData {
  return {
    name: 'Leukotoxin Type I Secretion System',
    type: 'T1SS',
    description: 'RTX toxin secretion system for LtxA leukotoxin export',
    components: [
      {
        locusTag: 'KO461_06310',
        proteinId: 'UEL52595.1',
        componentType: 'Toxin Activator',
        product: 'toxin-activating lysine-acyltransferase',
        location: { start: 1243029, end: 1243535, strand: '+' }
      },
      {
        locusTag: 'KO461_06315',
        proteinId: 'UEL52596.1',
        geneName: 'ltxA',
        componentType: 'Toxin',
        product: 'RTX family leukotoxin LtxA',
        location: { start: 1243548, end: 1246715, strand: '+' }
      },
      {
        locusTag: 'KO461_06320',
        proteinId: 'UEL52597.1',
        componentType: 'ATPase/Permease',
        product: 'type I secretion system permease/ATPase',
        location: { start: 1246784, end: 1248907, strand: '+' }
      },
      {
        locusTag: 'KO461_06325',
        proteinId: 'UEL52598.1',
        componentType: 'Adaptor',
        product: 'HlyD family type I secretion periplasmic adaptor subunit',
        location: { start: 1248922, end: 1250355, strand: '+' }
      }
    ]
  };
}

/**
 * Load protein sequences for a secretion system
 */
export async function loadSecretionSystemSequences(
  systemData: SecretionSystemData,
  fastaPath: string
): Promise<Map<string, string>> {
  const fastaEntries = await parseFastaFile(fastaPath);
  const sequences = new Map<string, string>();
  
  for (const component of systemData.components) {
    const entry = fastaEntries.get(component.locusTag);
    if (entry) {
      sequences.set(component.locusTag, entry.sequence);
    }
  }
  
  return sequences;
}

/**
 * Parse GFF3 file and extract gene features
 */
export async function parseGFF3File(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const genes: any[] = [];
  
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    
    const fields = line.split('\t');
    if (fields.length < 9) continue;
    
    const [seqid, source, type, start, end, score, strand, phase, attributes] = fields;
    
    if (type === 'gene' || type === 'CDS') {
      const attrs: any = {};
      attributes.split(';').forEach(attr => {
        const [key, value] = attr.split('=');
        if (key && value) {
          attrs[key] = value;
        }
      });
      
      genes.push({
        seqid,
        source,
        type,
        start: parseInt(start, 10),
        end: parseInt(end, 10),
        strand,
        attributes: attrs
      });
    }
  }
  
  return genes;
}

/**
 * Classify protein secretion pathway based on keywords and domains
 */
export function classifySecretionPathway(product: string, locusTag: string): {
  pathway: string | null;
  isSecreted: boolean;
  isSecretionMachinery: boolean;
  componentType: string | null;
} {
  const productLower = product.toLowerCase();
  
  // Type I Secretion System
  if (productLower.includes('type i secretion') || 
      productLower.includes('hlyd') ||
      productLower.includes('rtx')) {
    return {
      pathway: 'T1SS',
      isSecreted: productLower.includes('toxin') && !productLower.includes('secretion system'),
      isSecretionMachinery: productLower.includes('secretion system') || 
                            productLower.includes('hlyd') ||
                            productLower.includes('atpase') ||
                            productLower.includes('adaptor'),
      componentType: productLower.includes('atpase') ? 'ATPase' :
                    productLower.includes('adaptor') ? 'Adaptor' :
                    productLower.includes('hlyd') ? 'Adaptor' :
                    productLower.includes('toxin') ? 'Cargo' : null
    };
  }
  
  // Type II Secretion System
  if (productLower.includes('type ii secretion') || 
      productLower.includes('gsp')) {
    return {
      pathway: 'T2SS',
      isSecreted: false,
      isSecretionMachinery: true,
      componentType: 'T2SS Component'
    };
  }
  
  // Signal peptides (Sec pathway)
  if (productLower.includes('signal peptide') ||
      productLower.includes('sec-dependent')) {
    return {
      pathway: 'Sec',
      isSecreted: true,
      isSecretionMachinery: false,
      componentType: null
    };
  }
  
  // Twin-arginine translocation
  if (productLower.includes('tat ') || 
      productLower.includes('twin-arginine')) {
    return {
      pathway: 'Tat',
      isSecreted: productLower.includes('signal'),
      isSecretionMachinery: productLower.includes('tat') && !productLower.includes('signal'),
      componentType: null
    };
  }
  
  // Outer membrane proteins
  if (productLower.includes('outer membrane') ||
      productLower.includes('omp') ||
      productLower.includes('porin')) {
    return {
      pathway: 'OM',
      isSecreted: true,
      isSecretionMachinery: false,
      componentType: null
    };
  }
  
  return {
    pathway: null,
    isSecreted: false,
    isSecretionMachinery: false,
    componentType: null
  };
}

/**
 * Extract all secreted proteins from proteome
 */
export async function extractSecretedProteins(fastaPath: string): Promise<ProteinEntry[]> {
  const fastaEntries = await parseFastaFile(fastaPath);
  const secretedProteins: ProteinEntry[] = [];
  
  for (const [locusTag, entry] of fastaEntries) {
    const proteinInfo = parseProteinHeader(entry.header);
    if (!proteinInfo) continue;
    
    const classification = classifySecretionPathway(proteinInfo.product, locusTag);
    
    if (classification.isSecreted || classification.isSecretionMachinery) {
      secretedProteins.push({
        ...proteinInfo,
        sequence: entry.sequence
      });
    }
  }
  
  return secretedProteins;
}
