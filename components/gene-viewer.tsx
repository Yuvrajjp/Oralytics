'use client';

import type { GeneData } from '@/lib/gene-data';
import { getAminoAcidProperties } from '@/lib/protein-analysis';

interface GeneViewerProps {
  gene: GeneData;
}

export function GeneViewer({ gene }: GeneViewerProps) {
  const sequence = gene.proteinSequence;
  const chunkSize = 10;
  const chunks: string[] = [];
  
  for (let i = 0; i < sequence.length; i += chunkSize) {
    chunks.push(sequence.slice(i, i + chunkSize));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">{gene.name}</h3>
          <p className="text-sm text-slate-400">{gene.description}</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Protein ID</p>
            <p className="mt-1 font-mono text-sm text-white">{gene.proteinId}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Locus Tag</p>
            <p className="mt-1 font-mono text-sm text-white">{gene.locusTag}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Length</p>
            <p className="mt-1 font-mono text-sm text-white">{gene.properties.length} aa</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Genomic Location</h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Chromosome</p>
              <p className="mt-1 font-mono text-sm text-white">{gene.location.chromosome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Position</p>
              <p className="mt-1 font-mono text-sm text-white">
                {gene.location.start.toLocaleString()}..{gene.location.end.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Strand</p>
              <p className="mt-1 font-mono text-sm text-white">{gene.location.strand}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Protein Sequence</h4>
        <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
          <div className="font-mono text-sm leading-relaxed">
            {chunks.map((chunk, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-slate-500 select-none w-12 text-right">
                  {idx * chunkSize + 1}
                </span>
                <span className="flex gap-0.5">
                  {chunk.split('').map((aa, aaIdx) => {
                    const props = getAminoAcidProperties(aa);
                    let colorClass = 'text-slate-300';
                    
                    if (props.polarity === 'charged') {
                      colorClass = props.charge > 0 ? 'text-blue-400' : 'text-red-400';
                    } else if (props.polarity === 'polar') {
                      colorClass = 'text-green-400';
                    } else if (props.hydrophobicity > 2) {
                      colorClass = 'text-yellow-400';
                    }
                    
                    return (
                      <span
                        key={aaIdx}
                        className={colorClass}
                        title={`${aa} - ${props.polarity}, hydrophobicity: ${props.hydrophobicity}`}
                      >
                        {aa}
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-yellow-400"></span>
              <span className="text-slate-400">Hydrophobic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-green-400"></span>
              <span className="text-slate-400">Polar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-blue-400"></span>
              <span className="text-slate-400">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-red-400"></span>
              <span className="text-slate-400">Negative</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Function</h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm leading-relaxed text-slate-300">{gene.function}</p>
          <p className="mt-2 text-xs text-slate-500">Pathway: {gene.pathway}</p>
        </div>
      </div>
    </div>
  );
}
