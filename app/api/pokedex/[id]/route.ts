import { NextResponse } from 'next/server';

// Mock data for Pokedex entry details
const pokedexEntries: Record<string, any> = {
    '1': {
        id: 1,
        name: 'Species A',
        genomics: {
            genomeSize: '2.1 Mb',
            gcContent: '42%',
            chromosomes: 1
        },
        phenotype: {
            gramStain: 'Positive',
            cellShape: 'Coccoid',
            motility: 'Non-motile'
        },
        ecology: {
            habitat: 'Oral cavity',
            pathogenicity: 'High'
        },
        geneMappings: {
            totalGenes: 2000,
            annotatedGenes: 1800
        },
        alphaFoldPredictions: {
            available: false
        },
        researchData: {
            publications: 150,
            citations: 2500
        },
    },
    '2': {
        id: 2,
        name: 'Species B',
        genomics: {
            genomeSize: '1.8 Mb',
            gcContent: '38%',
            chromosomes: 1
        },
        phenotype: {
            gramStain: 'Negative',
            cellShape: 'Rod',
            motility: 'Motile'
        },
        ecology: {
            habitat: 'Oral cavity',
            pathogenicity: 'Low'
        },
        geneMappings: {
            totalGenes: 1700,
            annotatedGenes: 1500
        },
        alphaFoldPredictions: {
            available: false
        },
        researchData: {
            publications: 80,
            citations: 1200
        },
    },
    '3': {
        id: 3,
        name: 'Species C',
        genomics: {
            genomeSize: '2.5 Mb',
            gcContent: '45%',
            chromosomes: 1
        },
        phenotype: {
            gramStain: 'Positive',
            cellShape: 'Coccoid',
            motility: 'Non-motile'
        },
        ecology: {
            habitat: 'Oral cavity',
            pathogenicity: 'Medium'
        },
        geneMappings: {
            totalGenes: 2200,
            annotatedGenes: 2000
        },
        alphaFoldPredictions: {
            available: false
        },
        researchData: {
            publications: 120,
            citations: 1800
        },
    },
};

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const entry = pokedexEntries[id];

    if (!entry) {
        return NextResponse.json({ error: 'Pokedex entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
}