import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPanel } from "../../../../../components/chat-panel";
import { getGeneWithOrganism } from "../../../../../lib/organisms";

interface PageParams {
  params: { id: string; geneId: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const payload = await getGeneWithOrganism(params.id, params.geneId);
  if (!payload) {
    return { title: "Gene not found" };
  }
  return {
    title: `${payload.gene.name} | ${payload.organism.name}`,
    description: payload.gene.annotations.join("; "),
  };
}

export default async function GenePage({ params }: PageParams) {
  const payload = await getGeneWithOrganism(params.id, params.geneId);
  if (!payload) {
    notFound();
  }

  const { organism, gene } = payload;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <nav className="text-xs uppercase tracking-[0.3em] text-slate-500">
        <Link href="/" className="text-slate-400 hover:text-sky-300">
          Home
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href={`/organisms/${organism.id}`} className="text-slate-400 hover:text-sky-300">
          {organism.name}
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{gene.name}</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Gene dossier</p>
        <h1 className="text-4xl font-semibold text-white">{gene.name}</h1>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{gene.locus}</p>
        <p className="text-base text-slate-300">{gene.product}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Length</p>
          <p className="text-2xl font-semibold text-white">{gene.lengthAa} aa</p>
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Functional class</p>
          <p className="text-lg font-semibold text-white">{gene.functionalClass}</p>
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Essentiality</p>
          <p className="text-lg font-semibold text-white">{gene.essentiality}</p>
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Context</p>
          <p className="text-lg font-semibold text-white">{gene.genomicContext}</p>
        </article>
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expression signatures</p>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
              <tr>
                <th align="left" className="px-4 py-3 font-normal">
                  Condition
                </th>
                <th align="right" className="px-4 py-3 font-normal">
                  log2FC
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-950/60">
              {gene.expression.map((record) => (
                <tr key={record.condition} className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-200">{record.condition}</td>
                  <td className="px-4 py-3 text-right text-white">{record.log2FoldChange.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Annotations & motifs</p>
        <ul className="list-disc space-y-2 pl-6 text-sm text-slate-200">
          {gene.annotations.map((annotation) => (
            <li key={annotation}>{annotation}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {gene.motifs.map((motif) => (
            <span key={motif} className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              {motif}
            </span>
          ))}
        </div>
      </section>

      <section className="section-spacing space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Coding sequence</p>
        <pre className="whitespace-pre-wrap break-all rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-xs text-slate-100">
{gene.sequence}
        </pre>
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gene-specific literature</p>
        <div className="grid gap-4 md:grid-cols-2">
          {gene.linkedArticles.map((article) => (
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
        context={`Gene ${gene.name} (${gene.locus}) from ${organism.name}. Class: ${gene.functionalClass}. Key motifs: ${gene.motifs.join(", ")}.`}
      />
    </main>
  );
}
