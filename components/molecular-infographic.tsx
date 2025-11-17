import React from 'react';

export function MolecularCentralDogmaInfographic() {
  return (
    <div className="w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-8 rounded-lg">
      {/* Main Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Central Dogma of Molecular Biology</h1>
        <p className="text-blue-300 text-lg">DNA → RNA → Protein: Information Flow in Living Systems</p>
      </div>

      {/* Main Flow Diagram */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-12">
        {/* DNA Box */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg w-full lg:w-1/3">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl">🧬</div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-3">DNA</h2>
          <div className="space-y-2 text-sm text-purple-100">
            <p><strong>Full Name:</strong> Deoxyribonucleic Acid</p>
            <p><strong>Location:</strong> Cell nucleus, mitochondria</p>
            <p><strong>Structure:</strong> Double helix, 4 bases (A, T, G, C)</p>
            <p><strong>Role:</strong> Genetic information storage</p>
            <p><strong>Stability:</strong> Very stable (2-deoxy sugar backbone)</p>
            <p><strong>Function:</strong> Blueprint for life; passed to offspring</p>
          </div>
          <div className="mt-4 bg-purple-950 p-3 rounded text-xs text-purple-200 font-mono">
            5'-ATGCGATCG...-3'
          </div>
        </div>

        {/* Arrow 1: Transcription */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold text-yellow-300">⬇</div>
          <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold text-sm">
            TRANSCRIPTION
          </div>
          <p className="text-xs text-yellow-300 text-center">RNA Polymerase</p>
        </div>

        {/* RNA Box */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg w-full lg:w-1/3">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl">📜</div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-3">RNA</h2>
          <div className="space-y-2 text-sm text-green-100">
            <p><strong>Full Name:</strong> Ribonucleic Acid</p>
            <p><strong>Types:</strong> mRNA, tRNA, rRNA, lncRNA</p>
            <p><strong>Location:</strong> Cytoplasm, ribosome, nucleus</p>
            <p><strong>Structure:</strong> Single strand, 4 bases (A, U, G, C)</p>
            <p><strong>Stability:</strong> Less stable (contains 2-OH hydroxyl group)</p>
            <p><strong>Function:</strong> Messenger; carries genetic instructions</p>
          </div>
          <div className="mt-4 bg-green-950 p-3 rounded text-xs text-green-200 font-mono">
            5'-AUGCGAUCG...-3'
          </div>
        </div>

        {/* Arrow 2: Translation */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold text-red-300">⬇</div>
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
            TRANSLATION
          </div>
          <p className="text-xs text-red-300 text-center">Ribosome</p>
        </div>

        {/* Protein Box */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-lg shadow-lg w-full lg:w-1/3">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl">🔴</div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-3">PROTEIN</h2>
          <div className="space-y-2 text-sm text-red-100">
            <p><strong>Full Name:</strong> Polypeptide Chain</p>
            <p><strong>Building Blocks:</strong> 20+ amino acids</p>
            <p><strong>Location:</strong> Cytoplasm, membrane, organelles</p>
            <p><strong>Structure:</strong> α-helix, β-sheet, tertiary 3D fold</p>
            <p><strong>Stability:</strong> Variable (temp, pH dependent)</p>
            <p><strong>Function:</strong> Catalysis, structure, regulation</p>
          </div>
          <div className="mt-4 bg-red-950 p-3 rounded text-xs text-red-200 font-mono">
            Met-Ala-Asp-Arg-Ser...
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg mb-12">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-white">Property</th>
              <th className="px-4 py-3 text-left font-bold text-purple-300">DNA</th>
              <th className="px-4 py-3 text-left font-bold text-green-300">RNA</th>
              <th className="px-4 py-3 text-left font-bold text-red-300">PROTEIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Primary Role</td>
              <td className="px-4 py-3 text-purple-200">Information Storage</td>
              <td className="px-4 py-3 text-green-200">Information Transfer</td>
              <td className="px-4 py-3 text-red-200">Function Execution</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Bases/Units</td>
              <td className="px-4 py-3 text-purple-200">A, T, G, C</td>
              <td className="px-4 py-3 text-green-200">A, U, G, C</td>
              <td className="px-4 py-3 text-red-200">20 amino acids</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Sugar Backbone</td>
              <td className="px-4 py-3 text-purple-200">Deoxyribose</td>
              <td className="px-4 py-3 text-green-200">Ribose</td>
              <td className="px-4 py-3 text-red-200">Peptide Bonds</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Structure</td>
              <td className="px-4 py-3 text-purple-200">Double helix</td>
              <td className="px-4 py-3 text-green-200">Single strand</td>
              <td className="px-4 py-3 text-red-200">Folded 3D</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Stability</td>
              <td className="px-4 py-3 text-purple-200">Very Stable</td>
              <td className="px-4 py-3 text-green-200">Unstable</td>
              <td className="px-4 py-3 text-red-200">Variable</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Half-life</td>
              <td className="px-4 py-3 text-purple-200">Lifetime</td>
              <td className="px-4 py-3 text-green-200">Minutes to hours</td>
              <td className="px-4 py-3 text-red-200">Hours to days</td>
            </tr>
            <tr className="hover:bg-slate-700">
              <td className="px-4 py-3 font-semibold text-white">Catalytic Activity</td>
              <td className="px-4 py-3 text-purple-200">No</td>
              <td className="px-4 py-3 text-green-200">Yes (ribozymes)</td>
              <td className="px-4 py-3 text-red-200">Yes (enzymes)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Key Distinctions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-900 border-l-4 border-purple-400 p-4 rounded">
          <h3 className="text-lg font-bold text-purple-300 mb-2">🧬 DNA</h3>
          <ul className="space-y-1 text-sm text-purple-100">
            <li>✓ Permanent storage</li>
            <li>✓ Copy-protected (double strand)</li>
            <li>✓ Inherited by offspring</li>
            <li>✓ Tightly packed in nucleus</li>
          </ul>
        </div>

        <div className="bg-green-900 border-l-4 border-green-400 p-4 rounded">
          <h3 className="text-lg font-bold text-green-300 mb-2">📜 RNA</h3>
          <ul className="space-y-1 text-sm text-green-100">
            <li>✓ Temporary copies</li>
            <li>✓ Single-stranded (flexible)</li>
            <li>✓ Multiple functions (mRNA, tRNA, rRNA)</li>
            <li>✓ Rapidly degraded & recycled</li>
          </ul>
        </div>

        <div className="bg-red-900 border-l-4 border-red-400 p-4 rounded">
          <h3 className="text-lg font-bold text-red-300 mb-2">🔴 PROTEIN</h3>
          <ul className="space-y-1 text-sm text-red-100">
            <li>✓ Does the actual work</li>
            <li>✓ Diverse 3D shapes</li>
            <li>✓ Binds, catalyzes, regulates</li>
            <li>✓ Determines phenotype</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
