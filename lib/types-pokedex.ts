// Type definitions for various entities related to microbial analysis

export interface MicrobialEntry {
    id: string;
    name: string;
    taxonomy: string;
    genomes: string[];
    annotations: string;
    dateDiscovered: Date;
}

export interface GeneToProteinMapping {
    geneId: string;
    proteinId: string;
    organism: string;
    functionalAnnotation: string;
}

export interface AlphaFoldData {
    proteinId: string;
    structure: string;
    score: number;
    confidenceMeasures: Record<string, number>;
}

export interface ConfidenceRegion {
    start: number;
    end: number;
    description: string;
}

export interface CuginiResearchMetrics {
    publicationCount: number;
    citationCount: number;
    impactFactor: number;
}

export interface VirulenceFactor {
    factorId: string;
    description: string;
    associatedPathogens: string[];
}

export interface MetabolicProfile {
    organismId: string;
    pathways: string[];
    metabolites: Record<string, number>;
}

export interface ResistanceProfile {
    antimicrobialAgent: string;
    resistanceLevel: string;
    testedStrains: string[];
}