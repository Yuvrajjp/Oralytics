import test from "node:test";
import assert from "node:assert/strict";
import { formatOrganismDisplayName } from "../lib/organism-display.js";

test("includes common name when available", () => {
  const result = formatOrganismDisplayName({
    scientificName: "Escherichia coli",
    commonName: "E. coli",
  });

  assert.equal(result, "Escherichia coli (E. coli)");
});

test("falls back to scientific name when common name missing", () => {
  const result = formatOrganismDisplayName({
    scientificName: "Arabidopsis thaliana",
  });

  assert.equal(result, "Arabidopsis thaliana");
});

test("falls back to common name when scientific name missing", () => {
  const result = formatOrganismDisplayName({
    scientificName: "",
    commonName: "Human",
  });

  assert.equal(result, "Human");
});

test("indicates missing labels when neither name provided", () => {
  const result = formatOrganismDisplayName({
    scientificName: "",
    commonName: "",
  });

  assert.equal(result, "Unknown organism");
});
