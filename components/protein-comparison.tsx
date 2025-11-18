'use client';

import type { GeneData } from '@/lib/gene-data';
import { analyzeProtein } from '@/lib/protein-analysis';

interface ProteinComparisonProps {
  gene1: GeneData;
  gene2: GeneData;
}

export function ProteinComparison({ gene1, gene2 }: ProteinComparisonProps) {
  const analysis1 = analyzeProtein(gene1.proteinSequence);
  const analysis2 = analyzeProtein(gene2.proteinSequence);

  const properties = [
    {
      name: 'Molecular Weight (Da)',
      value1: analysis1.molecularWeight.toLocaleString(),
      value2: analysis2.molecularWeight.toLocaleString(),
    },
    {
      name: 'Length (amino acids)',
      value1: analysis1.length.toString(),
      value2: analysis2.length.toString(),
    },
    {
      name: 'Net Charge (pH 7)',
      value1: analysis1.netCharge.toFixed(1),
      value2: analysis2.netCharge.toFixed(1),
    },
    {
      name: 'Isoelectric Point',
      value1: analysis1.isoelectricPoint.toFixed(2),
      value2: analysis2.isoelectricPoint.toFixed(2),
    },
    {
      name: 'Avg Hydrophobicity',
      value1: analysis1.averageHydrophobicity.toFixed(2),
      value2: analysis2.averageHydrophobicity.toFixed(2),
    },
    {
      name: 'Hydrophobic Regions',
      value1: analysis1.hydrophobicRegions.length.toString(),
      value2: analysis2.hydrophobicRegions.length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-white">Protein Comparison</h3>
        <p className="text-sm text-slate-400">
          Side-by-side comparison of AaFlp-1 and AaDcuC proteins
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-normal">Property</th>
              <th className="px-4 py-3 text-center font-normal">
                <div>
                  <div className="font-semibold text-blue-400">{gene1.name}</div>
                  <div className="mt-1 text-xs normal-case text-slate-500">{gene1.description}</div>
                </div>
              </th>
              <th className="px-4 py-3 text-center font-normal">
                <div>
                  <div className="font-semibold text-blue-400">{gene2.name}</div>
                  <div className="mt-1 text-xs normal-case text-slate-500">{gene2.description}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-950/60">
            {properties.map((prop, idx) => (
              <tr key={idx} className="border-t border-white/5">
                <td className="px-4 py-3 font-semibold text-slate-300">{prop.name}</td>
                <td className="px-4 py-3 text-center font-mono text-white">{prop.value1}</td>
                <td className="px-4 py-3 text-center font-mono text-white">{prop.value2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {gene1.name} - Functional Role
          </h4>
          <p className="text-sm leading-relaxed text-slate-300">{gene1.function}</p>
          <div className="mt-3 rounded border border-blue-500/20 bg-blue-900/10 p-2">
            <p className="text-xs text-blue-300">Pathway: {gene1.pathway}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {gene2.name} - Functional Role
          </h4>
          <p className="text-sm leading-relaxed text-slate-300">{gene2.function}</p>
          <div className="mt-3 rounded border border-blue-500/20 bg-blue-900/10 p-2">
            <p className="text-xs text-blue-300">Pathway: {gene2.pathway}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Key Differences</h4>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            <p>
              <strong>{gene1.name}</strong> is a {analysis1.length}-residue structural protein with average 
              hydrophobicity of {analysis1.averageHydrophobicity.toFixed(2)}, indicating its membrane-associated nature 
              for pilus assembly.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            <p>
              <strong>{gene2.name}</strong> is a larger {analysis2.length}-residue transmembrane transporter 
              ({analysis2.molecularWeight.toLocaleString()} Da) with {analysis2.hydrophobicRegions.length} hydrophobic 
              regions, consistent with its role in C4-dicarboxylate transport.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            <p>
              Both proteins are essential for biofilm formation: {gene1.name} provides structural adhesion 
              while {gene2.name} supplies metabolic energy through fumarate respiration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
