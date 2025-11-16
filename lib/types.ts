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
