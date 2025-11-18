import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/pokedex
 * List all Pokedex entries with optional filtering
 * 
 * Query parameters:
 * - rarity: Filter by rarity level
 * - habitat: Filter by primary habitat
 * - metabolism: Filter by metabolism type
 * - minPathogenicity: Minimum pathogenicity score
 * - maxPathogenicity: Maximum pathogenicity score
 * - hasAlphaFold: Filter entries with AlphaFold predictions
 * - search: Search query for organism name
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const rarity = searchParams.get("rarity");
    const habitat = searchParams.get("habitat");
    const metabolism = searchParams.get("metabolism");
    const minPathogenicity = searchParams.get("minPathogenicity");
    const maxPathogenicity = searchParams.get("maxPathogenicity");
    const hasAlphaFold = searchParams.get("hasAlphaFold");
    const search = searchParams.get("search");
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);

    // Build where clause
    type QueryMode = "default" | "insensitive";
    const where: {
      rarity?: string;
      primaryHabitat?: { contains: string; mode: QueryMode };
      metabolism?: string;
      pathogenicityScore?: { gte?: number; lte?: number };
      organism?: {
        OR: Array<{
          scientificName?: { contains: string; mode: QueryMode };
          commonName?: { contains: string; mode: QueryMode };
        }>;
      };
    } = {};

    if (rarity) {
      where.rarity = rarity;
    }

    if (habitat) {
      where.primaryHabitat = { contains: habitat, mode: "insensitive" };
    }

    if (metabolism) {
      where.metabolism = metabolism;
    }

    if (minPathogenicity || maxPathogenicity) {
      where.pathogenicityScore = {};
      if (minPathogenicity) {
        where.pathogenicityScore.gte = Number.parseFloat(minPathogenicity);
      }
      if (maxPathogenicity) {
        where.pathogenicityScore.lte = Number.parseFloat(maxPathogenicity);
      }
    }

    if (search) {
      where.organism = {
        OR: [
          { scientificName: { contains: search, mode: "insensitive" } },
          { commonName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Get total count
    const total = await prisma.microbialPokedexEntry.count({ where });

    // Get paginated entries
    const entries = await prisma.microbialPokedexEntry.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { pokedexNumber: "asc" },
      include: {
        organism: {
          select: {
            scientificName: true,
            commonName: true,
          },
        },
      },
    });

    // Filter by AlphaFold if requested
    let filteredEntries = entries;
    if (hasAlphaFold === "true") {
      const entriesWithAlphaFold = await Promise.all(
        entries.map(async (entry) => {
          const alphafoldCount = await prisma.alphaFoldPrediction.count({
            where: { pokedexEntryId: entry.id },
          });
          return alphafoldCount > 0 ? entry : null;
        })
      );
      filteredEntries = entriesWithAlphaFold.filter((e) => e !== null) as typeof entries;
    }

    // Transform to API response format
    const response = {
      entries: filteredEntries.map((entry) => ({
        id: entry.id,
        pokedexNumber: entry.pokedexNumber,
        organism: {
          scientificName: entry.organism.scientificName,
          commonName: entry.organism.commonName,
        },
        nickname: entry.nickname,
        rarity: entry.rarity,
        primaryHabitat: entry.primaryHabitat,
        pathogenicityScore: entry.pathogenicityScore,
      })),
      total,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching Pokedex entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch Pokedex entries" },
      { status: 500 }
    );
  }
}
