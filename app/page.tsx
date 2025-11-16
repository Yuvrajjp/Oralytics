import { getSeededData } from "../lib/datasets";
import type { DatasetSummary, OmicDataset } from "../lib/types";

function SummaryCards({ summary }: { summary: DatasetSummary }) {
  const layerEntries = Object.entries(summary.layerBreakdown).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="card-grid">
      <article className="card">
        <h3>Total Datasets</h3>
        <p className="highlight" style={{ fontSize: "2.5rem", margin: 0 }}>
          {summary.totalDatasets}
        </p>
        <p>Tracked multi-omics cohorts</p>
      </article>
      <article className="card">
        <h3>Samples Harmonized</h3>
        <p className="highlight" style={{ fontSize: "2.2rem", margin: 0 }}>
          {summary.totalSamples}
        </p>
        <p>Across saliva, serum, plaque, and host assays</p>
      </article>
      <article className="card">
        <h3>Feature Depth</h3>
        <p className="highlight" style={{ fontSize: "2.2rem", margin: 0 }}>
          {summary.totalFeatures.toLocaleString()}
        </p>
        <p>Genes, metabolites, taxa, and variants</p>
      </article>
      <article className="card" style={{ gridColumn: "span 3" }}>
        <h3>Layer Coverage</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {layerEntries.map(([layer, count]) => (
            <span className="badge" key={layer}>
              {layer}
              <strong>{count}</strong>
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

function DatasetTable({ datasets }: { datasets: OmicDataset[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th align="left">Dataset</th>
          <th align="left">Layer</th>
          <th align="right">Samples</th>
          <th align="right">Features</th>
          <th align="left">Last Refresh</th>
        </tr>
      </thead>
      <tbody>
        {datasets.map((dataset) => (
          <tr key={dataset.id}>
            <td>
              <strong>{dataset.name}</strong>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>{dataset.id}</div>
            </td>
            <td>{dataset.layer}</td>
            <td align="right">{dataset.sampleCount}</td>
            <td align="right">{dataset.featureCount.toLocaleString()}</td>
            <td>{new Date(dataset.lastUpdated).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function Page() {
  const { datasets, summary } = await getSeededData();

  return (
    <main>
      <section>
        <p className="badge">Research preview</p>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>
          Oralytics Multi-Omics Explorer
        </h1>
        <p style={{ maxWidth: "720px", lineHeight: 1.7 }}>
          A unified cockpit for our oral health programs. Interrogate metagenomic,
          transcriptomic, metabolomic, and host genomic layers side by side,
          spot multi-modal biomarkers faster, and surface cohort coverage gaps
          before we run the next sequencing batch.
        </p>
      </section>

      <section>
        <SummaryCards summary={summary} />
      </section>

      <section>
        <h2>Dataset inventory</h2>
        <p style={{ maxWidth: "650px" }}>
          Live view of every cohort we have harmonized so far. Use the API route at
          <code> /api/datasets </code> for downstream modeling notebooks or to feed
          the internal reporting dashboards.
        </p>
        <DatasetTable datasets={datasets} />
      </section>

      <section className="cta-bar">
        <div>
          <strong>Need another layer?</strong>
          <p style={{ margin: "0.25rem 0 0" }}>
            Run the ETL pipeline with an updated CSV, then re-seed to expose the
            data through the explorer.
          </p>
        </div>
        <a href="https://github.com/" rel="noreferrer" target="_blank">
          Contributor guide →
        </a>
      </section>
    </main>
  );
}
