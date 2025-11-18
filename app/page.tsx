'use client';

import { useState } from 'react';
import { GeneViewer } from '@/components/gene-viewer';
import { ProteinProperties } from '@/components/protein-properties';
import { PathwayDiagram } from '@/components/pathway-diagram';
import { ProteinComparison } from '@/components/protein-comparison';
import { GenomicContextViewer } from '@/components/genomic-context';
import { aaFlp1Gene, aaDcuBGene } from '@/lib/gene-data';
import { aaFlp1Context, aaDcuCContext } from '@/lib/pnag-pathway';

type ViewMode = 'overview' | 'aaflp1' | 'aadcuc' | 'pathway' | 'comparison';

export default function Page() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <section className="mb-10 space-y-6">
          <div className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            MVP Showcase
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white md:text-6xl">
              Oralytics Gene Explorer
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
              Exploring two key genes from <em className="text-sky-300">Aggregatibacter actinomycetemcomitans</em> 
              {' '}CU1000N: AaFlp-1 (Flp pilus protein) and AaDcuC (C4-dicarboxylate transporter) 
              within the PNAG EPS biosynthesis system.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <nav className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setViewMode('overview')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('aaflp1')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'aaflp1'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            AaFlp-1 Gene
          </button>
          <button
            onClick={() => setViewMode('aadcuc')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'aadcuc'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            AaDcuC Gene
          </button>
          <button
            onClick={() => setViewMode('pathway')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'pathway'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            PNAG Pathway
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Protein Comparison
          </button>
        </nav>

        {/* Content */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-sm md:p-8">
          {viewMode === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-3xl font-semibold text-white">Welcome to the Gene Explorer</h2>
                <p className="text-slate-300">
                  This MVP showcases two critical genes in <em>A. actinomycetemcomitans</em> biofilm formation and metabolism.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-blue-200">AaFlp-1</h3>
                  <p className="mb-3 text-sm text-slate-400">{aaFlp1Gene.description}</p>
                  <p className="mb-4 text-sm text-slate-300">{aaFlp1Gene.function}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Protein ID:</span>
                      <span className="font-mono text-white">{aaFlp1Gene.proteinId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Length:</span>
                      <span className="font-mono text-white">{aaFlp1Gene.properties.length} aa</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">MW:</span>
                      <span className="font-mono text-white">{aaFlp1Gene.properties.molecularWeight} Da</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewMode('aaflp1')}
                    className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Explore AaFlp-1 →
                  </button>
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-emerald-200">AaDcuC</h3>
                  <p className="mb-3 text-sm text-slate-400">{aaDcuBGene.description}</p>
                  <p className="mb-4 text-sm text-slate-300">{aaDcuBGene.function}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Protein ID:</span>
                      <span className="font-mono text-white">{aaDcuBGene.proteinId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Length:</span>
                      <span className="font-mono text-white">{aaDcuBGene.properties.length} aa</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">MW:</span>
                      <span className="font-mono text-white">{aaDcuBGene.properties.molecularWeight} Da</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewMode('aadcuc')}
                    className="mt-4 w-full rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Explore AaDcuC →
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-6">
                <h3 className="mb-3 text-xl font-semibold text-purple-200">PNAG EPS Biosynthesis</h3>
                <p className="mb-4 text-sm text-slate-300">
                  Both genes play crucial roles in the PNAG (Poly-β-1,6-N-acetyl-D-glucosamine) 
                  exopolysaccharide system. AaFlp-1 provides structural adhesion through pili assembly, 
                  while AaDcuC supplies metabolic energy via C4-dicarboxylate transport for fumarate respiration.
                </p>
                <button
                  onClick={() => setViewMode('pathway')}
                  className="rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  View Pathway Diagram →
                </button>
              </div>
            </div>
          )}

          {viewMode === 'aaflp1' && (
            <div className="space-y-8">
              <GeneViewer gene={aaFlp1Gene} />
              <ProteinProperties gene={aaFlp1Gene} />
              <GenomicContextViewer context={aaFlp1Context} geneName="AaFlp-1" />
            </div>
          )}

          {viewMode === 'aadcuc' && (
            <div className="space-y-8">
              <GeneViewer gene={aaDcuBGene} />
              <ProteinProperties gene={aaDcuBGene} />
              <GenomicContextViewer context={aaDcuCContext} geneName="AaDcuC" />
            </div>
          )}

          {viewMode === 'pathway' && <PathwayDiagram />}

          {viewMode === 'comparison' && (
            <ProteinComparison gene1={aaFlp1Gene} gene2={aaDcuBGene} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>
            Data extracted from <em>Aggregatibacter actinomycetemcomitans</em> CU1000N genome (CP076449.1)
          </p>
          <p className="mt-1">
            Showcasing genomic analysis without external APIs or database dependencies
          </p>
        </footer>
      </div>
    </main>
  );
}
