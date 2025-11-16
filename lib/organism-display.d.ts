export interface OrganismLike {
  scientificName: string;
  commonName?: string | null;
}

export declare function formatOrganismDisplayName(organism: OrganismLike): string;
