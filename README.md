# Oralytics Gene Explorer MVP

A streamlined MVP showcasing two key genes from *Aggregatibacter actinomycetemcomitans* CU1000N: **AaFlp-1** (Flp pilus protein) and **AaDcuC** (C4-dicarboxylate transporter) within the PNAG EPS biosynthesis system.

## Features

This MVP provides interactive visualizations for genomic analysis without requiring external APIs or database connections:

### Gene Viewers
- **AaFlp-1 Gene**: Explore the Flp family type IVb pilin protein
  - Protein sequence with color-coded amino acids (hydrophobic, polar, charged)
  - Genomic location and neighboring genes
  - Protein properties and hydrophobicity analysis

- **AaDcuC Gene**: Explore the anaerobic C4-dicarboxylate transporter
  - Detailed protein sequence analysis
  - Transmembrane region predictions
  - Functional context in fumarate respiration

### Visualizations
- **Protein Properties**: Molecular weight, isoelectric point, hydrophobicity plots, charged regions
- **PNAG Pathway Diagram**: Interactive pathway showing gene integration in biofilm formation
- **Protein Comparison**: Side-by-side comparison of both proteins
- **Genomic Context**: Chromosome visualization with neighboring genes

## Tech Stack

- **Next.js 16** with Turbopack (React 19)
- **TypeScript** for type safety
- **TailwindCSS 4.0** for styling
- **Pure client-side** - no databases or external APIs

## Quick Start

### Prerequisites
- Node.js 18+ 

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the gene viewer.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── page.tsx              # Main gene explorer UI
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── gene-viewer.tsx       # Gene sequence display
│   ├── protein-properties.tsx # Protein analysis
│   ├── pathway-diagram.tsx   # PNAG pathway visualization
│   ├── protein-comparison.tsx # Comparison view
│   └── genomic-context.tsx   # Chromosome context viewer
├── lib/
│   ├── gene-data.ts          # Gene and protein data
│   ├── protein-analysis.ts   # Protein property calculations
│   └── pnag-pathway.ts       # PNAG pathway model
└── data/
    ├── CP076449.1[...].fa    # Genome FASTA file
    └── sequence.gff3         # Gene annotations
```

## Data Sources

All data is extracted from:
- **Genome**: *Aggregatibacter actinomycetemcomitans* CU1000N (CP076449.1)
- **Assembly**: Complete chromosome sequence from NCBI
- **Genes**: Annotated from GFF3 file

### Key Genes

#### AaFlp-1 (UEL54261.1)
- **Location**: CP076449.1:905814-906041 (-)
- **Function**: Type IVb pilus assembly protein
- **Role**: Forms adhesive pili for host cell attachment and biofilm initiation
- **Size**: 75 amino acids, 7.84 kDa

#### AaDcuC (UEL52696.1)
- **Location**: CP076449.1:1373241-1374593 (-)
- **Function**: Anaerobic C4-dicarboxylate transporter
- **Role**: Imports succinate/fumarate for fumarate respiration, provides energy for biofilm synthesis
- **Size**: 450 amino acids, 48.5 kDa

## Features in Detail

### Protein Analysis
- **Hydrophobicity plotting** using Kyte-Doolittle scale
- **Charge analysis** at pH 7.0
- **Isoelectric point** calculation
- **Amino acid composition** breakdown
- **Hydrophobic region detection** for transmembrane predictions

### PNAG EPS Pathway
The interactive pathway diagram shows how both genes integrate into the PNAG (Poly-β-1,6-N-acetyl-D-glucosamine) exopolysaccharide biosynthesis system:
- AaFlp-1 provides structural adhesion through pili
- AaDcuC supplies metabolic energy through C4-dicarboxylate transport
- Combined function enables biofilm formation and persistence

### Genomic Context
Visualize the chromosomal neighborhood of each gene:
- Neighboring gene annotations
- Relative positions and distances
- Functional clustering (e.g., pilus assembly operons)

## Development

### No External Dependencies
This MVP is intentionally self-contained:
- ✅ No database required
- ✅ No external API calls
- ✅ No authentication needed
- ✅ Runs completely offline

### Extending the MVP
To add more genes:
1. Extract protein sequences from `data/CP076449.1[...].fa`
2. Add gene metadata from `data/sequence.gff3`
3. Update `lib/gene-data.ts` with new gene objects
4. Add to navigation in `app/page.tsx`

## License

MIT

## Microbial Pokedex System

The **Microbial Pokedex** is a comprehensive database system cataloging oral microbiome organisms with detailed genomic, proteomic, and clinical research data. Each entry includes:

- **Genomic data**: DNA/RNA sequences, chromosomal organization, GC content
- **Gene-to-protein translation**: Complete translation pipeline with coding sequences
- **AlphaFold predictions**: Protein structure predictions with confidence regions and quality metrics
- **Research data**: Dr. Cugini's laboratory findings on disease associations, virulence factors, and pathogenicity
- **Phenotypic characteristics**: Morphology, metabolism, environmental preferences
- **Clinical relevance**: Abundance data, biofilm capability, antibiotic resistance profiles

### Using the Pokedex

1. **View all entries**: Navigate to `/pokedex` to see the complete catalog
2. **Explore individual entries**: Click any entry to view comprehensive genomic and research data
3. **Filter and search**: Use query parameters to find specific organisms by characteristics

### Adding Pokedex Data

1. Create a JSON file in `data/pokedex/` following the schema in `docs/POKEDEX.md`
2. Run the data loading script:
   ```bash
   tsx scripts/load_pokedex_data.ts
   ```

The script automatically creates organisms, Pokedex entries, gene-protein mappings, AlphaFold predictions, and virulence factors.

### API Endpoints

| Route | Method | Description |
| --- | --- | --- |
| `/api/pokedex` | `GET` | List Pokedex entries with filtering (rarity, habitat, pathogenicity, etc.) |
| `/api/pokedex/[id]` | `GET` | Get complete entry with genomics, AlphaFold data, and research metrics |

See `docs/POKEDEX.md` for complete documentation including data schemas, UI components, and integration details.

## Citation

If you use this tool or data in your research, please cite:
- Genome assembly: *Aggregatibacter actinomycetemcomitans* CU1000N (NCBI CP076449.1)

Happy exploring!
