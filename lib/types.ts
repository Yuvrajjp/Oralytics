export type OmicLayer =
  | "metagenomics"
  | "transcriptomics"
  | "metabolomics"
  | "genomics"
  | "proteomics";

export interface OmicDataset {
  id: string;
  name: string;
  layer: OmicLayer;
  sampleCount: number;
  featureCount: number;
  lastUpdated: string;
  description?: string;
}

export interface DatasetSummary {
  totalDatasets: number;
  totalSamples: number;
  totalFeatures: number;
  layerBreakdown: Record<string, number>;
}

export interface SeededPayload {
  datasets: OmicDataset[];
  summary: DatasetSummary;
  seededAt: string;
}

export interface Taxonomy {
  domain: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
}

export interface GenomeSegment {
  label: string;
  percentage: number;
  color: string;
  annotation: string;
}

export interface SequenceSnippet {
  label: string;
  sequence: string;
  coverage: string;
}

export interface LiteratureLink {
  title: string;
  journal: string;
  year: number;
  url: string;
  summary: string;
}

export interface GeneExpressionRecord {
  condition: string;
  log2FoldChange: number;
}

export interface Gene {
  id: string;
  name: string;
  locus: string;
  lengthAa: number;
  product: string;
  essentiality: string;
  functionalClass: string;
  expression: GeneExpressionRecord[];
  annotations: string[];
  sequence: string;
  motifs: string[];
  linkedArticles: LiteratureLink[];
  genomicContext: string;
}

export interface Organism {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  taxonomy: Taxonomy;
  genomeSizeMb: number;
  gcContent: number;
  chromosomeCount: number;
  habitats: string[];
  stressMarkers: string[];
  genomeSegments: GenomeSegment[];
  sequenceSnippets: SequenceSnippet[];
  linkedArticles: LiteratureLink[];
  genes: Gene[];
}
