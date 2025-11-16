import Link from "next/link";
import { OrganismGrid } from "../components/organism-grid";
import type { OrganismListResponse } from "../lib/api-types";
import { fetchFromApi } from "../lib/server-api";
import type { DatasetSummary, OmicDataset, SeededPayload } from "../lib/types";

function SummaryCards({ summary }: { summary: DatasetSummary }) {
  const layerEntries = Object.entries(summary.layerBreakdown).sort((a, b) => b[1] - a[1]);
  return (
    <div className="stat-grid">
      <article className="panel">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total datasets</p>
        <p className="text-4xl font-semibold text-sky-200">{summary.totalDatasets}</p>
        <p className="text-sm text-slate-400">Tracked multi-omics cohorts</p>
      </article>
      <article className="panel">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Samples harmonized</p>
        <p className="text-4xl font-semibold text-emerald-200">{summary.totalSamples}</p>
        <p className="text-sm text-slate-400">Across saliva, serum, plaque, and host assays</p>
      </article>
      <article className="panel">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Feature depth</p>
        <p className="text-4xl font-semibold text-indigo-200">{summary.totalFeatures.toLocaleString()}</p>
        <p className="text-sm text-slate-400">Genes, metabolites, taxa, and variants</p>
      </article>
      <article className="panel">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Layer coverage</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {layerEntries.map(([layer, count]) => (
            <span key={layer} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-200">
              {layer}
              <strong className="text-white">{count}</strong>
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

function DatasetTable({ datasets }: { datasets: OmicDataset[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
          <tr>
            <th align="left" className="px-4 py-3 font-normal">
              Dataset
            </th>
            <th align="left" className="px-4 py-3 font-normal">
              Layer
            </th>
            <th align="right" className="px-4 py-3 font-normal">
              Samples
            </th>
            <th align="right" className="px-4 py-3 font-normal">
              Features
            </th>
            <th align="left" className="px-4 py-3 font-normal">
              Last refresh
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-950/60">
          {datasets.map((dataset) => (
            <tr key={dataset.id} className="border-t border-white/5">
              <td className="px-4 py-4">
                <p className="font-semibold text-white">{dataset.name}</p>
                <p className="text-xs text-slate-500">{dataset.id}</p>
              </td>
              <td className="px-4 py-4 capitalize text-slate-200">{dataset.layer}</td>
              <td className="px-4 py-4 text-right text-slate-100">{dataset.sampleCount}</td>
              <td className="px-4 py-4 text-right text-slate-100">{dataset.featureCount.toLocaleString()}</td>
              <td className="px-4 py-4 text-slate-300">
                {new Date(dataset.lastUpdated).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Page() {
  const [datasetPayload, organismPayload] = await Promise.all([
    fetchFromApi<SeededPayload>("/api/datasets"),
    fetchFromApi<OrganismListResponse>("/api/organisms"),
  ]);

  const { summary, datasets } = datasetPayload;
  const organisms = organismPayload.organisms;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <section className="space-y-4">
        <p className="inline-flex rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.4em] text-slate-400">
          Research preview
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Oralytics Multi-Omics Explorer</h1>
          <p className="text-lg text-slate-300 md:max-w-3xl">
            A unified cockpit for our oral health programs. Interrogate metagenomic, transcriptomic, metabolomic, and host genomic
            layers side by side, surface cohort coverage gaps, and drill into organism dossiers without leaving the console.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Fleet telemetry</h2>
        <SummaryCards summary={summary} />
      </section>

      <section className="section-spacing">
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Organism dossiers</p>
              <h2 className="text-2xl font-semibold text-white">Genome scouting grid</h2>
            </div>
            <p className="text-sm text-slate-400">Cards link directly to organism and gene-specific pages.</p>
          </div>
        </div>
        <OrganismGrid organisms={organisms} />
      </section>

      <section className="section-spacing">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory</p>
            <h2 className="text-2xl font-semibold text-white">Dataset table</h2>
          </div>
          <p className="text-sm text-slate-400">Use the API at <code className="text-slate-200">/api/datasets</code> for notebooks.</p>
        </div>
        <DatasetTable datasets={datasets} />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-5 py-4">
          <div>
            <p className="font-semibold text-white">Need another layer?</p>
            <p className="text-sm text-slate-400">Run the ETL pipeline with an updated CSV, then re-seed to expose the data.</p>
          </div>
          <Link href="https://github.com/" className="text-sm font-semibold text-sky-300" target="_blank" rel="noreferrer">
            Contributor guide →
          </Link>
        </div>
      </section>
    </main>
  );
}
