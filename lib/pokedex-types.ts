/**
 * Type definitions for the Microbial Pokedex system
 * These types extend the base Prisma models with additional UI/API-specific fields
 */

// Genomic data structures
export interface GenomeTableRow {
  position: number;
  nucleotide: string;
  annotation?: string;
}

export interface ChromosomalOrganization {
  chromosomeName: string;
  startPosition: number;
  endPosition: number;
  geneCount: number;
  regions: {
    name: string;
    type: string;
    start: number;
    end: number;
    color?: string;
  }[];
}

// Gene-to-Protein translation pipeline
export interface TranslationPipeline {
  geneLocus: string;
  codingSequence: string;
  translatedSequence: string;
  startCodon: string;
  stopCodon: string;
  readingFrame: number;
  proteinLength: number;
  molecularWeight: number;
}

// AlphaFold prediction data
export interface AlphaFoldData {
  alphafoldId: string;
  modelVersion: string;
  pdbUrl: string;
  meanPlddtScore: number;
  ptmScore?: number;
  paeValue?: number;
  domainCount?: number;
  secondaryStructure?: {
    helix: number;
    sheet: number;
    coil: number;
  };
  confidenceRegions: ConfidenceRegionData[];
}

export interface ConfidenceRegionData {
  startResidue: number;
  endResidue: number;
  confidenceLevel: "Very high" | "High" | "Medium" | "Low";
  plddtScore: number;
  structuralFeature?: string;
  functionalImportance?: string;
}

// Dr. Cugini's research data
export interface CuginiResearchData {
  relativeAbundance: number;
  diseaseAssociations: {
    disease: string;
    associationStrength: "Strong" | "Moderate" | "Weak";
    evidence: string;
  }[];
  virulenceFactors: VirulenceFactorData[];
  biofilmCapability: "High" | "Medium" | "Low" | "None";
  pathogenicityScore: number;
  clinicalRelevance: string;
}

export interface VirulenceFactorData {
  factorName: string;
  factorType: string;
  description: string;
  virulenceScore: number;
  mechanismOfAction?: string;
  targetTissue?: string;
  evidenceLevel: "Confirmed" | "Probable" | "Predicted";
  dataSource?: string;
}

// Metabolic and resistance profiles
export interface MetabolicProfile {
  pathways: {
    name: string;
    category: string;
    enzymes: string[];
  }[];
  metabolites: string[];
}

export interface AntibioticResistanceProfile {
  antibiotics: {
    name: string;
    resistance: "Resistant" | "Intermediate" | "Susceptible";
    mechanism?: string;
    genes?: string[];
  }[];
}

// Complete Microbial Pokedex Entry
export interface MicrobialPokedexEntry {
  id: string;
  pokedexNumber: number;
  organism: {
    id: string;
    scientificName: string;
    commonName?: string;
  };
  nickname?: string;
  discoveredBy?: string;
  discoveryYear?: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Legendary";
  
  // Genomic data
  genomics: {
    dnaSequence?: string;
    rnaSequence?: string;
    gcContent?: number;
    genomeCompleteness?: number;
    chromosomalOrganization: ChromosomalOrganization[];
  };
  
  // Phenotype
  phenotype: {
    cellMorphology?: string;
    metabolism?: string;
    oxygenRequirement?: string;
    optimalTemperature?: number;
    optimalPh?: number;
    gramStain?: string;
    motility?: string;
  };
  
  // Ecology
  ecology: {
    primaryHabitat?: string;
    ecologicalNiche?: string;
    symbioticRelations?: string;
  };
  
  // Gene-Protein mappings
  geneProteinMappings: TranslationPipeline[];
  
  // AlphaFold predictions
  alphaFoldPredictions: AlphaFoldData[];
  
  // Research data
  researchData: CuginiResearchData;
  
  // Metabolic profiles
  metabolicProfile?: MetabolicProfile;
  antibioticResistance?: AntibioticResistanceProfile;
  
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface PokedexEntryResponse {
  entry: MicrobialPokedexEntry;
}

export interface PokedexListResponse {
  entries: Array<{
    id: string;
    pokedexNumber: number;
    organism: {
      scientificName: string;
      commonName?: string;
    };
    nickname?: string;
    rarity: string;
    primaryHabitat?: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

// Filter options for querying
export interface PokedexFilters {
  rarity?: string;
  habitat?: string;
  metabolism?: string;
  minPathogenicity?: number;
  maxPathogenicity?: number;
  hasAlphaFoldData?: boolean;
  searchQuery?: string;
}
