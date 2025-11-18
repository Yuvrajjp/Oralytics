'use strict';

// Import required libraries
import fs from 'fs';
import path from 'path';
import { parseGFF3, parseFASTA, parseGeneResults } from './parsers';
import { loadToDatabase } from './db';

// Metadata for Aggregatibacter actinomycetemcomitans
dconst metadata = {
    genomeSize: '2.6MB',
    gcContent: '43.2%',
    totalGenes: 2287,
    virulenceFactors: [], // Add relevant data
    metabolicPathways: [], // Add relevant data
    antibioticResistanceProfiles: [] // Add relevant data
};

async function loadPokedexData() {
    try {
        // Path to the genomic datasets
        const geneResultPath = path.join(__dirname, 'data/gene_result.txt');
        const fastaPath = path.join(__dirname, 'data/genome.fasta');
        const gff3Path = path.join(__dirname, 'data/annotations.gff3');

        // Parse the datasets
        const genes = parseGeneResults(geneResultPath);
        const fastaData = await parseFASTA(fastaPath);
        const gff3Data = await parseGFF3(gff3Path);

        // Process and load data into the database
        await loadToDatabase(genes, fastaData, gff3Data, metadata);

        console.log('Data loaded successfully into the Pokedex database.');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Execute the loading function
loadPokedexData();
