import React, { useState } from 'react';

interface ProteinData {
  id: string;
  accession: string;
  name: string;
  description: string;
  sequenceLength: number;
  molecularWeight: number;
  localization: string;
  geneName: string;
  organismName: string;
}

interface ProteinGalleryProps {
  proteins: ProteinData[];
  isLoading?: boolean;
}

export function ProteinGallery({ proteins, isLoading = false }: ProteinGalleryProps) {
  const [selectedProtein, setSelectedProtein] = useState<ProteinData | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'weight' | 'organism'>('organism');

  const filtered = proteins.filter((p) => {
    const q = filter.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const accession = (p.accession || '').toLowerCase();
    const organism = (p.organismName || '').toLowerCase();
    return name.includes(q) || accession.includes(q) || organism.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'weight':
        return (b.molecularWeight || 0) - (a.molecularWeight || 0);
      case 'organism':
        return (a.organismName || '').localeCompare(b.organismName || '');
      case 'name':
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading protein data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Protein Catalog</h1>
        <p className="text-slate-300">
          {sorted.length} proteins across {new Set(proteins.map(p => p.organismName)).size} organisms
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, accession, or organism..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'weight' | 'organism')}
          className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500"
        >
          <option value="organism">Sort by Organism</option>
          <option value="name">Sort by Name</option>
          <option value="weight">Sort by Molecular Weight</option>
        </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sorted.map((protein) => (
          <div
            key={protein.id}
            onClick={() => setSelectedProtein(protein)}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-lg border border-slate-700 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white truncate">{protein.name}</h3>
                <p className="text-xs text-blue-400 font-mono">{protein.accession}</p>
              </div>
              <div className="text-3xl">🔴</div>
            </div>

            <p className="text-sm text-slate-300 mb-3 line-clamp-2">{protein.description}</p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gene:</span>
                <span className="text-slate-200 font-semibold">{protein.geneName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organism:</span>
                <span className="text-slate-200">{protein.organismName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MW:</span>
                <span className="text-slate-200">{protein.molecularWeight} kDa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Length:</span>
                <span className="text-slate-200">{protein.sequenceLength} aa</span>
              </div>
            </div>

            <div className="mt-3 inline-block bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-xs">
              {protein.localization}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProtein && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto border border-slate-700">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedProtein.name}</h2>
                <p className="text-blue-400 font-mono mt-1">{selectedProtein.accession}</p>
              </div>
              <button
                onClick={() => setSelectedProtein(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Description</h3>
                <p className="text-white">{selectedProtein.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Properties</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">Gene</p>
                      <p className="text-white font-semibold">{selectedProtein.geneName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Organism</p>
                      <p className="text-white">{selectedProtein.organismName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Localization</p>
                      <p className="text-white">{selectedProtein.localization}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Biophysical</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400">Molecular Weight</p>
                      <p className="text-white font-semibold">{selectedProtein.molecularWeight} kDa</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sequence Length</p>
                      <p className="text-white">{selectedProtein.sequenceLength} amino acids</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Avg. Residue Weight</p>
                      <p className="text-white">
                        {(selectedProtein.molecularWeight / selectedProtein.sequenceLength).toFixed(2)} Da/aa
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Accession Information</h3>
                <p className="text-white font-mono text-sm break-all">{selectedProtein.accession}</p>
                <p className="text-xs text-slate-400 mt-2">Use this ID to retrieve protein sequences from NCBI</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
