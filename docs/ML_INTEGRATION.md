# ML Integration Guide - A. actinomycetemcomitans Secretome Analysis

## Overview

This document describes the machine learning integration for **Aggregatibacter actinomycetemcomitans** secretome analysis, starting with the Leukotoxin Type I Secretion System (T1SS) as a test case.

## Architecture

### Database Schema

The integration adds several new Prisma models to support secretome analysis and ML predictions:

#### Core Models

1. **ProteinSecretionInfo** - Stores secretion pathway classification and localization predictions
2. **SecretionSystem** - Defines complete secretion systems (e.g., T1SS, T2SS)
3. **SecretionSystemComponent** - Individual components of secretion systems
4. **SecretionSystemCargo** - Cargo proteins transported by each system
5. **MLPrediction** - Generic ML prediction results (structure, function, localization)
6. **ProteinAnalysis** - Analysis job tracking and results storage
7. **PredictionCache** - Performance optimization for repeated queries

### API Routes

#### `/api/ml/secretion-systems`
**GET** - List all secretion systems

Query Parameters:
- `organismId` (optional) - Filter by organism
- `type` (optional) - Filter by system type (T1SS, T2SS, etc.)

Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "Leukotoxin Type I Secretion System",
      "type": "T1SS",
      "description": "RTX toxin secretion system for LtxA export",
      "components": [...],
      "cargoProteins": [...]
    }
  ]
}
```

#### `/api/ml/secreted-proteins`
**GET** - List secreted proteins with filtering

Query Parameters:
- `organismId` (optional) - Filter by organism
- `pathway` (optional) - Filter by secretion pathway
- `isSecreted` (optional) - Filter by secretion status
- `isMachinery` (optional) - Filter machinery components
- `page` (default: 1) - Page number
- `limit` (default: 50, max: 100) - Results per page

#### `/api/ml/protein-analysis`
**POST** - Analyze a protein sequence

Request Body:
```json
{
  "proteinId": "...",  // OR
  "sequence": "MSLNFAQTMAPKTKITVNLRIPFNQIPEQYRSLFT...",
  "analysisType": "basic" | "structure" | "localization" | "function"
}
```

**GET** - Retrieve past analyses
Query Parameters:
- `proteinId` (required)
- `analysisType` (optional)

#### `/api/ml/alphafold`
**GET** - Fetch AlphaFold structure data

Query Parameters:
- `uniprotId` OR `proteinId` OR `accession` (one required)

Response includes:
- AlphaFold DB URLs (PDB, CIF, PAE)
- pLDDT confidence scores
- Model metadata

**POST** - Submit structure prediction job

Request Body:
```json
{
  "proteinId": "...",  // OR
  "sequence": "MSLNFAQTMAPKTKITVNLRIPFNQIPEQYRSLFT...",
  "email": "user@example.com"
}
```

## Components

### SecretionSystemViewer
React component that displays:
- Secretion system selector
- Genomic organization visualization
- Component table with localization info
- Interactive protein selection
- Integrated AlphaFold structure viewer

Usage:
```tsx
import SecretionSystemViewer from '@/components/secretion-system-viewer';

<SecretionSystemViewer 
  organismId="..." 
  systemType="T1SS" 
/>
```

### AlphaFoldViewer
Embeds AlphaFold structure visualization with:
- Interactive 3D structure viewer (iframe to AlphaFold DB)
- pLDDT confidence visualization
- Structural annotations (domains, binding sites, RTX repeats)
- View mode controls (cartoon, surface, ball-stick)
- Color scheme options (pLDDT, chain, secondary structure)
- Download options (FASTA, PDB)

Usage:
```tsx
import AlphaFoldViewer from '@/components/alphafold-viewer';

<AlphaFoldViewer
  uniprotId="P55838"
  proteinAccession="UEL52596.1"
  proteinName="Leukotoxin LtxA"
  sequence="MSLNFAQT..."
  showControls={true}
/>
```

## Data Pipeline

### 1. Parse Genomic Data
```typescript
import { parseFastaFile, parseGFF3File } from '@/lib/secretome-parser';

const proteins = await parseFastaFile('data/proteins/CP076449_proteins.fasta');
const genes = await parseGFF3File('data/gff/CP076449.gff3');
```

### 2. Classify Secretion Pathways
```typescript
import { classifySecretionPathway } from '@/lib/secretome-parser';

const classification = classifySecretionPathway(
  'type I secretion system permease/ATPase',
  'KO461_06320'
);
// Returns: { pathway: 'T1SS', isSecreted: false, isSecretionMachinery: true, ... }
```

### 3. Load System Definitions
```typescript
import { getLeukotoxinSystem } from '@/lib/secretome-parser';

const ltxSystem = getLeukotoxinSystem();
// Returns complete T1SS definition with all components
```

## Seeding Data

Run the secretome seeding script to populate the database with the leukotoxin system:

```bash
npx tsx scripts/seed-secretome.ts
```

This script:
1. Creates/finds A. actinomycetemcomitans organism
2. Creates/finds CP076449.1 chromosome
3. Loads protein sequences from FASTA
4. Creates genes and proteins for each T1SS component
5. Classifies secretion pathways
6. Creates secretion system records
7. Links components and cargo proteins

## Test Case: Leukotoxin T1SS

The initial implementation focuses on the Leukotoxin Type I Secretion System as a well-characterized test case.

### Components

| Component | Locus Tag | Type | Location | Function |
|-----------|-----------|------|----------|----------|
| Toxin Activator | KO461_06310 | Enzyme | Cytoplasmic | Acylates LtxA for activation |
| LtxA | KO461_06315 | Toxin | Extracellular | RTX cytotoxin targeting leukocytes |
| Permease/ATPase | KO461_06320 | Machinery | Inner Membrane | Provides energy for secretion |
| HlyD Adaptor | KO461_06325 | Machinery | Periplasmic | Bridges inner/outer membranes |

### Genomic Location
- Chromosome: CP076449.1
- Strain: CU1000N
- Region: 1,243,029 - 1,250,355 bp
- Total span: ~7.3 kb

### Key Features
1. **RTX Repeats** - Calcium-binding motifs in LtxA
2. **T1SS Machinery** - ABC transporter + adaptor + outer membrane channel
3. **Post-translational Modification** - Lysine acylation by KO461_06310
4. **Virulence** - Major pathogenicity factor in periodontitis

## Future Enhancements

### Phase 2: Full Secretome
- [ ] Integrate complete A.a. proteome
- [ ] Classify all proteins by secretion pathway
- [ ] Add Type II, V, VI secretion systems
- [ ] Outer membrane vesicle (OMV) proteins
- [ ] Signal peptide prediction (SignalP integration)
- [ ] Transmembrane topology prediction (TMHMM)

### Phase 3: ML Models
- [ ] ESM2 for structure prediction
- [ ] ProtBERT for functional annotation
- [ ] DNA-BERT for promoter/regulatory element prediction
- [ ] Protein-DNA mapping models
- [ ] Subcellular localization prediction
- [ ] Epitope mapping for vaccine design

### Phase 4: Interactive Features
- [ ] Real-time structure prediction
- [ ] Sequence alignment viewer
- [ ] Phylogenetic analysis
- [ ] Comparative secretome analysis across strains
- [ ] Export to PyMOL/ChimeraX
- [ ] Batch analysis support

## References

1. **Leukotoxin Structure & Function**
   - Aggregatibacter actinomycetemcomitans Leukotoxin (LtxA): A Powerful Tool (PMC3949334)

2. **Secretome Characterization**
   - Proteomics of Protein Secretion by Aggregatibacter actinomycetemcomitans (PMC3405016)

3. **Type I Secretion Systems**
   - ABC Transporters and RTX Toxin Secretion

4. **AlphaFold & Structure Prediction**
   - AlphaFold Database: https://alphafold.ebi.ac.uk/
   - ESM Atlas: https://esmatlas.com/

## Development Notes

### Mock Data
Currently, the implementation uses mock data for:
- ML predictions (basic analysis, structure, localization)
- AlphaFold pLDDT scores
- Structure prediction job submissions

These will be replaced with real API calls in production.

### Performance
- AlphaFold results are cached in `PredictionCache` table
- Cache expires after 30 days
- Hit counts tracked for cache optimization

### Testing
Basic test coverage exists for:
- Secretome parser functions
- API route responses
- Component rendering

Run tests:
```bash
npm test
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Seed secretome data**
   ```bash
   npx tsx scripts/seed-secretome.ts
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit secretome page**
   Navigate to: http://localhost:3000/secretome

## Support

For questions or issues, please refer to the main README or open an issue on GitHub.
