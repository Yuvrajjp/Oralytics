import { NextResponse } from 'next/server';

// Sample Pokedex entries
const pokedexEntries = [
    { id: 1, scientificName: 'Species A', pathogenicity: true, biofilmFormation: false },
    { id: 2, scientificName: 'Species B', pathogenicity: false, biofilmFormation: true },
    // Add more entries as needed
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const scientificName = searchParams.get('scientificName');
    const pathogenicity = searchParams.get('pathogenicity');
    const biofilmFormation = searchParams.get('biofilmFormation');

    // Filter Pokedex entries based on query parameters
    let filteredEntries = pokedexEntries;

    if (scientificName) {
        filteredEntries = filteredEntries.filter(entry => entry.scientificName.toLowerCase().includes(scientificName.toLowerCase()));
    }
    if (pathogenicity !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.pathogenicity.toString() === pathogenicity);
    }
    if (biofilmFormation !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.biofilmFormation.toString() === biofilmFormation);
    }

    // Pagination logic
    const totalEntries = filteredEntries.length;
    const totalPages = Math.ceil(totalEntries / limit);
    const paginatedEntries = filteredEntries.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ totalEntries, totalPages, currentPage: page, entries: paginatedEntries });
}