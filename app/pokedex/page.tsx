import Link from "next/link";
import type { Metadata } from "next";
import { fetchFromApi } from "@/lib/server-api";
import type { PokedexListResponse } from "@/lib/pokedex-types";

export const metadata: Metadata = {
  title: "Microbial Pokedex | Oralytics",
  description: "Comprehensive database of oral microbiome organisms with genomic, proteomic, and clinical data",
};

// Mark this page as dynamic since it fetches data from the database
export const dynamic = 'force-dynamic';

export default async function PokedexPage() {
  let entries: PokedexListResponse["entries"] = [];
  let error: string | null = null;

  try {
    const data = await fetchFromApi<PokedexListResponse>("/api/pokedex");
    entries = data.entries;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load Pokedex entries";
    console.error("Error loading Pokedex:", err);
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
      {/* Header */}
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Comprehensive Database</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Microbial Pokedex</h1>
        <p className="mt-4 text-base text-slate-300">
          A comprehensive collection of oral microbiome organisms with detailed genomic, proteomic,
          and clinical research data from Dr. Cugini&apos;s laboratory
        </p>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total Entries</p>
          <p className="mt-2 text-3xl font-semibold text-white">{entries.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Legendary</p>
          <p className="mt-2 text-3xl font-semibold text-purple-400">
            {entries.filter((e) => e.rarity === "Legendary").length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">With AlphaFold</p>
          <p className="mt-2 text-3xl font-semibold text-sky-400">
            {entries.length > 0 ? "Coming Soon" : "0"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">High Pathogenicity</p>
          <p className="mt-2 text-3xl font-semibold text-red-400">
            {entries.filter((e) => (e.pathogenicityScore || 0) > 70).length}
          </p>
        </div>
      </section>

      {/* Entries Grid */}
      <section>
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!error && entries.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-12 text-center">
            <p className="text-lg text-slate-400">No Pokedex entries found</p>
            <p className="mt-2 text-sm text-slate-500">
              Entries will appear here once they are added to the database
            </p>
          </div>
        )}

        {!error && entries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/pokedex/${entry.id}`}
                className="group rounded-2xl border border-white/10 bg-slate-950/60 p-6 transition-all hover:border-sky-500/50 hover:bg-slate-900/80"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      #{entry.pokedexNumber.toString().padStart(3, "0")}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getRarityBadgeColor(entry.rarity || "Common")}`}>
                      {entry.rarity}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white group-hover:text-sky-300">
                  {entry.organism.scientificName}
                </h3>
                
                {entry.organism.commonName && (
                  <p className="mt-1 text-sm text-slate-400">{entry.organism.commonName}</p>
                )}
                
                {entry.nickname && (
                  <p className="mt-2 text-sm italic text-slate-300">&quot;{entry.nickname}&quot;</p>
                )}

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  {entry.primaryHabitat && (
                    <p>
                      <span className="font-medium text-slate-300">Habitat:</span> {entry.primaryHabitat}
                    </p>
                  )}
                  {entry.pathogenicityScore !== null && entry.pathogenicityScore !== undefined && (
                    <p>
                      <span className="font-medium text-slate-300">Pathogenicity:</span>{" "}
                      <span className={getPathogenicityColor(entry.pathogenicityScore)}>
                        {entry.pathogenicityScore.toFixed(0)}/100
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-4 text-xs text-sky-400 group-hover:text-sky-300">
                  View Details →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function getRarityBadgeColor(rarity: string): string {
  switch (rarity) {
    case "Legendary":
      return "bg-purple-500/20 text-purple-300";
    case "Rare":
      return "bg-pink-500/20 text-pink-300";
    case "Uncommon":
      return "bg-blue-500/20 text-blue-300";
    case "Common":
      return "bg-green-500/20 text-green-300";
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}

function getPathogenicityColor(score: number): string {
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-yellow-400";
  return "text-green-400";
}
