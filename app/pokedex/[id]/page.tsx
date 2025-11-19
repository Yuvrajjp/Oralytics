import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PokedexEntryDisplay } from "@/components/pokedex-entry-display";
import { fetchFromApi, ApiError } from "@/lib/server-api";
import type { PokedexEntryResponse } from "@/lib/pokedex-types";

interface PageParams {
  params: { id: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = (await params) as { id: string };
  try {
    const { entry } = await fetchFromApi<PokedexEntryResponse>(`/api/pokedex/${resolvedParams.id}`);
    return {
      title: `${entry.organism.scientificName} | Pokedex | Oralytics`,
      description: entry.nickname || `Pokedex entry #${entry.pokedexNumber}`,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Entry not found" };
    }
    throw error;
  }
}

export default async function PokedexEntryPage({ params }: PageParams) {
  const { id } = (await params) as { id: string };
  let entry: PokedexEntryResponse["entry"];

  try {
    const data = await fetchFromApi<PokedexEntryResponse>(`/api/pokedex/${id}`);
    entry = data.entry;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-200">Home</Link>
        <span>/</span>
        <Link href="/pokedex" className="hover:text-slate-200">Pokedex</Link>
        <span>/</span>
        <span className="text-slate-200">#{entry.pokedexNumber.toString().padStart(3, "0")}</span>
      </nav>

      {/* Entry Display */}
      <PokedexEntryDisplay entry={entry as unknown as import("@/lib/pokedex-types").MicrobialPokedexEntry} />

      {/* Related Links */}
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Related Resources</h3>
        <div className="flex flex-wrap gap-3">
          {entry.organism.id && (
            <Link
              href={`/organisms/${entry.organism.id}`}
              className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 hover:border-sky-500/50 hover:text-sky-300"
            >
              View Organism Profile →
            </Link>
          )}
          <Link
            href="/pokedex"
            className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 hover:border-sky-500/50 hover:text-sky-300"
          >
            ← Back to Pokedex
          </Link>
        </div>
      </section>
    </main>
  );
}
