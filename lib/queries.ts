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
        select: { id: true, name: true },
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
