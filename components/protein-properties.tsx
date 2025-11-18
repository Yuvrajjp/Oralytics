'use client';

import type { GeneData } from '@/lib/gene-data';
import { analyzeProtein, generateHydrophobicityPlot } from '@/lib/protein-analysis';

interface ProteinPropertiesProps {
  gene: GeneData;
}

export function ProteinProperties({ gene }: ProteinPropertiesProps) {
  const analysis = analyzeProtein(gene.proteinSequence);
  const hydrophobicityPlot = generateHydrophobicityPlot(gene.proteinSequence);
  
  // Get top amino acids
  const sortedComposition = Object.entries(analysis.composition)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">Protein Properties</h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-sky-900/40 to-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Molecular Weight</p>
            <p className="mt-2 text-2xl font-semibold text-sky-200">{analysis.molecularWeight.toLocaleString()} Da</p>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Length</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-200">{analysis.length} aa</p>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-purple-900/40 to-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Net Charge (pH 7)</p>
            <p className="mt-2 text-2xl font-semibold text-purple-200">
              {analysis.netCharge > 0 ? '+' : ''}{analysis.netCharge}
            </p>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-amber-900/40 to-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Isoelectric Point</p>
            <p className="mt-2 text-2xl font-semibold text-amber-200">{analysis.isoelectricPoint}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Amino Acid Composition</h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <div className="space-y-3">
            {sortedComposition.map(([aa, count]) => {
              const percentage = ((count / analysis.length) * 100).toFixed(1);
              return (
                <div key={aa} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-white">{aa}</span>
                    <span className="text-slate-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Hydrophobicity Plot (Kyte-Doolittle)
        </h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <div className="relative h-48">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Y-axis */}
              <line x1="40" y1="10" x2="40" y2="180" stroke="#475569" strokeWidth="1" />
              <text x="10" y="15" fill="#94a3b8" fontSize="12">4</text>
              <text x="10" y="50" fill="#94a3b8" fontSize="12">2</text>
              <text x="10" y="95" fill="#94a3b8" fontSize="12">0</text>
              <text x="5" y="140" fill="#94a3b8" fontSize="12">-2</text>
              <text x="5" y="185" fill="#94a3b8" fontSize="12">-4</text>
              
              {/* Zero line */}
              <line x1="40" y1="95" x2="100%" y2="95" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
              
              {/* Plot line */}
              <polyline
                points={hydrophobicityPlot.map((point, idx) => {
                  const x = 45 + (idx / hydrophobicityPlot.length) * 90 + '%';
                  const y = 95 - (point.hydrophobicity * 20);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
              />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Average: {analysis.averageHydrophobicity.toFixed(2)} | 
            Positive values indicate hydrophobic regions (membrane-spanning), negative values indicate hydrophilic regions
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Hydrophobic Regions</h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          {analysis.hydrophobicRegions.length > 0 ? (
            <div className="space-y-2">
              {analysis.hydrophobicRegions.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between rounded border border-yellow-500/20 bg-yellow-900/20 p-2 text-sm">
                  <span className="text-slate-300">
                    Region {idx + 1}: Position {region.start}-{region.end}
                  </span>
                  <span className="font-mono text-yellow-400">Score: {region.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No significant hydrophobic regions detected</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Charged Regions</h4>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          {analysis.chargedRegions.length > 0 ? (
            <div className="space-y-2">
              {analysis.chargedRegions.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between rounded border border-blue-500/20 bg-blue-900/20 p-2 text-sm">
                  <span className="text-slate-300">
                    Region {idx + 1}: Position {region.start}-{region.end}
                  </span>
                  <span className="font-mono text-blue-400">Charge density: {region.charge.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No significant charged regions detected</p>
          )}
        </div>
      </div>
    </div>
  );
}
