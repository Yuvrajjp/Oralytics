# Oralytics Multi-Omics Explorer

The Oralytics explorer is our single pane of glass for every omics layer we are
collecting across oral-health cohorts. It pairs a Next.js experience with a
file-backed data mart so we can interrogate metagenomic, transcriptomic,
metabolomic, proteomic, and host genomic signals without waiting for a full
warehouse deployment.

## Product goals

1. **Unify visibility** – expose the current inventory of oral datasets,
   samples, and coverage across all layers.
2. **Shorten iteration loops** – let scientists land a new CSV drop, rerun ETL,
   and see it reflected in the UI and API within minutes.
3. **Stay reproducible** – every dataset snapshot is traceable back to the raw
   drop and the ETL parameters that generated it.

### Current feature set

- Landing page summarizing total datasets, harmonized samples, feature depth,
  and layer coverage sourced from the seeded JSON store (`app/page.tsx`).
- Live dataset inventory table that surfaces IDs, omic layers, sample counts,
  and freshness.
- `/api/datasets` route for downstream notebooks or dashboards needing the same
  payload as the UI.
- Minimal ETL + seeding scripts that transform `data/raw/omics.csv` into the
  JSON store consumed by the explorer.

## Project structure

```
├── app/
│   ├── api/datasets/route.ts   # Next.js Route Handler exposing seeded payloads
│   ├── layout.tsx              # Root metadata + global styles
│   ├── page.tsx                # Explorer UI built with server components
│   └── globals.css             # Dark theme styling shared across the app
├── lib/
│   ├── datasets.ts             # File-backed data access helpers
│   └── types.ts                # Shared dataset + summary interfaces
├── data/
│   ├── raw/omics.csv           # Source CSV drop from sequencing teams
│   ├── processed/datasets.json # ETL output (pre-seed)
│   └── seeded/datasets.json    # File the UI/API read from
├── scripts/
│   ├── etl.mjs                 # CSV → JSON transformer
│   └── seed.mjs                # Runs ETL and writes the seeded store
├── package.json                # npm scripts + tooling config
└── tsconfig.json               # TypeScript settings + path aliases
```

> **Note:** For local development we treat `data/seeded/datasets.json` as the
> "database". In production this wiring can point to a SQL instance or object
> store by replacing `lib/datasets.ts` with the appropriate client.

## Development workflow

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the ETL pipeline** – transforms `data/raw/omics.csv` into the processed
   JSON snapshot.
   ```bash
   npm run etl
   ```
3. **Seed the explorer store** – copies the processed payload into
   `data/seeded/datasets.json` and stamps it with `seededAt`.
   ```bash
   npm run seed
   ```
4. **Start the dev server**
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000` to explore the UI or fetch data from
   `http://localhost:3000/api/datasets`.

### Updating data

1. Drop a new CSV with the schema `dataset_id,dataset_name,omic_layer,samples,
   features,last_updated` into `data/raw/` (you can keep multiple revisions—just
   point `RAW_PATH` inside `scripts/etl.mjs` to whichever file you want to
   process).
2. Run `npm run etl` to regenerate `data/processed/datasets.json`.
3. Run `npm run seed` to refresh the file-backed store that powers the UI/API.
4. Commit the updated `data/raw`, `data/processed`, and `data/seeded` artifacts
   if you want the snapshot to be shareable with collaborators.

### API contract

`GET /api/datasets`

- **Response body**
  ```json
  {
    "datasets": [
      {
        "id": "dsx001",
        "name": "Oral microbiome baseline",
        "layer": "metagenomics",
        "sampleCount": 64,
        "featureCount": 15000,
        "lastUpdated": "2024-10-03"
      }
      // ...more datasets
    ],
    "summary": {
      "totalDatasets": 5,
      "totalSamples": 184,
      "totalFeatures": 868650,
      "layerBreakdown": {
        "metagenomics": 1,
        "transcriptomics": 1,
        "metabolomics": 1,
        "genomics": 1,
        "proteomics": 1
      }
    },
    "seededAt": "2025-11-16T15:01:26.923Z"
  }
  ```

## Contributor guide

### Testing & QA

- `npm run lint` – ESLint (Next.js config) covering `app/`, `lib/`, `scripts/`.
- Snapshot/UI testing is not wired up yet; prefer Storybook or Playwright when
  we start adding interactive components.

### Data & ETL validation

- Keep raw CSVs small and versioned to ensure ETL diffs stay reviewable.
- The ETL script is intentionally lightweight—extend `scripts/etl.mjs` when you
  need richer normalization (unit conversions, ontology mapping, etc.).

### Linting & formatting

- Rely on ESLint via `npm run lint` before opening a PR.
- Tailwind CSS v4 is available via PostCSS, but the current UI sticks to custom
  styles until we flesh out the component library.

### Deployment

1. `npm run build` to generate the Next.js production bundle.
2. `npm run start` to serve the built app locally or inside the container image.
3. Ensure `data/seeded/datasets.json` (or your backing database connection) is
   available in the deployment environment—the UI/API read directly from it.

### Future enhancements

- Swap the file-backed store with Postgres + Prisma while keeping
  `lib/datasets.ts` as the abstraction boundary.
- Add streaming ETL hooks so instrument teams can publish directly to the
  explorer via S3/object-store events.
- Layer on automated smoke tests (Playwright) to guard the dataset inventory and
  summary cards.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ENOENT: no such file or directory, open 'data/seeded/datasets.json'` | Run `npm run seed` after updating the raw CSV. |
| Dev server cannot find `fs` | Ensure components that call `lib/datasets` stay on the server (no `use client`). |
| API returns stale data | Regenerate the seeded JSON (`npm run seed`) or restart the dev server to clear file watchers. |

Have questions? Start with `lib/datasets.ts` to understand how data flows, then
open an issue/PR with your findings.
