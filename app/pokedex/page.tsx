import React from 'react';

const pokedexEntries = [
    { number: 1, scientificName: 'Species A', biofilmScore: 8, pathogenicityBadge: 'High' },
    { number: 2, scientificName: 'Species B', biofilmScore: 4, pathogenicityBadge: 'Low' },
    { number: 3, scientificName: 'Species C', biofilmScore: 6, pathogenicityBadge: 'Medium' },
    // Add more entries as needed
];

const PokedexPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Pokedex</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pokedexEntries.map(entry => (
                    <div key={entry.number} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-semibold">{entry.number}: {entry.scientificName}</h2>
                        <p className="text-gray-600">Biofilm Capability Score: {entry.biofilmScore}</p>
                        <p className="text-gray-600">Pathogenicity: {entry.pathogenicityBadge}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PokedexPage;