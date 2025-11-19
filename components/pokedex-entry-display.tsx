"use client";

import { useState } from "react";
import type { MicrobialPokedexEntry } from "@/lib/pokedex-types";

interface PokedexEntryDisplayProps {
  entry: MicrobialPokedexEntry;
}

type TabType = "genomics" | "translation" | "alphafold" | "research" | "phenotype";

export function PokedexEntryDisplay({ entry }: PokedexEntryDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>("genomics");

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "genomics", label: "Genomics Overview" },
    { id: "translation", label: "Gene-to-Protein" },
    { id: "alphafold", label: "AlphaFold Predictions" },
    { id: "research", label: "Research Data" },
    { id: "phenotype", label: "Phenotype" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header with enhanced design */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-slate-500">#{entry.pokedexNumber.toString().padStart(3, "0")}</span>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {entry.organism.scientificName}
              </h2>
            </div>
            {entry.nickname && (
              <p className="mt-3 text-xl italic text-sky-200">&quot;{entry.nickname}&quot;</p>
            )}
            {entry.organism.commonName && (
              <p className="mt-2 text-base text-slate-400">{entry.organism.commonName}</p>
            )}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 px-6 py-4 shadow-lg shadow-purple-500/20 border border-purple-400/20">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-200">Rarity</p>
            <p className="mt-1 text-2xl font-bold text-white">{entry.rarity}</p>
          </div>
        </div>
        {entry.discoveredBy && (
          <div className="mt-6 flex flex-wrap gap-8 text-sm text-slate-400">
            <p>
              <span className="text-slate-500">Discovered by:</span>{" "}
              <span className="font-medium text-slate-200">{entry.discoveredBy}</span>
            </p>
            {entry.discoveryYear && (
              <p>
                <span className="text-slate-500">Year:</span>{" "}
                <span className="font-medium text-slate-200">{entry.discoveryYear}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Tabs with better hover effects */}
      <div className="flex gap-3 overflow-x-auto border-b border-white/10 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 shadow-lg shadow-sky-500/20 border border-sky-400/20"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 animate-pulse" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "genomics" && <GenomicsTab entry={entry} />}
        {activeTab === "translation" && <TranslationTab entry={entry} />}
        {activeTab === "alphafold" && <AlphaFoldTab entry={entry} />}
        {activeTab === "research" && <ResearchTab entry={entry} />}
        {activeTab === "phenotype" && <PhenotypeTab entry={entry} />}
      </div>
    </div>
  );
}

function GenomicsTab({ entry }: { entry: MicrobialPokedexEntry }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="GC Content" value={entry.genomics.gcContent ? `${entry.genomics.gcContent.toFixed(1)}%` : "N/A"} />
        <StatCard label="Genome Completeness" value={entry.genomics.genomeCompleteness ? `${entry.genomics.genomeCompleteness.toFixed(1)}%` : "N/A"} />
        <StatCard label="Chromosomes" value={entry.genomics.chromosomalOrganization.length.toString()} />
      </div>

      {/* Chromosomal Organization - Enhanced and Larger */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-8 backdrop-blur-sm shadow-xl">
        <h3 className="mb-8 text-2xl font-bold text-white">Chromosomal Organization</h3>
        <div className="space-y-10">
          {entry.genomics.chromosomalOrganization.map((chr, idx) => (
            <div key={idx} className="group">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-xl font-bold bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
                  {chr.chromosomeName}
                </h4>
                <span className="text-base font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                  {chr.startPosition.toLocaleString()} - {chr.endPosition.toLocaleString()} bp
                </span>
              </div>
              
              {/* Large visual chromosome representation */}
              <div className="mb-6 relative h-8 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-700/50 overflow-hidden shadow-inner">
                {chr.regions.map((region, ridx) => {
                  const totalLength = chr.endPosition - chr.startPosition;
                  const regionStart = ((region.start - chr.startPosition) / totalLength) * 100;
                  const regionWidth = ((region.end - region.start) / totalLength) * 100;
                  
                  return (
                    <div
                      key={ridx}
                      className="absolute top-0 bottom-0 transition-all duration-300 hover:opacity-80 hover:scale-y-110 cursor-pointer group/region"
                      style={{
                        left: `${regionStart}%`,
                        width: `${regionWidth}%`,
                        backgroundColor: region.color || "#64748b",
                      }}
                      title={`${region.name}: ${region.start.toLocaleString()} - ${region.end.toLocaleString()}`}
                    />
                  );
                })}
              </div>
              
              {/* Region details */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chr.regions.map((region, ridx) => (
                  <div
                    key={ridx}
                    className="group/card rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="h-10 w-10 rounded-xl shadow-lg transition-transform duration-300 group-hover/card:scale-110"
                        style={{ backgroundColor: region.color || "#64748b" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white truncate group-hover/card:text-sky-300 transition-colors">
                          {region.name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-400 group-hover/card:text-slate-300 transition-colors">
                          {region.type}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 group-hover/card:text-slate-400 transition-colors">
                          {region.start.toLocaleString()} - {region.end.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sequence Snippets */}
      {entry.genomics.dnaSequence && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">DNA Sequence Sample</h3>
          <div className="overflow-x-auto rounded-lg bg-slate-900/50 p-4">
            <code className="break-all font-mono text-xs text-green-300">
              {entry.genomics.dnaSequence.substring(0, 200)}
              {entry.genomics.dnaSequence.length > 200 && "..."}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function TranslationTab({ entry }: { entry: MicrobialPokedexEntry }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">Gene-to-protein translation pipeline showing coding sequences and their translated products</p>
      
      {entry.geneProteinMappings.map((mapping, idx) => (
        <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{mapping.geneLocus}</h3>
            <div className="flex gap-4 text-sm text-slate-400">
              <span>Frame: {mapping.readingFrame}</span>
              <span>{mapping.proteinLength} aa</span>
              <span>{mapping.molecularWeight} kDa</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Coding Sequence (DNA)</p>
              <div className="overflow-x-auto rounded-lg bg-slate-900/50 p-3">
                <code className="break-all font-mono text-xs text-blue-300">
                  <span className="font-bold text-green-400">{mapping.startCodon}</span>
                  {mapping.codingSequence.substring(3, Math.min(mapping.codingSequence.length - 3, 150))}
                  {mapping.codingSequence.length > 156 && "..."}
                  <span className="font-bold text-red-400">{mapping.stopCodon}</span>
                </code>
              </div>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="text-2xl text-sky-400">↓</div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Translated Protein Sequence</p>
              <div className="overflow-x-auto rounded-lg bg-slate-900/50 p-3">
                <code className="break-all font-mono text-xs text-purple-300">
                  {mapping.translatedSequence.substring(0, 100)}
                  {mapping.translatedSequence.length > 100 && "..."}
                </code>
              </div>
            </div>
          </div>
        </div>
      ))}

      {entry.geneProteinMappings.length === 0 && (
        <p className="text-center text-slate-400">No gene-protein mappings available</p>
      )}
    </div>
  );
}

function AlphaFoldTab({ entry }: { entry: MicrobialPokedexEntry }) {
  return (
    <div className="space-y-6">
      {entry.alphaFoldPredictions.map((prediction, idx) => (
        <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{prediction.alphafoldId}</h3>
              <p className="text-sm text-slate-400">Model version: {prediction.modelVersion}</p>
            </div>
            {prediction.pdbUrl && (
              <a
                href={prediction.pdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/30"
              >
                View PDB
              </a>
            )}
          </div>

          {/* Quality Metrics */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Mean pLDDT" value={prediction.meanPlddtScore.toFixed(1)} />
            {prediction.ptmScore && <StatCard label="PTM Score" value={prediction.ptmScore.toFixed(2)} />}
            {prediction.paeValue && <StatCard label="PAE" value={prediction.paeValue.toFixed(1)} />}
            {prediction.domainCount && <StatCard label="Domains" value={prediction.domainCount.toString()} />}
          </div>

          {/* Secondary Structure */}
          {prediction.secondaryStructure && (
            <div className="mb-6 rounded-lg bg-slate-900/50 p-4">
              <p className="mb-3 text-sm font-medium text-white">Secondary Structure Composition</p>
              <div className="space-y-2">
                <StructureBar label="α-Helix" percentage={prediction.secondaryStructure.helix} color="bg-purple-500" />
                <StructureBar label="β-Sheet" percentage={prediction.secondaryStructure.sheet} color="bg-blue-500" />
                <StructureBar label="Coil" percentage={prediction.secondaryStructure.coil} color="bg-green-500" />
              </div>
            </div>
          )}

          {/* Confidence Regions */}
          <div>
            <h4 className="mb-3 text-md font-semibold text-white">Confidence Regions</h4>
            <div className="space-y-2">
              {prediction.confidenceRegions.map((region, ridx) => (
                <div key={ridx} className="rounded-lg bg-slate-900/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Residues {region.startResidue} - {region.endResidue}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceBadgeColor(region.confidenceLevel)}`}>
                      {region.confidenceLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>pLDDT: {region.plddtScore.toFixed(1)}</span>
                    {region.structuralFeature && <span>• {region.structuralFeature}</span>}
                  </div>
                  {region.functionalImportance && (
                    <p className="mt-2 text-xs text-slate-300">{region.functionalImportance}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {entry.alphaFoldPredictions.length === 0 && (
        <p className="text-center text-slate-400">No AlphaFold predictions available</p>
      )}
    </div>
  );
}

function ResearchTab({ entry }: { entry: MicrobialPokedexEntry }) {
  const data = entry.researchData;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Relative Abundance" value={`${data.relativeAbundance.toFixed(1)}%`} />
        <StatCard label="Pathogenicity Score" value={`${data.pathogenicityScore.toFixed(1)}/100`} />
        <StatCard label="Biofilm Capability" value={data.biofilmCapability} />
      </div>

      {/* Clinical Relevance */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Clinical Relevance</h3>
        <p className="text-sm leading-relaxed text-slate-300">{data.clinicalRelevance}</p>
      </div>

      {/* Disease Associations */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Disease Associations</h3>
        <div className="space-y-3">
          {data.diseaseAssociations.map((disease, idx) => (
            <div key={idx} className="rounded-lg bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium text-white">{disease.disease}</h4>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getAssociationBadgeColor(disease.associationStrength)}`}>
                  {disease.associationStrength}
                </span>
              </div>
              <p className="text-xs text-slate-400">{disease.evidence}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Virulence Factors */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Virulence Factors</h3>
        <div className="space-y-4">
          {data.virulenceFactors.map((factor, idx) => (
            <div key={idx} className="rounded-lg border border-white/5 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">{factor.factorName}</h4>
                  <p className="text-xs text-slate-400">{factor.factorType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-sky-300">{factor.virulenceScore.toFixed(0)}/100</p>
                  <span className={`text-xs ${getEvidenceBadgeColor(factor.evidenceLevel)}`}>
                    {factor.evidenceLevel}
                  </span>
                </div>
              </div>
              <p className="mb-2 text-sm text-slate-300">{factor.description}</p>
              {factor.mechanismOfAction && (
                <p className="text-xs text-slate-400">
                  <span className="font-medium">Mechanism:</span> {factor.mechanismOfAction}
                </p>
              )}
              {factor.targetTissue && (
                <p className="text-xs text-slate-400">
                  <span className="font-medium">Target:</span> {factor.targetTissue}
                </p>
              )}
              {factor.dataSource && (
                <p className="mt-2 text-xs italic text-slate-500">{factor.dataSource}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metabolic & Resistance Profiles */}
      <div className="grid gap-6 md:grid-cols-2">
        {entry.metabolicProfile && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Metabolic Pathways</h3>
            <div className="space-y-3">
              {entry.metabolicProfile.pathways.map((pathway, idx) => (
                <div key={idx} className="rounded-lg bg-slate-900/50 p-3">
                  <p className="font-medium text-sky-300">{pathway.name}</p>
                  <p className="text-xs text-slate-400">{pathway.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {entry.antibioticResistance && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Antibiotic Resistance</h3>
            <div className="space-y-2">
              {entry.antibioticResistance.antibiotics.map((antibiotic, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
                  <span className="text-sm text-white">{antibiotic.name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResistanceBadgeColor(antibiotic.resistance)}`}>
                    {antibiotic.resistance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhenotypeTab({ entry }: { entry: MicrobialPokedexEntry }) {
  const phenotype = entry.phenotype;
  const ecology = entry.ecology;

  return (
    <div className="space-y-6">
      {/* Phenotypic Characteristics */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Phenotypic Characteristics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <CharacteristicItem label="Cell Morphology" value={phenotype.cellMorphology} />
          <CharacteristicItem label="Gram Stain" value={phenotype.gramStain} />
          <CharacteristicItem label="Metabolism" value={phenotype.metabolism} />
          <CharacteristicItem label="Oxygen Requirement" value={phenotype.oxygenRequirement} />
          <CharacteristicItem label="Motility" value={phenotype.motility} />
          {phenotype.optimalTemperature && (
            <CharacteristicItem label="Optimal Temperature" value={`${phenotype.optimalTemperature}°C`} />
          )}
          {phenotype.optimalPh && (
            <CharacteristicItem label="Optimal pH" value={phenotype.optimalPh.toString()} />
          )}
        </div>
      </div>

      {/* Ecological Characteristics */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Ecological Profile</h3>
        <div className="space-y-4">
          {ecology.primaryHabitat && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Primary Habitat</p>
              <p className="text-sm text-white">{ecology.primaryHabitat}</p>
            </div>
          )}
          {ecology.ecologicalNiche && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Ecological Niche</p>
              <p className="text-sm text-white">{ecology.ecologicalNiche}</p>
            </div>
          )}
          {ecology.symbioticRelations && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Symbiotic Relations</p>
              <p className="text-sm text-white">{ecology.symbioticRelations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:-translate-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white group-hover:text-sky-300 transition-colors">{value}</p>
    </div>
  );
}

function CharacteristicItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="group rounded-xl bg-slate-900/50 p-4 transition-all duration-300 hover:bg-slate-800/70 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">{value || "Unknown"}</p>
    </div>
  );
}

function StructureBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div className="group">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
        <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800 shadow-inner">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out shadow-lg`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

// Badge color helpers
function getConfidenceBadgeColor(level: string): string {
  switch (level) {
    case "Very high":
      return "bg-green-500/20 text-green-300";
    case "High":
      return "bg-blue-500/20 text-blue-300";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-300";
    case "Low":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}

function getAssociationBadgeColor(strength: string): string {
  switch (strength) {
    case "Strong":
      return "bg-red-500/20 text-red-300";
    case "Moderate":
      return "bg-yellow-500/20 text-yellow-300";
    case "Weak":
      return "bg-green-500/20 text-green-300";
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}

function getEvidenceBadgeColor(level: string): string {
  switch (level) {
    case "Confirmed":
      return "text-green-400";
    case "Probable":
      return "text-yellow-400";
    case "Predicted":
      return "text-slate-400";
    default:
      return "text-slate-400";
  }
}

function getResistanceBadgeColor(resistance: string): string {
  switch (resistance) {
    case "Resistant":
      return "bg-red-500/20 text-red-300";
    case "Intermediate":
      return "bg-yellow-500/20 text-yellow-300";
    case "Susceptible":
      return "bg-green-500/20 text-green-300";
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}
