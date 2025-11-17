'use client';

import React, { useEffect, useState } from 'react';
import { MolecularCentralDogmaInfographic } from '@/components/molecular-infographic';
import { ProteinGallery } from '@/components/protein-gallery';

interface ProteinData {
  id: string;
  accession: string;
  name: string;
  description: string;
  sequenceLength: number;
  molecularWeight: number;
  localization: string;
  geneName: string;
  geneId: string;
  organismId: string;
  organismName: string;
}

interface Stats {
  totalProteins: number;
  totalGenes: number;
  totalOrganisms: number;
  averageMolecularWeight: string;
  averageSequenceLength: string;
  proteinsByOrganism: Record<string, number>;
  proteinsByLocalization: Record<string, number>;
}

export default function ProteinsPage() {
  const [proteins, setProteins] = useState<ProteinData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProteins = async () => {
      try {
        setIsLoading(true);
        const [respMain, respCat] = await Promise.all([
          fetch('/api/proteins'),
          fetch('/api/proteins/categorized'),
        ]);

        if (!respMain.ok) throw new Error('Failed to fetch proteins (main)');
        if (!respCat.ok) throw new Error('Failed to fetch proteins (categorized)');

        const dataMain = await respMain.json();
        const dataCat = await respCat.json();

        // Merge classification fields from categorized endpoint into main protein list by id
        const catById = new Map<string, any>();
        for (const p of dataCat.proteins || []) catById.set(p.id, p);

        const merged = (dataMain.proteins || []).map((p: any) => ({
          ...p,
          functionClass: catById.get(p.id)?.functionClass || null,
          structureClass: catById.get(p.id)?.structureClass || null,
          predictedLocalization: catById.get(p.id)?.predictedLocalization || null,
        }));

        setProteins(merged);
        setStats(dataMain.stats || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProteins();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Infographic Section */}
        <section className="mb-16">
          <MolecularCentralDogmaInfographic />
        </section>

        {/* Stats Section */}
        {stats && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Protein Universe at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg">
                <p className="text-sm text-blue-300 uppercase font-semibold mb-2">Total Proteins</p>
                <p className="text-4xl font-bold">{stats.totalProteins}</p>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg">
                <p className="text-sm text-green-300 uppercase font-semibold mb-2">Total Genes</p>
                <p className="text-4xl font-bold">{stats.totalGenes}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg">
                <p className="text-sm text-purple-300 uppercase font-semibold mb-2">Organisms</p>
                <p className="text-4xl font-bold">{stats.totalOrganisms}</p>
              </div>
              <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-lg">
                <p className="text-sm text-red-300 uppercase font-semibold mb-2">Avg MW</p>
                <p className="text-3xl font-bold">{stats.averageMolecularWeight}</p>
                <p className="text-xs text-red-200">kDa</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg">
                <p className="text-sm text-yellow-300 uppercase font-semibold mb-2">Avg Length</p>
                <p className="text-3xl font-bold">{stats.averageSequenceLength}</p>
                <p className="text-xs text-yellow-200">amino acids</p>
              </div>
            </div>
          </section>
        )}

        {/* Breakdown Tables */}
        {stats && (
          <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Organism */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Proteins by Organism</h3>
              <div className="space-y-2">
                {Object.entries(stats.proteinsByOrganism)
                  .sort(([, a], [, b]) => b - a)
                  .map(([org, count]) => (
                    <div key={org} className="flex justify-between items-center">
                      <span className="text-slate-300">{org}</span>
                      <span className="bg-blue-600 px-3 py-1 rounded-full font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Localization */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Proteins by Localization</h3>
              <div className="space-y-2">
                {Object.entries(stats.proteinsByLocalization)
                  .sort(([, a], [, b]) => b - a)
                  .map(([loc, count]) => (
                    <div key={loc} className="flex justify-between items-center">
                      <span className="text-slate-300">{loc}</span>
                      <span className="bg-green-600 px-3 py-1 rounded-full font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Protein Gallery */}
        <section>
          {error ? (
            <div className="bg-red-900 border border-red-600 p-4 rounded text-red-100">
              Error: {error}
            </div>
          ) : (
            <ProteinGallery proteins={proteins} isLoading={isLoading} />
          )}
        </section>
      </div>
    </main>
  );
}
