'use client';

import { pnagPathway } from '@/lib/pnag-pathway';

export function PathwayDiagram() {
  const { nodes, edges, description } = pnagPathway;

  // Positioning for nodes (manual layout for better control)
  const nodePositions: Record<string, { x: number; y: number }> = {
    'aaflp1': { x: 10, y: 20 },
    'pili-assembly': { x: 30, y: 20 },
    'adhesion': { x: 50, y: 20 },
    'biofilm': { x: 70, y: 20 },
    'pnag-synthesis': { x: 70, y: 50 },
    'pnag': { x: 50, y: 50 },
    'aadcuc': { x: 10, y: 80 },
    'succinate': { x: 30, y: 80 },
    'fumarate-respiration': { x: 50, y: 80 },
    'energy': { x: 70, y: 80 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">PNAG EPS Biosynthesis Pathway</h3>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-6">
        <div className="relative h-96 w-full">
          <svg width="100%" height="100%" className="overflow-visible">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
              </marker>
            </defs>

            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const fromPos = nodePositions[edge.from];
              const toPos = nodePositions[edge.to];
              
              if (!fromPos || !toPos) return null;
              
              const x1 = `${fromPos.x}%`;
              const y1 = `${fromPos.y}%`;
              const x2 = `${toPos.x}%`;
              const y2 = `${toPos.y}%`;
              
              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#64748b"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const x = `${pos.x}%`;
              const y = `${pos.y}%`;
              
              let fillColor = '#1e293b';
              let borderColor = '#475569';
              let textColor = '#e2e8f0';
              
              if (node.highlighted) {
                fillColor = '#1e3a8a';
                borderColor = '#3b82f6';
                textColor = '#93c5fd';
              } else if (node.type === 'metabolite') {
                fillColor = '#065f46';
                borderColor = '#10b981';
                textColor = '#6ee7b7';
              } else if (node.type === 'enzyme') {
                fillColor = '#7c2d12';
                borderColor = '#f97316';
                textColor = '#fdba74';
              } else if (node.type === 'complex') {
                fillColor = '#581c87';
                borderColor = '#a855f7';
                textColor = '#d8b4fe';
              }
              
              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width="80"
                    height="40"
                    rx="6"
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth="2"
                    transform="translate(-40, -20)"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize="12"
                    fontWeight="600"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-12 rounded border-2 border-blue-500 bg-blue-900"></div>
            <span className="text-sm text-slate-300">Highlighted Genes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-12 rounded border-2 border-emerald-500 bg-emerald-900"></div>
            <span className="text-sm text-slate-300">Metabolites</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-12 rounded border-2 border-orange-500 bg-orange-900"></div>
            <span className="text-sm text-slate-300">Enzymes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-12 rounded border-2 border-purple-500 bg-purple-900"></div>
            <span className="text-sm text-slate-300">Complexes</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
          <h4 className="mb-2 font-semibold text-blue-200">AaFlp-1 Role</h4>
          <p className="text-sm leading-relaxed text-slate-300">
            The Flp pilus protein assembles into type IVb pili on the bacterial surface, 
            enabling initial adhesion to host cells and surfaces. This attachment is critical 
            for colonization and biofilm initiation.
          </p>
        </div>
        
        <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
          <h4 className="mb-2 font-semibold text-blue-200">AaDcuC Role</h4>
          <p className="text-sm leading-relaxed text-slate-300">
            The C4-dicarboxylate transporter imports succinate and fumarate for anaerobic 
            respiration, generating ATP that powers both pili assembly and PNAG synthesis. 
            This metabolic support is essential for biofilm development.
          </p>
        </div>
      </div>
    </div>
  );
}
