import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPanel } from "../../../../components/chat-panel";
import { getOrganismById } from "../../../../lib/organisms";

interface PageParams {
  params: { id: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const organism = await getOrganismById(params.id);
  if (!organism) {
    return { title: "Organism not found" };
  }
  return {
    title: `${organism.name} | Oralytics`,
    description: organism.description,
  };
}

export default async function OrganismPage({ params }: PageParams) {
  const organism = await getOrganismById(params.id);
  if (!organism) {
    notFound();
  }

  const stats = [
    { label: "Genome size", value: `${organism.genomeSizeMb.toFixed(2)} Mb` },
    { label: "GC content", value: `${organism.gcContent.toFixed(1)}%` },
    { label: "Chromosomes", value: organism.chromosomeCount },
    { label: "Annotated genes", value: organism.genes.length },
  ];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Organism dossier</p>
        <h1 className="text-4xl font-semibold text-white">{organism.name}</h1>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{organism.aliases.join(" • ")}</p>
        <p className="text-base text-slate-300 md:max-w-3xl">{organism.description}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="panel">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="section-spacing">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Taxonomy</p>
            <dl className="mt-3 space-y-2 text-sm text-slate-300">
              {Object.entries(organism.taxonomy).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                  <dt className="capitalize text-slate-400">{key}</dt>
                  <dd className="font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Habitats & stress markers</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {organism.habitats.map((habitat) => (
                <span key={habitat} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
                  {habitat}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {organism.stressMarkers.map((marker) => (
                <span key={marker} className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
                  {marker}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Genome overview</p>
          <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10">
            {organism.genomeSegments.map((segment) => (
              <div
                key={segment.label}
                className="h-full"
                style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
                title={segment.annotation}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {organism.genomeSegments.map((segment) => (
            <article key={segment.label} className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-white">{segment.label}</p>
              <p className="text-xs text-slate-400">{segment.annotation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-spacing space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gene table</p>
            <h2 className="text-2xl font-semibold text-white">Highlighted loci</h2>
          </div>
          <p className="text-sm text-slate-400">Select a gene to inspect expression, motifs, and literature.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
              <tr>
                <th align="left" className="px-4 py-3 font-normal">Gene</th>
                <th align="left" className="px-4 py-3 font-normal">Function</th>
                <th align="left" className="px-4 py-3 font-normal">Essentiality</th>
                <th align="left" className="px-4 py-3 font-normal">Context</th>
              </tr>
            </thead>
            <tbody className="bg-slate-950/60">
              {organism.genes.map((gene) => (
                <tr key={gene.id} className="border-t border-white/5">
                  <td className="px-4 py-4 text-white">
                    <Link href={`/organisms/${organism.id}/genes/${gene.id}`} className="font-semibold text-sky-300 hover:underline">
                      {gene.name}
                    </Link>
                    <p className="text-xs text-slate-500">{gene.locus}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-200">{gene.functionalClass}</td>
                  <td className="px-4 py-4 text-slate-200">{gene.essentiality}</td>
                  <td className="px-4 py-4 text-slate-300">{gene.genomicContext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sequence snippets</p>
        <div className="grid gap-4 md:grid-cols-2">
          {organism.sequenceSnippets.map((snippet) => (
            <article key={snippet.label} className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-white">{snippet.label}</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-200">{snippet.sequence}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">{snippet.coverage}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Linked literature</p>
        <div className="grid gap-4 md:grid-cols-2">
          {organism.linkedArticles.map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-400"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {article.journal} • {article.year}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{article.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{article.summary}</p>
            </a>
          ))}
        </div>
      </section>

      <ChatPanel
        context={`Organism ${organism.name} (${organism.id}). Key genes: ${organism.genes
          .slice(0, 3)
          .map((gene) => gene.name)
          .join(", ")}. Habitats: ${organism.habitats.join(", ")}.`}
      />
    </main>
  );
}
