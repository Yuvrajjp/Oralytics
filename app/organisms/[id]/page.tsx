import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPanel } from "@/components/chat-panel";
import OrganismModel from "@/components/organism-model";
import TreeLineage from "@/components/tree-lineage";
import type { GeneListResponse, OrganismDetailResponse } from "@/lib/api-types";
import { ApiError, fetchFromApi } from "@/lib/server-api";

interface PageParams {
  params: { id: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  // In newer Next.js canary builds `params` may be a Promise — unwrap it first.
  const resolvedParams = (await params) as { id: string };
  try {
    const { organism } = await fetchFromApi<OrganismDetailResponse>(`/api/organisms/${resolvedParams.id}`);
    return {
      title: `${organism.scientificName} | Oralytics`,
      description: organism.description ?? undefined,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Organism not found" };
    }
    throw error;
  }
}

export default async function OrganismPage({ params }: PageParams) {
  // `params` can be a Promise in some Next canary versions — await it before use.
  const { id } = (await params) as { id: string };
  let organismPayload: OrganismDetailResponse;
  let genesPayload: GeneListResponse;

  try {
    [organismPayload, genesPayload] = await Promise.all([
      fetchFromApi<OrganismDetailResponse>(`/api/organisms/${id}`),
      fetchFromApi<GeneListResponse>(`/api/organisms/${id}/genes`),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const organism = organismPayload.organism;
  const genes = genesPayload.genes;

  const stats = [
    { label: "Genome size", value: organism.genomeSizeMb ? `${organism.genomeSizeMb.toFixed(2)} Mb` : "N/A" },
    { label: "Chromosomes", value: organism.chromosomeCount },
    { label: "Annotated genes", value: organism.geneCount },
    { label: "Taxonomy ID", value: organism.taxonomyId ?? "N/A" },
  ];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col items-center text-center">
        <div className="mb-6 h-48 w-48">
          <OrganismModel species={organism.scientificName} spin />
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Organism dossier</p>
        <h1 className="text-4xl font-semibold text-white">{organism.scientificName}</h1>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{organism.commonName ?? "Research isolate"}</p>
        <p className="mt-4 text-base text-slate-300 md:max-w-3xl">{organism.description ?? "No description captured."}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="panel">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-6">
          <h3 className="text-lg font-semibold text-white">Traits</h3>
          <p className="mt-3 text-sm text-slate-400">Gram status: {organism.gramStain ?? "Unknown"}</p>
          <p className="text-sm text-slate-400">Shape: {organism.shape ?? "Unknown"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-6">
          <h3 className="text-lg font-semibold text-white">Habitat</h3>
          <p className="mt-3 text-sm text-slate-400">Oral sites: {organism.habitat ?? "General oral cavity"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-6">
          <h3 className="text-lg font-semibold text-white">Rarity</h3>
          <p className="mt-3 text-sm text-slate-400">{organism.rarity ?? "Common"}</p>
        </div>
      </section>

      <TreeLineage lineage={organism.lineage ?? []} />

      <section className="section-spacing space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chromosomes</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {organism.chromosomes.map((chromosome) => (
              <article key={chromosome.id} className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                <p className="text-sm font-semibold text-white">{chromosome.name}</p>
                <p className="text-xs text-slate-400">
                  {chromosome.lengthMb ? `${chromosome.lengthMb.toFixed(2)} Mb` : "Length unavailable"}
                </p>
              </article>
            ))}
            {organism.chromosomes.length === 0 && (
              <p className="text-sm text-slate-400">No chromosomes recorded for this isolate.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section-spacing space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gene table</p>
            <h2 className="text-2xl font-semibold text-white">Highlighted loci</h2>
          </div>
          <p className="text-sm text-slate-400">Select a gene to inspect coordinates, proteins, and literature.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-400">
              <tr>
                <th align="left" className="px-4 py-3 font-normal">Gene</th>
                <th align="left" className="px-4 py-3 font-normal">Description</th>
                <th align="left" className="px-4 py-3 font-normal">Chromosome</th>
                <th align="left" className="px-4 py-3 font-normal">Coordinates</th>
              </tr>
            </thead>
            <tbody className="bg-slate-950/60">
              {genes.map((gene) => (
                <tr key={gene.id} className="border-t border-white/5">
                  <td className="px-4 py-4 text-white">
                    <Link href={`/organisms/${organism.id}/genes/${gene.id}`} className="font-semibold text-sky-300 hover:underline">
                      {gene.symbol}
                    </Link>
                    <p className="text-xs text-slate-500">{gene.name}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-200">{gene.description ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-200">
                    {gene.chromosome ? (
                      <div className="space-y-0.5">
                        <p>{gene.chromosome.name}</p>
                        <p className="text-xs text-slate-500">
                          {gene.chromosome.lengthMb != null
                            ? `${gene.chromosome.lengthMb.toFixed(2)} Mb`
                            : "Length unavailable"}
                        </p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {gene.startPosition && gene.endPosition
                      ? `${gene.startPosition.toLocaleString()}-${gene.endPosition.toLocaleString()}`
                      : "—"}
                  </td>
                </tr>
              ))}
              {genes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                    No genes recorded for this organism.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ChatPanel
        context={`Organism ${organism.scientificName} (${organism.id}). Habitat: ${organism.habitat ?? "not reported"}. Key genes: ${genes
          .slice(0, 3)
          .map((gene) => gene.symbol)
          .join(", ")}.`}
      />
    </main>
  );
}
