# Microbial Pokedex System Documentation

## Overview

The Microbial Pokedex is a comprehensive database system that catalogs oral microbiome organisms with detailed genomic, proteomic, and clinical research data. It integrates multiple data sources including:

- **Genomic data**: Complete DNA/RNA sequences, chromosomal organization, GC content
- **Gene-to-protein translation**: Coding sequences with translation pipeline data
- **AlphaFold predictions**: Protein structure predictions with confidence metrics
- **Clinical research**: Dr. Cugini's laboratory data on disease associations and virulence
- **Phenotypic characteristics**: Morphology, metabolism, environmental preferences
- **Metabolic profiles**: Pathway information and antibiotic resistance data

## Database Schema

### Core Models

#### MicrobialPokedexEntry
The main entry model containing:
- Pokedex number (unique identifier)
- Organism reference
- Discovery metadata (discoverer, year, rarity)
- Genomic sequences (DNA, RNA)
- Phenotypic characteristics
- Ecological information
- Clinical metrics (abundance, pathogenicity, biofilm capability)
- Metabolic and resistance profiles

#### GeneProteinMapping
Gene-to-protein translation data:
- Coding sequence (CDS)
- Translated amino acid sequence
- Start/stop codons
- Reading frame
- Protein characteristics (length, molecular weight, isoelectric point)

#### AlphaFoldPrediction
Protein structure predictions:
- AlphaFold ID and model version
- Quality metrics (pLDDT, PTM, PAE scores)
- PDB file URL
- Domain count
- Secondary structure composition

#### ConfidenceRegion
Per-residue confidence data for AlphaFold predictions:
- Residue range
- Confidence level (Very high, High, Medium, Low)
- pLDDT score
- Structural features
- Functional importance notes

#### VirulenceFactor
Pathogenicity-related factors:
- Factor name and type (Adhesin, Toxin, Enzyme, etc.)
- Virulence score (0-100)
- Mechanism of action
- Target tissue
- Evidence level (Confirmed, Probable, Predicted)

## API Endpoints

### GET /api/pokedex
List all Pokedex entries with optional filtering.

**Query Parameters:**
- `rarity`: Filter by rarity level (Common, Uncommon, Rare, Legendary)
- `habitat`: Filter by primary habitat (case-insensitive substring match)
- `metabolism`: Filter by metabolism type
- `minPathogenicity`: Minimum pathogenicity score (0-100)
- `maxPathogenicity`: Maximum pathogenicity score (0-100)
- `hasAlphaFold`: Filter entries with AlphaFold predictions (true/false)
- `search`: Search organism name (case-insensitive)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

**Response:**
```json
{
  "entries": [
    {
      "id": "entry_id",
      "pokedexNumber": 1,
      "organism": {
        "scientificName": "Actinomyces arrgebbcater",
        "commonName": "Oral Actinomyces"
      },
      "nickname": "The Silent Colonizer",
      "rarity": "Common",
      "primaryHabitat": "Oral cavity, dental plaque",
      "pathogenicityScore": 65.5
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### GET /api/pokedex/[id]
Get a single Pokedex entry with all related data.

**Response:**
```json
{
  "entry": {
    "id": "entry_id",
    "pokedexNumber": 1,
    "organism": { ... },
    "genomics": { ... },
    "phenotype": { ... },
    "ecology": { ... },
    "geneProteinMappings": [ ... ],
    "alphaFoldPredictions": [ ... ],
    "researchData": { ... },
    "metabolicProfile": { ... },
    "antibioticResistance": { ... }
  }
}
```

## UI Components

### PokedexEntryDisplay
A comprehensive tabbed interface component displaying:

1. **Genomics Overview Tab**
   - GC content, genome completeness
   - Chromosomal organization with annotated regions
   - DNA/RNA sequence samples

2. **Gene-to-Protein Translation Tab**
   - Coding sequences with start/stop codons highlighted
   - Translated protein sequences
   - Molecular characteristics

3. **AlphaFold Predictions Tab**
   - Quality metrics (pLDDT, PTM, PAE)
   - Secondary structure composition
   - Confidence regions with structural annotations
   - Links to PDB files

4. **Research Data Tab**
   - Clinical relevance summary
   - Disease associations with evidence
   - Virulence factors with mechanisms
   - Metabolic pathways
   - Antibiotic resistance profiles

5. **Phenotype Tab**
   - Morphological characteristics
   - Metabolic properties
   - Environmental preferences
   - Ecological information

## Pages

### /pokedex
Main listing page showing:
- Statistics dashboard (total entries, legendary count, etc.)
- Grid of Pokedex entries with key information
- Filtering and search capabilities

### /pokedex/[id]
Individual entry page displaying:
- Complete organism dossier
- Tabbed interface with all data categories
- Related resources and links

## Data Loading

### Adding New Entries

1. Create a JSON file in `data/pokedex/` following the schema:

```json
{
  "pokedexNumber": 1,
  "organism": {
    "scientificName": "Organism name",
    "commonName": "Common name"
  },
  "nickname": "Descriptive nickname",
  "discoveredBy": "Researcher name",
  "discoveryYear": 2020,
  "rarity": "Common",
  "genomics": { ... },
  "phenotype": { ... },
  "ecology": { ... },
  "geneProteinMappings": [ ... ],
  "alphaFoldPredictions": [ ... ],
  "researchData": { ... }
}
```

2. Run the data loading script:

```bash
tsx scripts/load_pokedex_data.ts
```

The script will:
- Create the organism if it doesn't exist
- Insert the Pokedex entry
- Create all related gene-protein mappings
- Insert AlphaFold predictions and confidence regions
- Add virulence factors

## Data Sources

### Dr. Cugini's Research Data
Clinical and research data includes:
- **Relative abundance**: Percentage in oral microbiome samples
- **Disease associations**: Linked conditions with evidence strength
- **Virulence factors**: Experimentally validated or computationally predicted
- **Biofilm capability**: Assessment of biofilm formation potential
- **Pathogenicity score**: Overall pathogenic potential (0-100 scale)

### AlphaFold Database
Protein structure predictions from:
- https://alphafold.ebi.ac.uk/
- pLDDT scores indicate per-residue confidence
- PTM scores assess overall model quality
- PAE (Predicted Aligned Error) metrics for domain interactions

### Genomic Databases
- NCBI GenBank
- Custom sequencing data
- Chromosomal organization from annotation pipelines

## Migration

The database schema is version controlled through Prisma migrations:

```bash
# Create new migration (when schema changes)
npm run db:migrate

# Apply migrations in production
npm run db:deploy
```

Migration file location: `prisma/migrations/20251118040500_add_microbial_pokedex_models/`

## Type Definitions

TypeScript types are defined in `lib/pokedex-types.ts`:
- `MicrobialPokedexEntry`: Complete entry structure
- `AlphaFoldData`: Structure prediction data
- `CuginiResearchData`: Clinical research metrics
- `VirulenceFactorData`: Pathogenicity information
- `PokedexFilters`: Query filter options

## Best Practices

1. **Data Quality**: Ensure all required fields are populated for consistency
2. **Evidence Levels**: Always specify evidence levels for virulence factors
3. **Citations**: Include data sources for research data
4. **Sequence Validation**: Validate DNA/RNA sequences before insertion
5. **Confidence Scores**: Use AlphaFold confidence metrics to assess prediction reliability

## Future Enhancements

- [ ] Comparative genomics features
- [ ] Interactive genome browser
- [ ] 3D protein structure viewer
- [ ] Phylogenetic tree visualization
- [ ] Export functionality (PDF, CSV)
- [ ] Advanced search with multiple filters
- [ ] User annotations and notes
- [ ] Integration with literature databases (PubMed, etc.)
