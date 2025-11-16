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
2. **Configure Postgres access** – Duplicate `.env.example` into `.env` and ensure `DATABASE_URL` targets a database you control.
3. **Run the Prisma migrations** – Creates the organism/gene schema and updates the generated client.
   ```bash
   npm run db:migrate
   ```
4. **Seed sample organisms** – Populates Postgres with the canonical Streptococcus mutans, Porphyromonas gingivalis, and Candida albicans data found in `prisma/seed.ts`.
   ```bash
   npm run db:seed
   ```
5. **Start the development server** – Serves the landing page, organism dossiers, and API routes on `http://localhost:3000`.
   ```bash
   npm run dev
   ```
6. (Optional) **Refresh the dataset inventory JSON** – If you edit `data/raw/omics.csv`, run `npm run etl && npm run seed` to regenerate `data/seeded/datasets.json` so `/api/datasets` stays in sync.

## API routes & chat mock

| Route | Method | Description |
| --- | --- | --- |
| `/api/datasets` | `GET` | Returns the seeded dataset inventory plus summary stats from `data/seeded/datasets.json`. The landing page and any downstream notebooks reuse this payload. |
| `/api/chat` | `POST` | Accepts `{ prompt, context }` and responds with a deterministic string that echos the supplied context. This mock powers the `ChatPanel` component rendered on organism and gene dossiers so UX flows can be validated before wiring a real model. |

The chat mock is intentionally simple: `components/chat-panel.tsx` keeps a local message history, disables the send button while awaiting `/api/chat`, and surfaces errors when the endpoint is unreachable. Swap `/api/chat` with your preferred model endpoint once security reviews are complete.

## Notes on querying organisms & genes

- `lib/queries.ts` contains helpers (`listOrganisms`, `listGenes`, `listProteins`, `listArticles`) that wrap Prisma calls with filtering hooks for organism ID, chromosome ID, or search text. Use these when building new route handlers or server actions so you benefit from the shared include/select clauses.
- `app/organisms/[id]/page.tsx` and `app/organisms/[id]/genes/[geneId]/page.tsx` hydrate UI panels with organism metadata, highlighted genes, expression tables, and chat context derived from Postgres plus the supporting JSON stores in `data/seeded/`. These pages demonstrate how to compose Prisma-backed queries with the chat assistant to keep scientists inside a single workspace.

Happy exploring!
