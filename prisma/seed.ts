import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ArticleSeed = {
  key: string;
  title: string;
  doi: string;
  journal: string;
  url: string;
  summary: string;
  publishedAt: string;
};

type GeneSeed = {
  symbol: string;
  name: string;
  description: string;
  startPosition: number;
  endPosition: number;
  strand: "forward" | "reverse";
  chromosome: string;
  proteins: Array<{
    accession: string;
    name: string;
    description: string;
    sequenceLength: number;
    molecularWeight: number;
    localization: string;
  }>;
  articles: Array<{
    key: string;
    keyFinding: string;
    relevanceScore: number;
  }>;
};

type OrganismSeed = {
  scientificName: string;
  commonName: string;
  taxonomyId: number;
  habitat: string;
  description: string;
  genomeSizeMb: number;
  chromosomes: Array<{ name: string; lengthMb: number }>;
  genes: GeneSeed[];
};

const articleSeeds: ArticleSeed[] = [
  {
    key: "cariesResilience",
    title: "Cariogenic stress programs uncovered through plaque metatranscriptomes",
    doi: "10.1016/j.oralsci.2024.0501",
    journal: "Oral Systems Biology",
    url: "https://example.org/articles/cariogenic-stress",
    summary:
      "Comparative metatranscriptomes highlighted S. mutans sucrose-utilization and extracellular matrix programs in progressing caries.",
    publishedAt: "2024-05-01",
  },
  {
    key: "biofilmDefense",
    title: "Adaptive biofilm defenses across plaque-resident streptococci",
    doi: "10.1186/j.omx.2024.0717",
    journal: "Journal of Oral Microbiomes",
    url: "https://example.org/articles/biofilm-defense",
    summary:
      "Single-cell RNA revealed rapid remodeling of glucosyltransferase expression in response to pH stress during enamel colonization.",
    publishedAt: "2024-07-17",
  },
  {
    key: "periInflammation",
    title: "P. gingivalis metabolic flexibility inside inflamed periodontal pockets",
    doi: "10.7554/eLife.2024.0901",
    journal: "eLife",
    url: "https://example.org/articles/pg-metabolism",
    summary:
      "Proteogenomic profiling demonstrated hemin-dependent respiration and gingipain remodeling within hypoxic periodontal niches.",
    publishedAt: "2024-09-01",
  },
  {
    key: "candidaStress",
    title: "Candida albicans stress tolerance circuits in saliva",
    doi: "10.1002/mbo3.2024.1122",
    journal: "MicrobiologyOpen",
    url: "https://example.org/articles/candida-stress",
    summary:
      "Longitudinal saliva cultures showed Hog1-dependent osmostress protection and ergosterol remodeling.",
    publishedAt: "2024-11-22",
  },
  
];

const organismSeeds: OrganismSeed[] = [
  {
    scientificName: "Streptococcus mutans UA159",
    commonName: "S. mutans",
    taxonomyId: 210007,
    habitat: "Dental plaque",
    description: "Cariogenic Gram-positive bacterium enriched in enamel lesions and sucrose-rich niches.",
    genomeSizeMb: 2.03,
    chromosomes: [
      { name: "Chromosome", lengthMb: 2.03 },
      { name: "pUA-Plasmid", lengthMb: 0.18 },
    ],
    genes: [
      {
        symbol: "gtfB",
        name: "Glucosyltransferase B",
        description:
          "Secreted enzyme that polymerizes sucrose into insoluble glucans supporting acid-resistant biofilms.",
        startPosition: 105200,
        endPosition: 110800,
        strand: "forward",
        chromosome: "Chromosome",
        proteins: [
          {
            accession: "SMU_GTFB",
            name: "GtfB",
            description: "Extracellular glucosyltransferase responsible for alpha-1,3 glucan synthesis.",
            sequenceLength: 1546,
            molecularWeight: 173.2,
            localization: "Secreted",
          },
        ],
        articles: [
          {
            key: "cariesResilience",
            keyFinding: "Hyper-expression of gtfB increases matrix density and lesion progression",
            relevanceScore: 0.92,
          },
          {
            key: "biofilmDefense",
            keyFinding: "Rapid gtfB induction during acid pulses stabilizes the biofilm",
            relevanceScore: 0.81,
          },
        ],
      },
      {
        symbol: "spaP",
        name: "Surface antigen I/II",
        description: "Adhesin bridging salivary agglutinins with enamel hydroxyapatite.",
        startPosition: 245100,
        endPosition: 257900,
        strand: "reverse",
        chromosome: "Chromosome",
        proteins: [
          {
            accession: "SMU_SPAP",
            name: "SpaP",
            description: "Cell wall-anchored adhesin mediating enamel binding.",
            sequenceLength: 1549,
            molecularWeight: 170.1,
            localization: "Cell wall",
          },
        ],
        articles: [
          {
            key: "cariesResilience",
            keyFinding: "SpaP alleles stratify colonization success across pediatric cohorts",
            relevanceScore: 0.74,
          },
        ],
      },
    ],
  },
  {
    scientificName: "Porphyromonas gingivalis W83",
    commonName: "P. gingivalis",
    taxonomyId: 242619,
    habitat: "Periodontal pocket",
    description: "Keystone anaerobe linked to chronic periodontitis and systemic inflammation.",
    genomeSizeMb: 2.35,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.35 }],
    genes: [
      {
        symbol: "kgp",
        name: "Lysine-specific gingipain",
        description:
          "Secreted cysteine protease that degrades host extracellular matrix and modulates complement signaling.",
        startPosition: 501200,
        endPosition: 517900,
        strand: "forward",
        chromosome: "Chromosome",
        proteins: [
          {
            accession: "PG_KGP",
            name: "Kgp",
            description: "Hemin-regulated protease secreted within outer membrane vesicles.",
            sequenceLength: 1710,
            molecularWeight: 185.4,
            localization: "Secreted",
          },
        ],
        articles: [
          {
            key: "periInflammation",
            keyFinding: "Kgp remodeling tracks with crevicular hemin availability",
            relevanceScore: 0.88,
          },
        ],
      },
      {
        symbol: "hmuY",
        name: "Hemin uptake outer-membrane receptor",
        description: "Surface lipoprotein that captures host heme complexes for respiration.",
        startPosition: 734200,
        endPosition: 742750,
        strand: "reverse",
        chromosome: "Chromosome",
        proteins: [
          {
            accession: "PG_HMUY",
            name: "HmuY",
            description: "Tetrameric receptor concentrating heme for the Hmu system.",
            sequenceLength: 350,
            molecularWeight: 39.7,
            localization: "Outer membrane",
          },
        ],
        articles: [
          {
            key: "periInflammation",
            keyFinding: "HmuY expression spikes alongside gingipain clusters in hypoxic pockets",
            relevanceScore: 0.79,
          },
        ],
      },
    ],
  },
  {
    scientificName: "Candida albicans SC5314",
    commonName: "C. albicans",
    taxonomyId: 237561,
    habitat: "Oral mucosa",
    description: "Opportunistic fungal commensal that blooms under antibiotic or immunosuppressed conditions.",
    genomeSizeMb: 14.3,
    chromosomes: [
      { name: "Chromosome 1", lengthMb: 3.1 },
      { name: "Chromosome 5", lengthMb: 2.9 },
    ],
    genes: [
      {
        symbol: "HOG1",
        name: "High-osmolarity glycerol response MAPK",
        description: "Stress-activated MAP kinase governing osmostress and oxidative protection.",
        startPosition: 118020,
        endPosition: 121655,
        strand: "forward",
        chromosome: "Chromosome 5",
        proteins: [
          {
            accession: "CA_HOG1",
            name: "Hog1",
            description: "MAP kinase that translocates to the nucleus under osmotic shock.",
            sequenceLength: 465,
            molecularWeight: 52.0,
            localization: "Cytoplasm",
          },
        ],
        articles: [
          {
            key: "candidaStress",
            keyFinding: "Hog1 phosphorylation correlates with saliva osmolarity",
            relevanceScore: 0.86,
          },
        ],
      },
      {
        symbol: "ERG11",
        name: "Lanosterol 14-alpha demethylase",
        description: "Cytochrome P450 enzyme required for ergosterol biosynthesis.",
        startPosition: 240500,
        endPosition: 246240,
        strand: "reverse",
        chromosome: "Chromosome 1",
        proteins: [
          {
            accession: "CA_ERG11",
            name: "Erg11",
            description: "Drug target for azole antifungals impacting membrane stability.",
            sequenceLength: 532,
            molecularWeight: 58.3,
            localization: "Endoplasmic reticulum",
          },
        ],
        articles: [
          {
            key: "candidaStress",
            keyFinding: "Erg11 transcription increases when saliva cholesterol is depleted",
            relevanceScore: 0.72,
          },
        ],
      },
    ],
  },
  {
    scientificName: "Actinomyces aggregatus",
    commonName: "A. aggregatus",
    taxonomyId: 645,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive actinobacterium from the HOMD. Abundant in the healthy oral microbiome. Lineage: Bacteria > Actinobacteria > Actinomycetia > Actinomycetales > Actinomycetaceae > Actinomyces. Reference: https://v31.homd.org/taxa/life?rank=genus&name=Actinomyces",
    genomeSizeMb: 2.8,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.8 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces dentalis",
    commonName: "A. dentalis",
    taxonomyId: 888,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-888). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=888",
    genomeSizeMb: 3.53,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.53 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces gerencseriae",
    commonName: "A. gerencseriae",
    taxonomyId: 618,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-618). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=618",
    genomeSizeMb: 3.42,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.42 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces graevenitzii",
    commonName: "A. graevenitzii",
    taxonomyId: 866,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-866). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=866",
    genomeSizeMb: 2.15,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.15 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces israelii",
    commonName: "A. israelii",
    taxonomyId: 645,
    habitat: "Dental plaque, oral biofilms, periodontal pockets",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-645). Can form biofilms and is associated with dental infections. Source: https://v31.homd.org/taxa/tax_description?otid=645",
    genomeSizeMb: 4.03,
    chromosomes: [{ name: "Chromosome", lengthMb: 4.03 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces johnsonii",
    commonName: "A. johnsonii",
    taxonomyId: 849,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-849). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=849",
    genomeSizeMb: 3.395,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.395 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces massiliensis",
    commonName: "A. massiliensis",
    taxonomyId: 852,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-852). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=852",
    genomeSizeMb: 3.395,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.395 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces naeslundii",
    commonName: "A. naeslundii",
    taxonomyId: 176,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-176). Among the most abundant Actinomyces in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=176",
    genomeSizeMb: 3.135,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.135 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces oricola",
    commonName: "A. oricola",
    taxonomyId: 708,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-708). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=708",
    genomeSizeMb: 2.93,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.93 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces oris",
    commonName: "A. oris",
    taxonomyId: 893,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-893). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=893",
    genomeSizeMb: 3.075,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.075 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces radicidentis",
    commonName: "A. radicidentis",
    taxonomyId: 746,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-746). Found in dental biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=746",
    genomeSizeMb: 3.05,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.05 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 169",
    commonName: "A. sp. HMT 169",
    taxonomyId: 169,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-169, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=169",
    genomeSizeMb: 3.04,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.04 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 170",
    commonName: "A. sp. HMT 170",
    taxonomyId: 170,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-170, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=170",
    genomeSizeMb: 3.14,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.14 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 171",
    commonName: "A. sp. HMT 171",
    taxonomyId: 171,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-171, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=171",
    genomeSizeMb: 3.055,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.055 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 175",
    commonName: "A. sp. HMT 175",
    taxonomyId: 175,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-175, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=175",
    genomeSizeMb: 3.13,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.13 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 414",
    commonName: "A. sp. HMT 414",
    taxonomyId: 414,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-414, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=414",
    genomeSizeMb: 3.84,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.84 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 448",
    commonName: "A. sp. HMT 448",
    taxonomyId: 448,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-448, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=448",
    genomeSizeMb: 2.83,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.83 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 525",
    commonName: "A. sp. HMT 525",
    taxonomyId: 525,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-525, phylotype). Unnamed species without genome sequencing. Source: https://v31.homd.org/taxa/tax_description?otid=525",
    genomeSizeMb: 0,
    chromosomes: [{ name: "Chromosome", lengthMb: 0 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 896",
    commonName: "A. sp. HMT 896",
    taxonomyId: 896,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-896, phylotype). Unnamed species without genome sequencing. Source: https://v31.homd.org/taxa/tax_description?otid=896",
    genomeSizeMb: 0,
    chromosomes: [{ name: "Chromosome", lengthMb: 0 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces sp. HMT 897",
    commonName: "A. sp. HMT 897",
    taxonomyId: 897,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-897, unnamed species). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=897",
    genomeSizeMb: 3.25,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.25 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces timonensis",
    commonName: "A. timonensis",
    taxonomyId: 179,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-179). Found in oral biofilms. Source: https://v31.homd.org/taxa/tax_description?otid=179",
    genomeSizeMb: 2.93,
    chromosomes: [{ name: "Chromosome", lengthMb: 2.93 }],
    genes: [],
  },
  {
    scientificName: "Actinomyces viscosus",
    commonName: "A. viscosus",
    taxonomyId: 688,
    habitat: "Dental plaque, oral biofilms",
    description: "Gram-positive filamentous actinobacterium (HOMD HMT-688). Abundant in healthy oral microbiome. Source: https://v31.homd.org/taxa/tax_description?otid=688",
    genomeSizeMb: 3.31,
    chromosomes: [{ name: "Chromosome", lengthMb: 3.31 }],
    genes: [],
  },
];

async function seedArticles() {
  const map = new Map<string, string>();

  for (const article of articleSeeds) {
    const created = await prisma.article.create({
      data: {
        title: article.title,
        doi: article.doi,
        journal: article.journal,
        url: article.url,
        summary: article.summary,
        publishedAt: new Date(article.publishedAt),
      },
    });

    map.set(article.key, created.id);
  }

  return map;
}

async function seedOrganisms(articleMap: Map<string, string>) {
  for (const organismSeed of organismSeeds) {
    const organism = await prisma.organism.create({
      data: {
        scientificName: organismSeed.scientificName,
        commonName: organismSeed.commonName,
        taxonomyId: organismSeed.taxonomyId,
        habitat: organismSeed.habitat,
        description: organismSeed.description,
        genomeSizeMb: organismSeed.genomeSizeMb,
      },
    });

    const chromosomeMap = new Map<string, string>();

    for (const chromosome of organismSeed.chromosomes) {
      const created = await prisma.chromosome.create({
        data: {
          name: chromosome.name,
          lengthMb: chromosome.lengthMb,
          organismId: organism.id,
        },
      });

      chromosomeMap.set(chromosome.name, created.id);
    }

    for (const gene of organismSeed.genes) {
      const createdGene = await prisma.gene.create({
        data: {
          symbol: gene.symbol,
          name: gene.name,
          description: gene.description,
          startPosition: gene.startPosition,
          endPosition: gene.endPosition,
          strand: gene.strand,
          organismId: organism.id,
          chromosomeId: chromosomeMap.get(gene.chromosome),
        },
      });

      for (const protein of gene.proteins) {
        await prisma.protein.create({
          data: {
            accession: protein.accession,
            name: protein.name,
            description: protein.description,
            sequenceLength: protein.sequenceLength,
            molecularWeight: protein.molecularWeight,
            localization: protein.localization,
            geneId: createdGene.id,
          },
        });
      }

      for (const articleRef of gene.articles) {
        const articleId = articleMap.get(articleRef.key);
        if (!articleId) {
          continue;
        }

        await prisma.geneArticle.create({
          data: {
            geneId: createdGene.id,
            articleId,
            keyFinding: articleRef.keyFinding,
            relevanceScore: articleRef.relevanceScore,
          },
        });
      }
    }
  }
}

async function seedProfiles() {
  // Map of HOMD taxonomy IDs to detailed profile data
  const profileData: Record<
    number,
    {
      gramStain: string;
      cellShape: string;
      cellArrangement: string;
      motility: string;
      gcContent?: number;
      cultivability: string;
      habitat: string;
      ecologyDescription: string;
      pathogenicity: string;
      ncbiTaxonId?: number;
      homdUrl: string;
    }
  > = {
    888: {
      gramStain: "Positive",
      cellShape: "Rod",
      cellArrangement: "Filamentous branches",
      motility: "Non-motile",
      gcContent: 62.0,
      cultivability: "Cultured",
      habitat: "Dental plaque, oral biofilms",
      ecologyDescription: "Oral cavity commensal; found in dental plaque and biofilms",
      pathogenicity: "Low pathogenic potential",
      ncbiTaxonId: 1689,
      homdUrl: "https://v31.homd.org/taxa/tax_description?otid=888",
    },
    618: {
      gramStain: "Positive",
      cellShape: "Rod",
      cellArrangement: "Filamentous branches",
      motility: "Non-motile",
      gcContent: 62.5,
      cultivability: "Cultured",
      habitat: "Dental plaque, oral biofilms",
      ecologyDescription: "Oral cavity resident; commonly isolated from subgingival plaque",
      pathogenicity: "Low pathogenic potential",
      ncbiTaxonId: 1690,
      homdUrl: "https://v31.homd.org/taxa/tax_description?otid=618",
    },
    866: {
      gramStain: "Positive",
      cellShape: "Rod",
      cellArrangement: "Filamentous branches",
      motility: "Non-motile",
      gcContent: 61.0,
      cultivability: "Cultured",
      habitat: "Dental plaque, oral biofilms",
      ecologyDescription: "Oral cavity commensal; minor component of oral flora",
      pathogenicity: "Low pathogenic potential",
      ncbiTaxonId: 1691,
      homdUrl: "https://v31.homd.org/taxa/tax_description?otid=866",
    },
    645: {
      gramStain: "Positive",
      cellShape: "Rod",
      cellArrangement: "Filamentous branches",
      motility: "Non-motile",
      gcContent: 62.2,
      cultivability: "Cultured",
      habitat: "Dental plaque, oral biofilms",
      ecologyDescription: "Oral pathobiont; associated with periapical lesions and endodontic infections",
      pathogenicity: "High pathogenic potential",
      ncbiTaxonId: 1692,
      homdUrl: "https://v31.homd.org/taxa/tax_description?otid=645",
    },
  };

  for (const organism of await prisma.organism.findMany()) {
    const hmtId = organism.taxonomyId;
    const profileInfo = hmtId && profileData[hmtId] ? profileData[hmtId] : null;

    // Create profile for all organisms - use HOMD data if available, otherwise use defaults
    const profile = await prisma.organismProfile.upsert({
      where: { organismId: organism.id },
      create: {
        organismId: organism.id,
        gramStain: profileInfo?.gramStain || "Unknown",
        cellShape: profileInfo?.cellShape,
        cellArrangement: profileInfo?.cellArrangement,
        motility: profileInfo?.motility,
        gcContent: profileInfo?.gcContent,
        cultivability: profileInfo?.cultivability,
        habitat: profileInfo?.habitat || organism.habitat,
        ecologyDescription: profileInfo?.ecologyDescription,
        pathogenicity: profileInfo?.pathogenicity,
        ncbiTaxonId: profileInfo?.ncbiTaxonId || organism.taxonomyId,
        homdUrl: profileInfo?.homdUrl,
      },
      update: {
        gramStain: profileInfo?.gramStain || "Unknown",
        cellShape: profileInfo?.cellShape,
        cellArrangement: profileInfo?.cellArrangement,
        motility: profileInfo?.motility,
        gcContent: profileInfo?.gcContent,
        cultivability: profileInfo?.cultivability,
        habitat: profileInfo?.habitat || organism.habitat,
        ecologyDescription: profileInfo?.ecologyDescription,
        pathogenicity: profileInfo?.pathogenicity,
        ncbiTaxonId: profileInfo?.ncbiTaxonId || organism.taxonomyId,
        homdUrl: profileInfo?.homdUrl,
      },
    });

    // Create initial profile history entry
    await prisma.profileHistory.create({
      data: {
        profileId: profile.id,
        organismId: organism.id,
        versionNumber: 1,
        changeField: "profile_created",
        newValue: `Initial profile for ${organism.scientificName}`,
        changeReason: profileInfo
          ? "Initial data ingestion from HOMD v31"
          : "Profile created with organism data",
        dataSource: profileInfo ? "HOMD" : "Organism seed",
        changedBy: "system:seed",
        notes: `Profile created for ${organism.commonName || organism.scientificName}`,
      },
    });
  }
}

async function main() {
  await prisma.profileHistory.deleteMany();
  await prisma.organismProfile.deleteMany();
  await prisma.geneArticle.deleteMany();
  await prisma.protein.deleteMany();
  await prisma.gene.deleteMany();
  await prisma.chromosome.deleteMany();
  await prisma.article.deleteMany();
  await prisma.organism.deleteMany();

  const articleMap = await seedArticles();
  await seedOrganisms(articleMap);
  await seedProfiles();
}

main()
  .then(async () => {
    console.log("Database seeded with organisms, genes, proteins, and articles.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
