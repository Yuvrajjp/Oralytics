# Oralytics Multi-Omics Explorer

Oralytics now centers on organism and gene intelligence. Each dossier in `app/organisms` pulls Postgres records through Prisma, then layers sequencing metadata, stress markers, expression matrices, and literature call-outs. The landing page still summarizes datasets, but those cards sit next to organism grids and drill-down gene pages wired to the same datastore. A lightweight chat surface injects page-specific context into `/api/chat`, letting scientists sketch follow-up assays without leaving the dossier.

## Stack overview

- **Next.js 15 + React 19** – App Router pages (`app/page.tsx`, `app/organisms/...`) and route handlers for the API.
- **Prisma + PostgreSQL** – Schema lives in `prisma/schema.prisma`; `lib/db.ts` and `lib/queries.ts` expose typed accessors for organisms, genes, proteins, and supporting articles.
- **File-backed dataset inventory** – `lib/datasets.ts` hydrates the landing metrics and `/api/datasets` from `data/seeded/datasets.json` until the warehouse migration is complete.
- **Chat-enabled UI** – `components/chat-panel.tsx` posts prompts to `/api/chat`, which currently returns a deterministic mock response while we scope model integration.

## Project structure

```
├── app/
│   ├── page.tsx                    # Landing page with dataset stats + organism grid
│   ├── organisms/
│   │   └── [id]/                   # Organism dossiers (plus nested gene pages)
│   │       ├── page.tsx            # Genome + literature overview and chat hook
│   │       └── genes/[geneId]/page.tsx  # Expression tables, motifs, CDS, chat
│   └── api/
│       ├── datasets/route.ts       # Serves seeded dataset inventory JSON
│       └── chat/route.ts           # Receives chat prompts and returns mock replies
├── components/
│   ├── organism-grid.tsx           # Cards linking into organism dossiers
│   └── chat-panel.tsx              # Client component driving the chat mock
├── lib/
│   ├── db.ts                       # Prisma client w/ dev-mode singleton
│   ├── queries.ts                  # Organism/gene/protein/article query helpers
│   ├── organisms.ts                # File-backed organism summaries for the UI
│   └── datasets.ts                 # Dataset + summary readers for `/api/datasets`
├── prisma/
│   ├── schema.prisma               # Organism, chromosome, gene, protein, article models
│   ├── migrations/                 # Auto-generated SQL from `prisma migrate`
│   └── seed.ts                     # Seeds the sample organisms, genes, proteins, articles
├── data/seeded/                    # JSON payloads read by lib/organisms + lib/datasets
└── scripts/                        # Legacy CSV → JSON ETL for the dataset table
```

## Environment variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string consumed by Prisma (`prisma/schema.prisma`, `lib/db.ts`). | `postgresql://postgres:postgres@localhost:5432/oralytics?schema=public` |

Copy `.env.example` to `.env` and update the credentials for your local or hosted database before running Prisma commands.

## npm scripts

| Script | Purpose |
| --- | --- |
| `npm run db:migrate` | Executes `prisma migrate dev` to apply the latest schema to your Postgres instance and regenerate the client. |
| `npm run db:seed` | Runs `prisma db seed` (backed by `prisma/seed.ts`) to insert the Streptococcus, Porphyromonas, and Candida organisms with their highlighted genes, proteins, and article relationships. |
| `npm run dev` | Starts the Next.js development server (`next dev`). |
| `npm run db:generate` | Regenerates the Prisma client after schema edits without applying migrations. |
| `npm run db:deploy` | Applies pending migrations in environments where `prisma migrate dev` is unavailable (CI/CD, production). |
| `npm run etl` / `npm run seed` | Legacy scripts that refresh `data/seeded/datasets.json` from CSV when you want to update the dataset inventory shown on the homepage and `/api/datasets`. |

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure Postgres access** – Duplicate `.env.example` into `.env`, fill in `DATABASE_URL`, and verify the target database exists before proceeding.
3. **Apply the Prisma schema** – Creates or updates the organism/gene tables defined in `prisma/schema.prisma` and regenerates the Prisma client.
   ```bash
   npm run db:migrate
   ```
4. **Seed sample organisms & genes** – Executes `prisma/seed.ts` so the Streptococcus, Porphyromonas, and Candida records (plus chromosomes, genes, proteins, and articles) are ready for the UI and API routes.
   ```bash
   npm run db:seed
   ```
5. **Start the development server** – Serves the landing page, organism dossiers, and API routes on `http://localhost:3000`.
   ```bash
   npm run dev
   ```

## Prisma schema & API routes

`prisma/schema.prisma` defines six models that power every organism- and gene-facing feature:

- **Organism** → scientific & common names, taxonomy IDs, descriptive metadata.
- **Chromosome** → size + organism linkage that scopes downstream gene queries.
- **Gene** → genomic coordinates, strandedness, and per-organism unique symbols.
- **Protein** → translations from each gene with accession numbers and metadata.
- **Article** + **GeneArticle** → publications and relevance scores tied to the genes they reference.

These models feed the following API routes:

| Route | Method | Description |
| --- | --- | --- |
| `/api/organisms` | `GET` | Lists organisms with chromosome counts, highlighted genes, and rollup stats from Prisma. |
| `/api/organisms/[organismId]` | `GET` | Returns a single organism plus chromosomes, spotlight genes, proteins, and linked articles. |
| `/api/organisms/[organismId]/genes` | `GET` | Lists genes for a selected organism with pagination/search query params backed by `lib/queries.ts`. |
| `/api/organisms/[organismId]/genes/[geneId]` | `GET` | Fetches a specific gene plus its proteins and supporting literature. |
| `/api/search` | `GET` | Performs a combined organism + gene lookup sourced from Prisma. |
| `/api/datasets` | `GET` | Still serves the JSON dataset summary used on the landing page; see “Legacy dataset summary” below. |
| `/api/chat` | `POST` | Echo-based mock that lets the organism/gene dossiers exercise the chat UI until a real model endpoint is integrated. |

The chat mock is intentionally simple: `components/chat-panel.tsx` keeps a local message history, disables the send button while awaiting `/api/chat`, and surfaces errors when the endpoint is unreachable. Swap `/api/chat` with your preferred model endpoint once security reviews are complete.

## Refreshing Prisma sample data

Need to tweak the default organisms or gene annotations?

1. Edit `prisma/seed.ts` to update the organisms, chromosomes, genes, proteins, or article relationships.
2. Run `npm run db:seed` (or `npx prisma db seed`) to wipe and reinsert the canonical sample data into the Postgres instance defined by `DATABASE_URL`.
3. If the schema changed, run `npm run db:migrate` first to generate/apply a new migration before reseeding.

Because the UI and API routes read exclusively from Prisma, you must run both `prisma migrate dev` and `prisma db seed` when onboarding a new environment or after altering the schema/seed script.

## Legacy dataset summary

`lib/datasets.ts` and `/api/datasets` still hydrate the landing-page dataset cards from `data/seeded/datasets.json`. This legacy JSON pipeline only covers the high-level dataset summary—organisms, genes, proteins, and articles **must** come from Postgres via Prisma for the app to function.

## Notes on querying organisms & genes

- `lib/queries.ts` contains helpers (`listOrganisms`, `listGenes`, `listProteins`, `listArticles`) that wrap Prisma calls with filtering hooks for organism ID, chromosome ID, or search text. Use these when building new route handlers or server actions so you benefit from the shared include/select clauses.
- `app/organisms/[id]/page.tsx` and `app/organisms/[id]/genes/[geneId]/page.tsx` hydrate UI panels with organism metadata, highlighted genes, expression tables, and chat context derived from Postgres plus the supporting JSON stores in `data/seeded/`. These pages demonstrate how to compose Prisma-backed queries with the chat assistant to keep scientists inside a single workspace.

Happy exploring!
