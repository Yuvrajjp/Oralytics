# Secretome Analysis - Quick Start Guide

## Overview

The secretome analysis feature provides a comprehensive view of secreted proteins and secretion systems in *Aggregatibacter actinomycetemcomitans*, starting with the well-characterized Leukotoxin Type I Secretion System (T1SS).

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Copy environment variables
cp .env.example .env

# Edit .env and update DATABASE_URL with your Postgres credentials

# Apply database schema
npm run db:migrate

# Seed basic organism data
npm run db:seed
```

### 3. Seed Secretome Data
```bash
# Load leukotoxin T1SS system data
npx tsx scripts/seed-secretome.ts
```

Expected output:
```
🔬 Starting secretome data seeding...
✅ Found existing organism: <id>
✅ Found existing chromosome: <id>
📖 Loading protein sequences...
✅ Loaded 2162 protein entries

🦠 Processing Leukotoxin T1SS system (4 components)...
  Processing KO461_06310 (toxin-activating lysine-acyltransferase)...
    ✅ Created gene: KO461_06310
    ✅ Created protein: UEL52595.1 (168 aa)
    ✅ Updated secretion info
  ...

✨ Secretome seeding completed successfully!
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. View Secretome Page
Navigate to: http://localhost:3000/secretome

## Features

### Secretion System Viewer
- **System Overview**: Name, type, description, genomic span
- **Genomic Visualization**: Color-coded gene track showing component positions
- **Component Table**: Detailed information about each protein
  - Gene name and locus tag
  - Component type (Toxin, ATPase, Adaptor, etc.)
  - Subcellular localization
  - Protein sequence length
  - Genomic coordinates
- **Interactive Selection**: Click any protein to view its 3D structure

### AlphaFold Structure Viewer
- **3D Structure Display**: Embedded AlphaFold DB viewer
- **Confidence Visualization**: pLDDT scores with color gradient
- **Structural Annotations**:
  - Signal peptides
  - Functional domains
  - RTX repeats (calcium-binding motifs)
  - Binding sites
- **View Controls**:
  - View modes: Cartoon, Surface, Ball & Stick
  - Color schemes: pLDDT confidence, Chain, Secondary structure
  - Toggle annotations on/off
- **Download Options**:
  - FASTA sequence
  - PDB structure file
  - PyMOL export (future)

## API Endpoints

### List Secretion Systems
```bash
curl http://localhost:3000/api/ml/secretion-systems

# Filter by organism
curl http://localhost:3000/api/ml/secretion-systems?organismId=<id>

# Filter by type
curl http://localhost:3000/api/ml/secretion-systems?type=T1SS
```

### Query Secreted Proteins
```bash
# Get all secreted proteins
curl http://localhost:3000/api/ml/secreted-proteins?isSecreted=true

# Get secretion machinery components
curl http://localhost:3000/api/ml/secreted-proteins?isMachinery=true

# Filter by pathway
curl http://localhost:3000/api/ml/secreted-proteins?pathway=T1SS

# Pagination
curl http://localhost:3000/api/ml/secreted-proteins?page=1&limit=20
```

### Analyze Protein
```bash
# Basic analysis
curl -X POST http://localhost:3000/api/ml/protein-analysis \
  -H "Content-Type: application/json" \
  -d '{"proteinId": "<id>", "analysisType": "basic"}'

# Structure prediction
curl -X POST http://localhost:3000/api/ml/protein-analysis \
  -H "Content-Type: application/json" \
  -d '{"proteinId": "<id>", "analysisType": "structure"}'

# Get analysis history
curl http://localhost:3000/api/ml/protein-analysis?proteinId=<id>
```

### AlphaFold Data
```bash
# Get structure data
curl http://localhost:3000/api/ml/alphafold?accession=UEL52596.1

# Submit prediction job
curl -X POST http://localhost:3000/api/ml/alphafold \
  -H "Content-Type: application/json" \
  -d '{"proteinId": "<id>", "email": "user@example.com"}'
```

## Database Schema

### Core Models

**ProteinSecretionInfo**
- Secretion pathway classification (T1SS, T2SS, etc.)
- Signal peptide predictions
- Transmembrane topology
- Cellular localization
- OMV association

**SecretionSystem**
- System name and type
- Genomic location
- Components (genes/proteins)
- Cargo proteins

**MLPrediction**
- Prediction type and model
- Results and confidence scores
- Cached for performance

**PredictionCache**
- Optimized caching for repeated queries
- Automatic expiration
- Hit count tracking

## Test Case: Leukotoxin T1SS

### System Components

| Component | Locus Tag | Type | Location | Genomic Position |
|-----------|-----------|------|----------|------------------|
| Toxin Activator | KO461_06310 | Enzyme | Cytoplasmic | 1,243,029..1,243,535 |
| LtxA | KO461_06315 | Toxin | Extracellular | 1,243,548..1,246,715 |
| Permease/ATPase | KO461_06320 | Machinery | Inner Membrane | 1,246,784..1,248,907 |
| HlyD Adaptor | KO461_06325 | Machinery | Periplasmic | 1,248,922..1,250,355 |

### Biological Significance

The leukotoxin system is a major virulence factor in *A. actinomycetemcomitans*:

1. **LtxA (Leukotoxin)**: RTX family toxin that targets and kills human leukocytes
2. **Post-translational Modification**: Requires acylation by KO461_06310 for activity
3. **T1SS Export**: One-step secretion across both membranes
4. **OMV Packaging**: Also exported via outer membrane vesicles
5. **Clinical Impact**: Associated with aggressive periodontitis and systemic infections

### Key Features
- **RTX Repeats**: 9-residue calcium-binding motifs in LtxA
- **Glycine-Aspartate-Rich**: Characteristic of RTX toxins
- **ABC Transporter**: ATP-dependent secretion machinery
- **Adaptor Protein**: HlyD-family bridges inner and outer membranes

## Data Sources

### Genomic Data
- **Organism**: *Aggregatibacter actinomycetemcomitans* strain CU1000N
- **Chromosome**: CP076449.1 (2.33 Mb, complete genome)
- **Source**: NCBI GenBank
- **Files**: 
  - `data/proteins/CP076449_proteins.fasta` - Protein sequences
  - `data/gff/CP076449.gff3` - Gene annotations

### Literature References
1. **Leukotoxin Structure & Function**
   - Aggregatibacter actinomycetemcomitans Leukotoxin (LtxA): A Powerful Tool with Capacity to Cause Imbalance in the Host Inflammatory Response (PMC3949334)

2. **Secretome Characterization**
   - Proteomics of Protein Secretion by Aggregatibacter actinomycetemcomitans (PMC3405016)

3. **OMV-Associated Proteins**
   - Aggregatibacter actinomycetemcomitans Leukotoxin Is Carried by Membrane Vesicles (MDPI)

4. **Exoproteome Heterogeneity**
   - Connections between Exoproteome Heterogeneity and Virulence in Aggregatibacter actinomycetemcomitans (ASM Journals)

## Development

### Adding New Secretion Systems

1. **Define System Components** in `lib/secretome-parser.ts`:
```typescript
export function getMySecretionSystem(): SecretionSystemData {
  return {
    name: 'My Secretion System',
    type: 'T2SS',
    description: 'Description here',
    components: [
      {
        locusTag: 'KO461_XXXXX',
        proteinId: 'UELXXXXX.1',
        componentType: 'Component Type',
        product: 'Product description',
        location: { start: 123456, end: 123789, strand: '+' }
      }
    ]
  };
}
```

2. **Update Seed Script** (`scripts/seed-secretome.ts`):
```typescript
const mySystem = getMySecretionSystem();
// Follow the same pattern as leukotoxin system
```

3. **Run Seed**: `npx tsx scripts/seed-secretome.ts`

### Running Tests
```bash
npm test
```

Current test coverage:
- ✅ Gene serialization
- ✅ Organism display
- ✅ API routes (basic)

## Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: Check your `DATABASE_URL` in `.env` and ensure Postgres is running

### Seeding Fails - Organism Not Found
```
Error: Organism not found
```
**Solution**: Run `npm run db:seed` first to create base organisms

### No Proteins Showing
**Solution**: Ensure you ran `npx tsx scripts/seed-secretome.ts` after database migration

### AlphaFold Viewer Not Loading
**Current Status**: Using mock data. Real AlphaFold DB integration requires UniProt IDs.
**Workaround**: The viewer shows a placeholder with sequence information and links to external prediction services.

## Next Steps

### Immediate Enhancements
- [ ] Add more secretion systems (T2SS, T5SS, T6SS)
- [ ] Integrate real signal peptide prediction (SignalP)
- [ ] Add transmembrane topology prediction (TMHMM)
- [ ] Classify entire proteome by secretion pathway

### ML Integration
- [ ] ESM2 for protein structure prediction
- [ ] ProtBERT for functional annotation
- [ ] DNA-BERT for regulatory element prediction
- [ ] Protein-DNA mapping models

### UI Enhancements
- [ ] Real-time structure prediction
- [ ] Sequence alignment viewer (MSA)
- [ ] Phylogenetic tree visualization
- [ ] Comparative analysis across strains
- [ ] Export to PyMOL/ChimeraX

## Support

For questions or issues:
1. Check the main documentation: `docs/ML_INTEGRATION.md`
2. Review the README: `README.md`
3. Open an issue on GitHub

## License

Same as main project license.
