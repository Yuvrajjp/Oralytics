import type { ChromosomeSummary, GeneSummary } from "./api-types";

interface ChromosomeLike {
  id: string;
  name: string;
  lengthMb: number | null | undefined;
}

interface GeneLike {
  id: string;
  symbol: string;
  name: string;
  description?: string | null;
  startPosition?: number | null;
  endPosition?: number | null;
  strand?: string | null;
  chromosome?: ChromosomeLike | null;
}

export function serializeChromosome(chromosome?: ChromosomeLike | null): ChromosomeSummary | null;
export function serializeGeneSummary(gene: GeneLike): GeneSummary;
