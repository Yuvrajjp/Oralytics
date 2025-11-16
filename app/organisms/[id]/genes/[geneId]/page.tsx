import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPanel } from "../../../../../components/chat-panel";
import type { GeneDetailResponse } from "../../../../../lib/api-types";
import { formatOrganismDisplayName } from "../../../../../lib/organism-display";
import { ApiError, fetchFromApi } from "../../../../../lib/server-api";

interface PageParams {
  params: { id: string; geneId: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const { gene } = await fetchFromApi<GeneDetailResponse>(`/api/organisms/${params.id}/genes/${params.geneId}`);
    return {
      title: `${gene.symbol} | ${gene.organism.scientificName}`,
      description: gene.description ?? undefined,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Gene not found" };
    }
    throw error;
  }
}

export default async function GenePage({ params }: PageParams) {
  let payload: GeneDetailResponse;
  try {
    payload = await fetchFromApi<GeneDetailResponse>(`/api/organisms/${params.id}/genes/${params.geneId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const gene = payload.gene;
  const organism = gene.organism;
  const organismDisplayName = formatOrganismDisplayName(organism);

  const coordinateSummary = gene.startPosition && gene.endPosition
    ? `${gene.startPosition.toLocaleString()} – ${gene.endPosition.toLocaleString()}`
    : "Not annotated";

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <nav className="text-xs uppercase tracking-[0.3em] text-slate-500">
        <Link href="/" className="text-slate-400 hover:text-sky-300">
          Home
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href={`/organisms/${organism.id}`} className="text-slate-400 hover:text-sky-300">
          {organismDisplayName}
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-slate-200">{gene.name}</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Gene dossier</p>
        <h1 className="text-4xl font-semibold text-white">{gene.symbol}</h1>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{gene.name}</p>
        <p className="text-base text-slate-300">{gene.description ?? "No description captured."}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Coordinates</p>
          <p className="text-lg font-semibold text-white">{coordinateSummary}</p>
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Strand</p>
          <p className="text-lg font-semibold text-white">{gene.strand ?? "—"}</p>
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chromosome</p>
          {gene.chromosome ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-white">{gene.chromosome.name}</p>
              <p className="text-sm text-slate-400">
                {gene.chromosome.lengthMb != null
                  ? `${gene.chromosome.lengthMb.toFixed(2)} Mb`
                  : "Length unavailable"}
              </p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-white">—</p>
          )}
        </article>
        <article className="panel">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Linked proteins</p>
          <p className="text-lg font-semibold text-white">{gene.proteins.length}</p>
        </article>
      </section>

      <section className="section-spacing space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Proteins</p>
        {gene.proteins.length === 0 ? (
          <p className="text-sm text-slate-400">No proteins associated with this gene.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
                <tr>
                  <th align="left" className="px-4 py-3 font-normal">Accession</th>
                  <th align="left" className="px-4 py-3 font-normal">Name</th>
                  <th align="left" className="px-4 py-3 font-normal">Localization</th>
                </tr>
              </thead>
              <tbody className="bg-slate-950/60">
                {gene.proteins.map((protein) => (
                  <tr key={protein.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-sky-300">{protein.accession}</td>
                    <td className="px-4 py-3 text-white">{protein.name}</td>
                    <td className="px-4 py-3 text-slate-300">{protein.localization ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-spacing space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Literature</p>
        {gene.articles.length === 0 ? (
          <p className="text-sm text-slate-400">No linked articles yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gene.articles.map((article) => (
              <a
                key={article.id}
                href={article.url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-400"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {article.journal ?? "Journal"} • {article.publishedAt ?? "Year"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{article.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{article.summary ?? article.keyFinding ?? "No abstract."}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      <ChatPanel
        context={`Gene ${gene.symbol} from ${organism.scientificName}. Coordinates: ${coordinateSummary}. Proteins: ${gene.proteins
          .map((protein) => protein.accession)
          .join(", ") || "none"}.`}
      />
    </main>
  );
}
