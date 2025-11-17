# Oralytics Protein Catalog

## Central Dogma: DNA → RNA → Protein

### DNA (Deoxyribonucleic Acid)
- **Role**: Permanent genetic information storage
- **Location**: Cell nucleus, mitochondria, chloroplasts
- **Structure**: Double helix, 4 bases (A, T, G, C)
- **Backbone**: Deoxyribose sugar + phosphate
- **Stability**: Very stable (2-deoxy sugar backbone)
- **Function**: Blueprint for life; inherited by offspring

### RNA (Ribonucleic Acid)
- **Role**: Temporary genetic information transfer
- **Types**: mRNA (messenger), tRNA (transfer), rRNA (ribosomal), lncRNA (long non-coding)
- **Location**: Cytoplasm, ribosome, nucleus
- **Structure**: Single strand, 4 bases (A, U, G, C)
- **Backbone**: Ribose sugar + phosphate (contains 2-OH hydroxyl)
- **Stability**: Unstable (rapidly degraded)
- **Function**: Carries instructions from DNA to ribosome

### PROTEIN (Polypeptide Chain)
- **Role**: Functional molecules that do the work
- **Building Blocks**: 20+ amino acids (joined by peptide bonds)
- **Location**: Cytoplasm, membrane, organelles, secreted
- **Structure**: Complex 3D folded shapes (α-helix, β-sheet)
- **Stability**: Variable (depends on temperature, pH, cofactors)
- **Function**: Catalysis (enzymes), structure, signaling, transport, regulation

---

## Known Proteins in Oralytics Database

### Total: 6 Proteins across 3 Organisms

#### **Streptococcus mutans UA159** (Cariogenic pathogen)

**1. GtfB (Glucosyltransferase B)**
- **Accession**: SMU_GTFB
- **Full Name**: Glucosyltransferase B
- **Molecular Weight**: 173.2 kDa
- **Sequence Length**: 1,546 amino acids
- **Localization**: Secreted
- **Function**: Synthesizes insoluble α-1,3-glucans from sucrose; critical for biofilm formation
- **Description**: Secreted enzyme that polymerizes sucrose into insoluble glucans supporting acid-resistant biofilms
- **Role in Caries**: Increases matrix density and lesion progression
- **Key Feature**: Works with GtfC to anchor sucrose-derived extracellular polysaccharides

**2. SpaP (Surface Antigen I/II)**
- **Accession**: SMU_SPAP
- **Full Name**: Surface Antigen I/II (SpaP)
- **Molecular Weight**: 170.1 kDa
- **Sequence Length**: 1,549 amino acids
- **Localization**: Cell wall
- **Function**: Cell surface adhesin; binds salivary agglutinins and enamel hydroxyapatite
- **Description**: Adhesin bridging salivary agglutinins with enamel hydroxyapatite
- **Role in Colonization**: Stratifies colonization success across pediatric cohorts
- **Key Feature**: Cell wall-anchored protein mediating initial enamel binding

---

#### **Porphyromonas gingivalis W83** (Periodontal pathobiont)

**3. Kgp (Lysine-specific Gingipain)**
- **Accession**: PG_KGP
- **Full Name**: Lysine-specific gingipain
- **Molecular Weight**: 185.4 kDa
- **Sequence Length**: 1,710 amino acids
- **Localization**: Secreted (via outer membrane vesicles)
- **Function**: Secreted cysteine protease that degrades host extracellular matrix; modulates complement signaling
- **Description**: Secreted cysteine protease that degrades host extracellular matrix and modulates complement signaling
- **Role in Pathogenesis**: Remodels protein profile based on crevicular hemin availability
- **Cofactor**: Hemin-regulated; activity increases in anaerobic periodontal pockets

**4. HmuY (Hemin Uptake Outer-membrane Receptor)**
- **Accession**: PG_HMUY
- **Full Name**: Hemin uptake outer-membrane receptor
- **Molecular Weight**: 39.7 kDa
- **Sequence Length**: 350 amino acids
- **Localization**: Outer membrane
- **Function**: Tetrameric receptor that captures host heme complexes for anaerobic respiration
- **Description**: Surface lipoprotein that captures host heme complexes for respiration
- **Role in Survival**: Critical for hypoxic periodontal pocket colonization
- **Key Feature**: Expression spikes alongside gingipain clusters

---

#### **Candida albicans SC5314** (Opportunistic fungal pathogen)

**5. Hog1 (High-Osmolarity Glycerol Response MAPK)**
- **Accession**: CA_HOG1
- **Full Name**: High-osmolarity glycerol response MAPK
- **Molecular Weight**: 52 kDa
- **Sequence Length**: 465 amino acids
- **Localization**: Cytoplasm (translocates to nucleus)
- **Function**: Stress-activated MAP kinase governing osmostress and oxidative protection
- **Description**: Stress-activated MAP kinase governing osmostress and oxidative protection
- **Role in Stress Response**: Phosphorylation correlates with saliva osmolarity
- **Key Feature**: Translocates to nucleus under osmotic shock

**6. Erg11 (Lanosterol 14-alpha Demethylase)**
- **Accession**: CA_ERG11
- **Full Name**: Lanosterol 14-alpha demethylase (CYP51A1)
- **Molecular Weight**: 58.3 kDa
- **Sequence Length**: 532 amino acids
- **Localization**: Endoplasmic reticulum
- **Function**: Cytochrome P450 enzyme required for ergosterol biosynthesis
- **Description**: Cytochrome P450 enzyme required for ergosterol biosynthesis
- **Role in Antifungal Resistance**: Target for azole antifungals; impacts membrane stability
- **Key Feature**: Transcription increases when saliva cholesterol is depleted

---

## Protein Statistics

| Metric | Value |
|--------|-------|
| **Total Proteins** | 6 |
| **Total Genes** | 6 |
| **Total Organisms** | 3 |
| **Average Molecular Weight** | 113.12 kDa |
| **Average Sequence Length** | 1,025 amino acids |

### By Organism:
- Streptococcus mutans: 2 proteins
- Porphyromonas gingivalis: 2 proteins
- Candida albicans: 2 proteins

### By Localization:
- Secreted: 2 proteins
- Cell wall: 1 protein
- Outer membrane: 1 protein
- Cytoplasm: 1 protein
- Endoplasmic reticulum: 1 protein

---

## Key Distinctions in This Dataset

### Enzymatic Proteins (Catalytic)
- **GtfB**: Polymerizes sucrose → glucans (glycosyltransferase)
- **Kgp**: Degrades proteins (protease)
- **Hog1**: Phosphorylates substrates (kinase)
- **Erg11**: Oxidative modification of lanosterol (CYP450)

### Binding/Adhesion Proteins
- **SpaP**: Binds salivary agglutinins + enamel hydroxyapatite
- **HmuY**: Captures heme from blood

### Regulatory/Transport Proteins
- **Hog1**: Signal transduction in response to osmotic stress
- **Erg11**: Biosynthetic pathway regulation

---

## Data Sources

All proteins are seeded from:
- **S. mutans & P. gingivalis**: Detailed seed data in `/data/seeded/organisms.json`
- **C. albicans**: Comprehensive genomic database
- **Molecular Weight & Sequence Length**: Calculated from amino acid composition

## API Endpoints

**Fetch all proteins:**
```bash
GET /api/proteins
```

**Fetch proteins for specific organism:**
```bash
GET /api/organisms/{id}/proteins
```

**Interactive Protein Gallery:**
```
GET /proteins
```

---

## Visual Infographic

Visit `/proteins` to see:
1. **Central Dogma Diagram**: DNA → RNA → Protein flow
2. **Detailed Comparison Table**: 7 key properties across DNA/RNA/Proteins
3. **Protein Universe Dashboard**: Stats, breakdowns, and interactive catalog
4. **Protein Details**: Click any protein to view accession, molecular weight, sequence length, localization

