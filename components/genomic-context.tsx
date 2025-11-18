'use client';

import type { GenomicContext } from '@/lib/pnag-pathway';

interface GenomicContextViewerProps {
  context: GenomicContext;
  geneName: string;
}

export function GenomicContextViewer({ context, geneName }: GenomicContextViewerProps) {
  // Calculate scale for visualization
  const allPositions = [
    ...context.neighbors.map(n => context.position + n.distance),
    context.position
  ];
  const minPos = Math.min(...allPositions) - 500;
  const maxPos = Math.max(...allPositions) + 500;
  const range = maxPos - minPos;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">Genomic Context</h3>
        <p className="text-sm text-slate-400">
          Showing neighboring genes around {geneName} on chromosome {context.chromosome}
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-6">
        <div className="mb-4 text-center">
          <p className="text-xs text-slate-400">Chromosome Position</p>
          <p className="font-mono text-sm text-white">
            {minPos.toLocaleString()} - {maxPos.toLocaleString()} bp
          </p>
        </div>

        <div className="relative h-48">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Main chromosome line */}
            <line
              x1="5%"
              y1="50%"
              x2="95%"
              y2="50%"
              stroke="#475569"
              strokeWidth="4"
            />

            {/* Position markers */}
            <line x1="5%" y1="45%" x2="5%" y2="55%" stroke="#64748b" strokeWidth="2" />
            <line x1="95%" y1="45%" x2="95%" y2="55%" stroke="#64748b" strokeWidth="2" />

            {/* Target gene (highlighted) */}
            {(() => {
              const xPercent = 5 + ((context.position - minPos) / range) * 90;
              return (
                <>
                  <rect
                    x={`${xPercent - 2}%`}
                    y="40%"
                    width="4%"
                    height="20%"
                    fill="#3b82f6"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    rx="2"
                  />
                  <text
                    x={`${xPercent}%`}
                    y="25%"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {geneName}
                  </text>
                  <text
                    x={`${xPercent}%`}
                    y="75%"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                  >
                    {context.position.toLocaleString()}
                  </text>
                </>
              );
            })()}

            {/* Neighboring genes */}
            {context.neighbors.map((neighbor, idx) => {
              const neighborPos = context.position + neighbor.distance;
              const xPercent = 5 + ((neighborPos - minPos) / range) * 90;
              const isUpstream = neighbor.distance < 0;

              return (
                <g key={idx}>
                  <rect
                    x={`${xPercent - 1.5}%`}
                    y="42%"
                    width="3%"
                    height="16%"
                    fill="#1e293b"
                    stroke="#64748b"
                    strokeWidth="1"
                    rx="2"
                  />
                  <text
                    x={`${xPercent}%`}
                    y={isUpstream ? '30%' : '85%'}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {neighbor.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border-2 border-blue-400 bg-blue-600"></div>
            <span className="text-slate-300">Target Gene</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border border-slate-400 bg-slate-700"></div>
            <span className="text-slate-300">Neighboring Genes</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Neighboring Genes</h4>
        <div className="space-y-2">
          {context.neighbors.map((neighbor, idx) => {
            const distance = Math.abs(neighbor.distance);
            const direction = neighbor.distance < 0 ? 'Upstream' : 'Downstream';
            
            return (
              <div
                key={idx}
                className="rounded-lg border border-white/10 bg-slate-900/60 p-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-white">{neighbor.name}</span>
                      <span className="text-xs text-slate-500">({neighbor.locusTag})</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{neighbor.function}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-300">{direction}</p>
                    <p className="text-xs text-slate-500">~{distance.toLocaleString()} bp</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
