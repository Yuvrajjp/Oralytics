import { NextResponse } from 'next/server';

// Mock data for Pokedex entry details
const pokedexEntries: Record<string, any> = {
    '1': {
        id: 1,
        name: 'Bulbasaur',
        genomics: {},
        phenotype: {},
        ecology: {},
        geneMappings: {},
        alphaFoldPredictions: {},
        researchData: {},
    },
    // More entries can be added here.
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const entry = pokedexEntries[id];

    if (!entry) {
        return NextResponse.json({ error: 'Pokedex entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
}