export interface ChromosomeSummary {
  id: string;
  name: string;
  lengthMb: number | null;
}

export interface HighlightedGene {
  id: string;
  symbol: string;
}

export interface OrganismSummary {
  id: string;
  scientificName: string;
  commonName: string | null;
  habitat: string | null;
  description: string | null;
  genomeSizeMb: number | null;
  chromosomeCount: number;
  geneCount: number;
  chromosomes: ChromosomeSummary[];
  highlightedGenes: HighlightedGene[];
}

export interface OrganismListResponse {
  organisms: OrganismSummary[];
}

export interface OrganismDetail extends OrganismSummary {
  taxonomyId: number | null;
}

export interface OrganismDetailResponse {
  organism: OrganismDetail;
}

export interface GeneSummary {
  id: string;
  symbol: string;
  name: string;
  description: string | null;
  startPosition: number | null;
  endPosition: number | null;
  strand: string | null;
  chromosome: ChromosomeSummary | null;
}

export interface GeneListResponse {
  organism: {
    id: string;
    scientificName: string;
    commonName: string | null;
  };
  genes: GeneSummary[];
}

export interface ProteinInfo {
  id: string;
  accession: string;
  name: string;
  description: string | null;
  sequenceLength: number | null;
  molecularWeight: number | null;
  localization: string | null;
}

export interface ArticleInfo {
  id: string;
  title: string;
  journal: string | null;
  doi: string | null;
  url: string | null;
  summary: string | null;
  publishedAt: string | null;
  keyFinding: string | null;
  relevanceScore: number | null;
}

export interface GeneDetail extends GeneSummary {
  organism: {
    id: string;
    scientificName: string;
    commonName: string | null;
  };
  proteins: ProteinInfo[];
  articles: ArticleInfo[];
}

export interface GeneDetailResponse {
  gene: GeneDetail;
}

export interface SearchResponse {
  query: string;
  organisms: Array<{
    id: string;
    scientificName: string;
    commonName: string | null;
    habitat: string | null;
    geneCount: number;
  }>;
  genes: Array<{
    id: string;
    symbol: string;
    name: string;
    description: string | null;
    organism: {
      id: string;
      scientificName: string;
      commonName: string | null;
    };
  }>;
}

export interface ChatResponse {
  reply: string;
  citations: string[];
}
