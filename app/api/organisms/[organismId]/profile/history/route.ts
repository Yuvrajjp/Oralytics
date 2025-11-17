import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      organismId?: string;
    }>;
  }
) {
  try {
    const resolvedParams = (await (context as any).params) as {
      organismId?: string;
    };
    const { organismId } = resolvedParams;

    if (!organismId) {
      return NextResponse.json(
        { error: "Organism ID is required" },
        { status: 400 }
      );
    }

    // Get profile history, ordered by newest first
    const history = await prisma.profileHistory.findMany({
      where: { organismId },
      orderBy: { changedAt: "desc" },
      include: {
        profile: {
          select: {
            versionNumber: true,
          },
        },
      },
    });

    if (history.length === 0) {
      return NextResponse.json(
        { error: "No history found for this organism" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organismId,
      totalEntries: history.length,
      history,
    });
  } catch (error) {
    console.error("Error fetching profile history:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile history" },
      { status: 500 }
    );
  }
}
