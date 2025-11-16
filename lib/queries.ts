import type { Prisma } from "@prisma/client";
import prisma from "./db";

export interface GeneQueryOptions {
  organismId?: string;
  chromosomeId?: string;
  search?: string;
}

export interface ProteinQueryOptions {
  geneId?: string;
  organismId?: string;
}

export interface ArticleQueryOptions {
  geneId?: string;
}

export async function listOrganisms() {
  return prisma.organism.findMany({
    orderBy: { scientificName: "asc" },
    include: {
      chromosomes: true,
      genes: {
        select: {
          id: true,
          symbol: true,
        },
      },
    },
  });
}

export async function getOrganismRecord(organismId: string) {
  return prisma.organism.findUnique({
    where: { id: organismId },
    include: {
      chromosomes: true,
      genes: {
        include: {
          chromosome: { select: { id: true, name: true, lengthMb: true } },
        },
        orderBy: { symbol: "asc" },
      },
    },
  });
}

export async function listGenes(options: GeneQueryOptions = {}) {
  const where: Prisma.GeneWhereInput = {};

  if (options.organismId) {
    where.organismId = options.organismId;
  }

  if (options.chromosomeId) {
    where.chromosomeId = options.chromosomeId;
  }

  if (options.search) {
    where.OR = [
      { symbol: { contains: options.search, mode: "insensitive" } },
      { name: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  return prisma.gene.findMany({
    where,
    include: {
      organism: {
        select: { id: true, scientificName: true, commonName: true },
      },
      chromosome: {
        select: { id: true, name: true, lengthMb: true },
      },
      proteins: true,
      articles: {
        include: {
          article: true,
        },
      },
    },
    orderBy: { symbol: "asc" },
  });
}

export async function getGeneRecord(organismId: string, geneId: string) {
  return prisma.gene.findFirst({
    where: { id: geneId, organismId },
    include: {
      organism: { select: { id: true, scientificName: true, commonName: true } },
      chromosome: { select: { id: true, name: true, lengthMb: true } },
      proteins: true,
      articles: {
        include: {
          article: true,
        },
      },
    },
  });
}

export async function listProteins(options: ProteinQueryOptions = {}) {
  const where: Prisma.ProteinWhereInput = {};

  if (options.geneId) {
    where.geneId = options.geneId;
  }

  if (options.organismId) {
    where.gene = { is: { organismId: options.organismId } };
  }

  return prisma.protein.findMany({
    where,
    include: {
      gene: {
        select: {
          id: true,
          symbol: true,
          organism: { select: { id: true, scientificName: true } },
        },
      },
    },
    orderBy: { accession: "asc" },
  });
}

export async function listArticles(options: ArticleQueryOptions = {}) {
  const where: Prisma.ArticleWhereInput = {};

  if (options.geneId) {
    where.genes = {
      some: {
        geneId: options.geneId,
      },
    };
  }

  return prisma.article.findMany({
    where,
    include: {
      genes: {
        include: {
          gene: {
            select: {
              id: true,
              symbol: true,
              organism: { select: { id: true, scientificName: true } },
            },
          },
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function searchOrganismsAndGenes(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return { organisms: [], genes: [] };
  }

  const [organisms, genes] = await Promise.all([
    prisma.organism.findMany({
      where: {
        OR: [
          { scientificName: { contains: trimmed, mode: "insensitive" } },
          { commonName: { contains: trimmed, mode: "insensitive" } },
          { habitat: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      include: {
        genes: {
          select: { id: true },
        },
      },
      orderBy: { scientificName: "asc" },
      take: 10,
    }),
    prisma.gene.findMany({
      where: {
        OR: [
          { symbol: { contains: trimmed, mode: "insensitive" } },
          { name: { contains: trimmed, mode: "insensitive" } },
          { description: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      include: {
        organism: { select: { id: true, scientificName: true, commonName: true } },
      },
      orderBy: { symbol: "asc" },
      take: 10,
    }),
  ]);

  return { organisms, genes };
}
