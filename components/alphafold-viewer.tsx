// components/alphafold-viewer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface AlphaFoldViewerProps {
  uniprotId?: string;
  proteinAccession?: string;
  proteinName?: string;
  sequence?: string;
  showControls?: boolean;
}

interface StructureAnnotation {
  type: 'domain' | 'binding_site' | 'motif' | 'rtx_repeat' | 'signal_peptide';
  name: string;
  start: number;
  end: number;
  color: string;
  description?: string;
}

export default function AlphaFoldViewer({
  uniprotId,
  proteinAccession,
  proteinName = 'Protein Structure',
  sequence,
  showControls = true
}: AlphaFoldViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cartoon' | 'surface' | 'ball-stick'>('cartoon');
  const [colorScheme, setColorScheme] = useState<'pLDDT' | 'chain' | 'secondary'>('pLDDT');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<StructureAnnotation | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mock annotations for demonstration (would come from API in real implementation)
  const annotations: StructureAnnotation[] = [
    {
      type: 'signal_peptide',
      name: 'Signal Peptide',
      start: 1,
      end: 25,
      color: '#FF6B6B',
      description: 'Sec-dependent signal peptide for secretion'
    },
    {
      type: 'domain',
      name: 'Toxin Domain',
      start: 50,
      end: 300,
      color: '#4ECDC4',
      description: 'Main cytotoxic domain'
    },
    {
      type: 'rtx_repeat',
      name: 'RTX Repeat 1',
      start: 320,
      end: 340,
      color: '#FFE66D',
      description: 'Calcium-binding RTX repeat motif'
    },
    {
      type: 'rtx_repeat',
      name: 'RTX Repeat 2',
      start: 350,
      end: 370,
      color: '#FFE66D',
      description: 'Calcium-binding RTX repeat motif'
    },
    {
      type: 'binding_site',
      name: 'Ca²⁺ Binding Site',
      start: 330,
      end: 335,
      color: '#FF9FF3',
      description: 'Calcium ion binding site'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [uniprotId, proteinAccession]);

  // Build AlphaFold DB URL if we have a UniProt ID
  const getAlphaFoldUrl = () => {
    if (!uniprotId) {
      return null;
    }
    // AlphaFold DB embed URL
    return `https://alphafold.ebi.ac.uk/entry/${uniprotId}`;
  };

  const alphafoldUrl = getAlphaFoldUrl();

  // For proteins without UniProt IDs, show a placeholder with sequence info
  const renderPlaceholder = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🧬</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Structure Prediction Pending
        </h3>
        <p className="text-gray-600 mb-4">
          AlphaFold structure prediction not yet available for this protein.
        </p>
        
        {sequence && (
          <div className="mt-6 text-left bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Protein Sequence</h4>
            <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all max-h-32 overflow-y-auto">
              {sequence}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Length: {sequence.length} amino acids
            </p>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can submit this sequence to AlphaFold Server or ESMFold for structure prediction.
          </p>
          <div className="flex gap-2 justify-center mt-3">
            <a
              href="https://alphafoldserver.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              AlphaFold Server
            </a>
            <a
              href="https://esmatlas.com/resources?action=fold"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              ESMFold
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading protein structure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{proteinName}</h3>
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              {proteinAccession && (
                <span>
                  <strong>Accession:</strong> {proteinAccession}
                </span>
              )}
              {uniprotId && (
                <span>
                  <strong>UniProt:</strong> {uniprotId}
                </span>
              )}
              {sequence && (
                <span>
                  <strong>Length:</strong> {sequence.length} aa
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={alphafoldUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              View in AlphaFold DB →
            </a>
          </div>
        </div>
      </div>

      {/* Main viewer */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {showControls && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* View mode selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">View:</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  {(['cartoon', 'surface', 'ball-stick'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {mode === 'ball-stick' ? 'Ball & Stick' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color scheme selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Color:</label>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as any)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="pLDDT">pLDDT Confidence</option>
                  <option value="chain">Chain</option>
                  <option value="secondary">Secondary Structure</option>
                </select>
              </div>

              {/* Annotations toggle */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={showAnnotations}
                    onChange={(e) => setShowAnnotations(e.target.checked)}
                    className="mr-2"
                  />
                  Show Annotations
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          {alphafoldUrl ? (
            <iframe
              ref={iframeRef}
              src={alphafoldUrl}
              className="w-full h-[600px]"
              title={`AlphaFold structure for ${proteinName}`}
              allow="fullscreen"
            />
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              {renderPlaceholder()}
            </div>
          )}
        </div>
      </div>

      {/* Annotations panel */}
      {showAnnotations && annotations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Structural Annotations & Features
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {annotations.map((annotation, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAnnotation(annotation)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAnnotation === annotation
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: annotation.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{annotation.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {annotation.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Residues {annotation.start}-{annotation.end} ({annotation.end - annotation.start + 1} aa)
                </p>
                {annotation.description && (
                  <p className="text-xs text-gray-500">{annotation.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Selected annotation details */}
          {selectedAnnotation && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">
                {selectedAnnotation.name} - Detailed Information
              </h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Type:</strong> {selectedAnnotation.type.replace('_', ' ')}
                </p>
                <p>
                  <strong>Position:</strong> {selectedAnnotation.start} - {selectedAnnotation.end}
                </p>
                <p>
                  <strong>Length:</strong> {selectedAnnotation.end - selectedAnnotation.start + 1} amino acids
                </p>
                {selectedAnnotation.description && (
                  <p>
                    <strong>Description:</strong> {selectedAnnotation.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* pLDDT confidence legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          AlphaFold Confidence Score (pLDDT)
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-xs text-gray-600">
              <span>Very Low</span>
              <span>Low</span>
              <span>Confident</span>
              <span>Very High</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-red-500"></div>
              <div className="flex-1 bg-orange-400"></div>
              <div className="flex-1 bg-yellow-400"></div>
              <div className="flex-1 bg-blue-500"></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>&lt;50</span>
              <span>50-70</span>
              <span>70-90</span>
              <span>90-100</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          <strong>pLDDT</strong> (predicted Local Distance Difference Test) scores indicate the confidence of each residue's predicted position. 
          Higher scores (blue) indicate higher confidence in the prediction.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            if (sequence) {
              const blob = new Blob([sequence], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${proteinAccession || 'protein'}_sequence.fasta`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          disabled={!sequence}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download FASTA
        </button>
        <button
          onClick={() => {
            // In a real implementation, this would download the PDB file
            alert('PDB download would be implemented here');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Download PDB
        </button>
        <button
          onClick={() => {
            // In a real implementation, this would open PyMOL or similar
            alert('PyMOL integration would be implemented here');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Open in PyMOL
        </button>
      </div>
    </div>
  );
}
