import React from 'react';
import './Pokedex.css'; // Include your CSS file for styling

const pokedexEntries = [
    { number: 1, scientificName: 'Species A', biofilmScore: 8, pathogenicityBadge: 'High' },
    { number: 2, scientificName: 'Species B', biofilmScore: 4, pathogenicityBadge: 'Low' },
    { number: 3, scientificName: 'Species C', biofilmScore: 6, pathogenicityBadge: 'Medium' },
    // Add more entries as needed
];

const PokedexPage = () => {
    return (
        <div className="pokedex-container">
            <h1>Pokedex</h1>
            <div className="pokedex-grid">
                {pokedexEntries.map(entry => (
                    <div key={entry.number} className="pokedex-entry">
                        <h2>{entry.number}: {entry.scientificName}</h2>
                        <p>Biofilm Capability Score: {entry.biofilmScore}</p>
                        <p>Pathogenicity: {entry.pathogenicityBadge}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PokedexPage;