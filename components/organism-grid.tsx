"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { OrganismSummary } from "../lib/api-types";

interface OrganismGridProps {
  organisms: OrganismSummary[];
}

export function OrganismGrid({ organisms }: OrganismGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return organisms;
    }

    return organisms.filter((organism) => {
      return (
        organism.scientificName.toLowerCase().includes(value) ||
        (organism.commonName ?? "").toLowerCase().includes(value) ||
        (organism.habitat ?? "").toLowerCase().includes(value)
      );
    });
  }, [organisms, query]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Search</label>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by organism or habitat"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((organism) => (
          <Link
            key={organism.id}
            href={`/organisms/${organism.id}`}
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/40 transition hover:border-sky-500/60"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{organism.commonName ?? "Research isolate"}</p>
              <h3 className="text-xl font-semibold text-white">{organism.scientificName}</h3>
              <p className="text-sm text-slate-400">{organism.description ?? "No description available."}</p>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">Genome</dt>
                <dd className="text-lg font-semibold text-sky-300">
                  {organism.genomeSizeMb ? `${organism.genomeSizeMb.toFixed(2)} Mb` : "N/A"}
                </dd>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">Chromosomes</dt>
                <dd className="text-lg font-semibold text-emerald-300">{organism.chromosomeCount}</dd>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">Genes</dt>
                <dd className="text-lg font-semibold text-indigo-300">{organism.geneCount}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {(organism.habitat ? [organism.habitat] : [])
                .concat(organism.highlightedGenes.map((gene) => gene.symbol))
                .slice(0, 3)
                .map((label) => (
                  <span key={label} className="rounded-full border border-white/10 px-3 py-1">
                    {label}
                  </span>
                ))}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">
              Explore profile →
            </p>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-slate-400">No organisms match that query. Try searching by a different synonym or habitat.</p>
      )}
    </div>
  );
}
