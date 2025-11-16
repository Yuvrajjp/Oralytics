"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { OrganismSummary } from "@/lib/api-types";

const MicrobeModel = dynamic(() => import("./organism-model"), { ssr: false });

interface OrganismCardProps {
  organism: OrganismSummary;
}

export default function OrganismCard({ organism }: OrganismCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/organisms/${organism.id}`}
      className="group block rounded-3xl border border-slate-100/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-36 w-full">
        <MicrobeModel species={organism.scientificName} spin={hovered} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">{organism.scientificName}</h3>
      <p className="text-sm text-slate-500">{organism.commonName ?? "Research isolate"}</p>

      <p className="mt-3 text-sm text-slate-500">{organism.description ?? "No description available."}</p>

      <div className="mt-4 text-sm text-slate-400">
        {organism.chromosomes.length} chromosomes • {organism.geneCount.toLocaleString()} genes
      </div>

      {organism.highlightedGenes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {organism.highlightedGenes.map((gene) => (
            <span key={gene.id} className="rounded-full border border-slate-200 px-3 py-1">
              {gene.symbol}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
