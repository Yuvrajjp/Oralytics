import test from "node:test";
import assert from "node:assert/strict";
import { serializeGeneSummary } from "../lib/gene-serializers.js";

test("serializeGeneSummary includes chromosome lengths", () => {
  const payload = serializeGeneSummary({
    id: "gene-1",
    symbol: "GENE1",
    name: "Gene One",
    chromosome: {
      id: "chr-1",
      name: "Chromosome 1",
      lengthMb: 2.34,
    },
  });

  assert.equal(payload.chromosome.lengthMb, 2.34);
});
