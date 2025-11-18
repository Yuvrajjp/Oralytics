import React from 'react';
import Link from 'next/link';

const pokedexEntries = [
    { number: 1, scientificName: 'Species A', biofilmScore: 8, pathogenicityBadge: 'High' },
    { number: 2, scientificName: 'Species B', biofilmScore: 4, pathogenicityBadge: 'Low' },
    { number: 3, scientificName: 'Species C', biofilmScore: 6, pathogenicityBadge: 'Medium' },
];

export default function PokedexPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-4xl font-semibold text-white mb-8">Pokedex</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pokedexEntries.map(entry => (
                    <Link 
                        key={entry.number} 
                        href={`/pokedex/${entry.number}`}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 hover:bg-slate-900/80 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            {entry.number}: {entry.scientificName}
                        </h2>
                        <p className="text-slate-300 mb-2">
                            Biofilm Capability Score: <span className="font-semibold">{entry.biofilmScore}</span>
                        </p>
                        <p className="text-slate-300">
                            Pathogenicity: <span className="font-semibold">{entry.pathogenicityBadge}</span>
                        </p>
                    </Link>
                ))}
            </div>
        </main>
    );
}