import { NextResponse } from "next/server";
import type { GeneDetailResponse } from "../../../../../../lib/api-types";
import { serializeGeneSummary } from "../../../../../../lib/gene-serializers";
import { getGeneRecord } from "../../../../../../lib/queries";

interface RouteContext {
  params: { organismId?: string; geneId?: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const organismId = context.params.organismId;
  const geneId = context.params.geneId;
  if (!organismId || !geneId) {
    return NextResponse.json({ error: "organismId and geneId are required" }, { status: 400 });
  }

  try {
    const gene = await getGeneRecord(organismId, geneId);
    if (!gene) {
      return NextResponse.json({ error: "Gene not found" }, { status: 404 });
    }

    const payload: GeneDetailResponse = {
      gene: {
        ...serializeGeneSummary(gene),
        organism: {
          id: gene.organism.id,
          scientificName: gene.organism.scientificName,
          commonName: gene.organism.commonName ?? null,
        },
        proteins: gene.proteins.map((protein) => ({
          id: protein.id,
          accession: protein.accession,
          name: protein.name,
          description: protein.description ?? null,
          sequenceLength: protein.sequenceLength ?? null,
          molecularWeight: protein.molecularWeight ?? null,
          localization: protein.localization ?? null,
        })),
        articles: gene.articles.map((entry) => ({
          id: entry.article.id,
          title: entry.article.title,
          journal: entry.article.journal ?? null,
          doi: entry.article.doi ?? null,
          url: entry.article.url ?? null,
          summary: entry.article.summary ?? null,
          publishedAt: entry.article.publishedAt?.toISOString() ?? null,
          keyFinding: entry.keyFinding ?? null,
          relevanceScore: entry.relevanceScore ?? null,
        })),
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Unable to load gene ${geneId} for organism ${organismId}`, error);
    return NextResponse.json({ error: "Unable to load gene" }, { status: 500 });
  }
}
