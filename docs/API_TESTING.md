# API verification checklist

Use these commands while `npm run dev` is running. Each request exercises one of the six organism/gene endpoints or the chat handler.

## 1. List organisms
```bash
curl -s http://localhost:3000/api/organisms | jq '.organisms | length'
```
Expect a non-zero length. The payload should include chromosome counts and highlighted genes.

## 2. Fetch a single organism
```bash
ORG_ID=$(curl -s http://localhost:3000/api/organisms | jq -r '.organisms[0].id')
curl -s "http://localhost:3000/api/organisms/$ORG_ID" | jq '.organism.scientificName'
```
A missing ID (e.g. `/api/organisms/does-not-exist`) should return HTTP 404.

## 3. List genes for an organism
```bash
curl -s "http://localhost:3000/api/organisms/$ORG_ID/genes" | jq '.genes | length'
```
Passing an empty `ORG_ID` reproduces the 400 validation error.

## 4. Fetch a single gene
```bash
GENE_ID=$(curl -s "http://localhost:3000/api/organisms/$ORG_ID/genes" | jq -r '.genes[0].id')
curl -s "http://localhost:3000/api/organisms/$ORG_ID/genes/$GENE_ID" | jq '.gene.organism.scientificName'
```
Using an invalid gene ID should return HTTP 404.

## 5. Combined search
```bash
curl -s "http://localhost:3000/api/search?q=mutans" | jq '{organisms: .organisms | length, genes: .genes | length}'
```
Omitting the `q` parameter should yield HTTP 400.

## 6. Chat endpoint
```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Summarize virulence","context":"Organism Streptococcus mutans"}' | jq '.'
```
Verify that the response contains both `reply` and `citations` fields.
