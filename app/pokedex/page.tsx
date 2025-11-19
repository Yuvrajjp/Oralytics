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
    <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12">
      {/* Header with enhanced typography */}
      <section className="text-center space-y-6">
        <p className="text-xs font-medium uppercase tracking-[0.5em] text-slate-500">Comprehensive Database</p>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Microbial Pokedex
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
          A comprehensive collection of oral microbiome organisms with detailed genomic, proteomic,
          and clinical research data from Dr. Cugini&apos;s laboratory
        </p>
      </section>

      {/* Stats with enhanced hover effects */}
      <section className="grid gap-6 md:grid-cols-4">
        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">Total Entries</p>
          <p className="mt-3 text-4xl font-bold text-white group-hover:text-sky-300 transition-colors">{entries.length}</p>
        </div>
        <div className="group rounded-3xl border border-purple-500/10 bg-gradient-to-br from-purple-950/40 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-purple-400/70 group-hover:text-purple-400 transition-colors">Legendary</p>
          <p className="mt-3 text-4xl font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
            {entries.filter((e) => e.rarity === "Legendary").length}
          </p>
        </div>
        <div className="group rounded-3xl border border-sky-500/10 bg-gradient-to-br from-sky-950/40 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-400/70 group-hover:text-sky-400 transition-colors">With AlphaFold</p>
          <p className="mt-3 text-4xl font-bold text-sky-300 group-hover:text-sky-200 transition-colors">
            {entries.length > 0 ? "Coming Soon" : "0"}
          </p>
        </div>
        <div className="group rounded-3xl border border-red-500/10 bg-gradient-to-br from-red-950/40 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-red-400/70 group-hover:text-red-400 transition-colors">High Pathogenicity</p>
          <p className="mt-3 text-4xl font-bold text-red-300 group-hover:text-red-200 transition-colors">
            {entries.filter((e) => (e.pathogenicityScore || 0) > 70).length}
          </p>
        </div>
      </section>

      {/* Entries Grid */}
      <section>
        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900/60 p-8 text-center backdrop-blur-sm shadow-lg shadow-red-500/10">
            <p className="text-lg font-medium text-red-300">{error}</p>
          </div>
        )}

        {!error && entries.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-16 text-center backdrop-blur-sm">
            <p className="text-xl font-semibold text-slate-300">No Pokedex entries found</p>
            <p className="mt-3 text-base text-slate-500">
              Entries will appear here once they are added to the database
            </p>
          </div>
        )}

        {!error && entries.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/pokedex/${entry.id}`}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/0 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:from-sky-500/5 group-hover:to-purple-500/5 group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                        #{entry.pokedexNumber.toString().padStart(3, "0")}
                      </span>
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${getRarityBadgeColor(entry.rarity || "Common")}`}>
                        {entry.rarity}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-sky-300">
                    {entry.organism.scientificName}
                  </h3>
                  
                  {entry.organism.commonName && (
                    <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{entry.organism.commonName}</p>
                  )}
                  
                  {entry.nickname && (
                    <p className="mt-3 text-sm italic text-slate-300 group-hover:text-sky-200 transition-colors">&quot;{entry.nickname}&quot;</p>
                  )}

                  <div className="mt-6 space-y-3 text-sm text-slate-400">
                    {entry.primaryHabitat && (
                      <p className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-300 transition-colors" />
                        <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Habitat:</span> {entry.primaryHabitat}
                      </p>
                    )}
                    {entry.pathogenicityScore !== null && entry.pathogenicityScore !== undefined && (
                      <p className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-300 transition-colors" />
                        <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Pathogenicity:</span>{" "}
                        <span className={getPathogenicityColor(entry.pathogenicityScore)}>
                          {entry.pathogenicityScore.toFixed(0)}/100
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-sm font-medium text-sky-400 transition-all duration-300 group-hover:gap-3 group-hover:text-sky-300">
                    <span>View Details</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
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
      return "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/20 shadow-lg shadow-purple-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 group-hover:shadow-purple-500/30";
    case "Rare":
      return "bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-200 border border-pink-400/20 shadow-lg shadow-pink-500/20 group-hover:from-pink-500/40 group-hover:to-rose-500/40 group-hover:shadow-pink-500/30";
    case "Uncommon":
      return "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border border-blue-400/20 shadow-lg shadow-blue-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 group-hover:shadow-blue-500/30";
    case "Common":
      return "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-400/20 shadow-lg shadow-green-500/20 group-hover:from-green-500/40 group-hover:to-emerald-500/40 group-hover:shadow-green-500/30";
    default:
      return "bg-gradient-to-r from-slate-500/30 to-slate-600/30 text-slate-200 border border-slate-400/20 shadow-lg shadow-slate-500/20 group-hover:from-slate-500/40 group-hover:to-slate-600/40 group-hover:shadow-slate-500/30";
  }
}

function getPathogenicityColor(score: number): string {
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-yellow-400";
  return "text-green-400";
}
