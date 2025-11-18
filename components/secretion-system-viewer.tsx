// components/secretion-system-viewer.tsx
'use client';

import { useState, useEffect } from 'react';
import AlphaFoldViewer from './alphafold-viewer';

interface SecretionSystemComponent {
  id: string;
  locusTag: string;
  componentName: string;
  componentType: string;
  description: string;
  genomicStart: number;
  genomicEnd: number;
  protein?: {
    accession: string;
    sequence?: string;
    sequenceLength?: number;
    secretionInfo?: {
      predictedLocation: string;
      isSecreted: boolean;
      isSecretionMachinery: boolean;
    };
  };
}

interface SecretionSystem {
  id: string;
  name: string;
  type: string;
  description: string;
  startPosition: number;
  endPosition: number;
  components: SecretionSystemComponent[];
}

interface SecretionSystemViewerProps {
  organismId?: string;
  systemType?: string;
}

export default function SecretionSystemViewer({ organismId, systemType }: SecretionSystemViewerProps) {
  const [systems, setSystems] = useState<SecretionSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<SecretionSystem | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<SecretionSystemComponent | null>(null);
  const [showStructureViewer, setShowStructureViewer] = useState(false);

  useEffect(() => {
    fetchSecretionSystems();
  }, [organismId, systemType]);

  async function fetchSecretionSystems() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (organismId) params.append('organismId', organismId);
      if (systemType) params.append('type', systemType);

      const response = await fetch(`/api/ml/secretion-systems?${params}`);
      const data = await response.json();

      if (data.success) {
        setSystems(data.data);
        if (data.data.length > 0) {
          setSelectedSystem(data.data[0]);
        }
      } else {
        setError(data.error || 'Failed to load secretion systems');
      }
    } catch (err) {
      setError('Failed to fetch secretion systems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getLocationColor(location: string) {
    const colors: Record<string, string> = {
      'Extracellular': 'bg-red-500',
      'OuterMembrane': 'bg-orange-500',
      'Periplasmic': 'bg-yellow-500',
      'InnerMembrane': 'bg-green-500',
      'Cytoplasmic': 'bg-blue-500',
    };
    return colors[location] || 'bg-gray-500';
  }

  function getComponentTypeIcon(type: string) {
    const icons: Record<string, string> = {
      'Toxin': '☠️',
      'ATPase': '⚡',
      'ATPase/Permease': '⚡',
      'Adaptor': '🔗',
      'Toxin Activator': '🔧',
    };
    return icons[type] || '🧬';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading secretion systems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  if (systems.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No secretion systems found.</p>
        <p className="text-sm text-gray-500 mt-2">
          Run the seed-secretome script to populate data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System selector */}
      <div className="flex gap-2 flex-wrap">
        {systems.map((system) => (
          <button
            key={system.id}
            onClick={() => setSelectedSystem(system)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSystem?.id === system.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {system.type} - {system.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {selectedSystem && (
        <div className="space-y-4">
          {/* System overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSystem.name}</h2>
                <p className="text-gray-600 mt-1">{selectedSystem.description}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-gray-500">
                    <strong>Type:</strong> {selectedSystem.type}
                  </span>
                  <span className="text-gray-500">
                    <strong>Components:</strong> {selectedSystem.components.length}
                  </span>
                  <span className="text-gray-500">
                    <strong>Genomic span:</strong>{' '}
                    {selectedSystem.startPosition.toLocaleString()} -{' '}
                    {selectedSystem.endPosition.toLocaleString()} bp
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {selectedSystem.type}
              </span>
            </div>
          </div>

          {/* Genomic visualization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genomic Organization</h3>
            <div className="relative">
              <div className="h-24 bg-gray-100 rounded-lg relative">
                {selectedSystem.components.map((component) => {
                  const systemLength = selectedSystem.endPosition - selectedSystem.startPosition;
                  const componentStart = component.genomicStart - selectedSystem.startPosition;
                  const componentLength = component.genomicEnd - component.genomicStart;
                  const leftPercent = (componentStart / systemLength) * 100;
                  const widthPercent = (componentLength / systemLength) * 100;

                  const location = component.protein?.secretionInfo?.predictedLocation || 'Unknown';
                  const colorClass = getLocationColor(location);

                  return (
                    <div
                      key={component.id}
                      className={`absolute top-2 bottom-2 ${colorClass} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer group`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={`${component.componentName} (${component.locusTag})`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {component.componentName}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{selectedSystem.startPosition.toLocaleString()} bp</span>
                <span>{selectedSystem.endPosition.toLocaleString()} bp</span>
              </div>
            </div>
          </div>

          {/* Components table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">System Components</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gene
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Function
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protein
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedSystem.components.map((component) => (
                    <tr 
                      key={component.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedProtein(component);
                        setShowStructureViewer(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.componentName}
                        <div className="text-xs text-gray-500">{component.locusTag}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-sm">
                          <span className="mr-1">{getComponentTypeIcon(component.componentType)}</span>
                          {component.componentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {component.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {component.protein?.secretionInfo && (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              component.protein.secretionInfo.predictedLocation
                                ? getLocationColor(component.protein.secretionInfo.predictedLocation) + ' text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {component.protein.secretionInfo.predictedLocation || 'Unknown'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {component.protein ? (
                          <>
                            {component.protein.accession}
                            {component.protein.sequenceLength && (
                              <div className="text-xs text-gray-500">
                                {component.protein.sequenceLength} aa
                              </div>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {component.genomicStart.toLocaleString()}..{component.genomicEnd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Location Legend</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Extracellular', color: 'bg-red-500' },
                { name: 'Outer Membrane', color: 'bg-orange-500' },
                { name: 'Periplasmic', color: 'bg-yellow-500' },
                { name: 'Inner Membrane', color: 'bg-green-500' },
                { name: 'Cytoplasmic', color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${item.color}`}></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Click any protein in the table to view its 3D structure
            </p>
          </div>

          {/* AlphaFold Structure Viewer */}
          {showStructureViewer && selectedProtein && (
            <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  3D Structure Viewer
                </h3>
                <button
                  onClick={() => setShowStructureViewer(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <AlphaFoldViewer
                proteinAccession={selectedProtein.protein?.accession}
                proteinName={`${selectedProtein.componentName} (${selectedProtein.componentType})`}
                sequence={selectedProtein.protein?.sequence}
                showControls={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
