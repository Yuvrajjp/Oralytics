function serializeChromosome(chromosome) {
  if (!chromosome) {
    return null;
  }

  return {
    id: chromosome.id,
    name: chromosome.name,
    lengthMb: chromosome.lengthMb ?? null,
  };
}

function serializeGeneSummary(gene) {
  return {
    id: gene.id,
    symbol: gene.symbol,
    name: gene.name,
    description: gene.description ?? null,
    startPosition: gene.startPosition ?? null,
    endPosition: gene.endPosition ?? null,
    strand: gene.strand ?? null,
    chromosome: serializeChromosome(gene.chromosome ?? null),
  };
}

export { serializeChromosome, serializeGeneSummary };
