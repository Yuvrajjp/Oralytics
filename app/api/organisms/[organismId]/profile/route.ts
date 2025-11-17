import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

const db = prisma ?? new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organismId?: string }> }
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

    // Get the current profile
    const profile = await db.organismProfile.findUnique({
      where: { organismId },
      include: {
        organism: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found for this organism" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ organismId?: string }> }
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

    const body = await request.json();
    const {
      gramStain,
      cellShape,
      cellArrangement,
      motility,
      gcContent,
      genomeDescription,
      cultivability,
      temperatureOptimal,
      temperatureRange,
      phOptimal,
      phRange,
      habitat,
      ecologyDescription,
      pathogenicity,
      pangenomeInfo,
      ncbiTaxonId,
      homdUrl,
      bacdiveUrl,
      bacdiveId,
      changeReason,
      dataSource,
      changedBy,
      notes,
    } = body;

    // Get existing profile or create new one
    let profile = await db.organismProfile.findUnique({
      where: { organismId },
    });

    const isNewProfile = !profile;
    const newVersionNumber = profile ? profile.versionNumber + 1 : 1;

    // Track what changed for history
    const changes: Array<{
      field: string;
      oldValue: string | null;
      newValue: string | null;
    }> = [];

    if (profile) {
      if (gramStain && gramStain !== profile.gramStain)
        changes.push({
          field: "gramStain",
          oldValue: profile.gramStain || null,
          newValue: gramStain,
        });
      if (cellShape && cellShape !== profile.cellShape)
        changes.push({
          field: "cellShape",
          oldValue: profile.cellShape || null,
          newValue: cellShape,
        });
      if (habitat && habitat !== profile.habitat)
        changes.push({
          field: "habitat",
          oldValue: profile.habitat || null,
          newValue: habitat,
        });
      if (ecologyDescription && ecologyDescription !== profile.ecologyDescription)
        changes.push({
          field: "ecologyDescription",
          oldValue: profile.ecologyDescription || null,
          newValue: ecologyDescription,
        });
    }

    // Update or create profile
    profile = await db.organismProfile.upsert({
      where: { organismId },
      create: {
        organismId,
        versionNumber: 1,
        gramStain,
        cellShape,
        cellArrangement,
        motility,
        gcContent,
        genomeDescription,
        cultivability,
        temperatureOptimal,
        temperatureRange,
        phOptimal,
        phRange,
        habitat,
        ecologyDescription,
        pathogenicity,
        pangenomeInfo,
        ncbiTaxonId,
        homdUrl,
        bacdiveUrl,
        bacdiveId,
      },
      update: {
        versionNumber: newVersionNumber,
        gramStain: gramStain || undefined,
        cellShape: cellShape || undefined,
        cellArrangement: cellArrangement || undefined,
        motility: motility || undefined,
        gcContent: gcContent || undefined,
        genomeDescription: genomeDescription || undefined,
        cultivability: cultivability || undefined,
        temperatureOptimal: temperatureOptimal || undefined,
        temperatureRange: temperatureRange || undefined,
        phOptimal: phOptimal || undefined,
        phRange: phRange || undefined,
        habitat: habitat || undefined,
        ecologyDescription: ecologyDescription || undefined,
        pathogenicity: pathogenicity || undefined,
        pangenomeInfo: pangenomeInfo || undefined,
        ncbiTaxonId: ncbiTaxonId || undefined,
        homdUrl: homdUrl || undefined,
        bacdiveUrl: bacdiveUrl || undefined,
        bacdiveId: bacdiveId || undefined,
      },
    });

    // Log changes to history
    if (isNewProfile) {
      await db.profileHistory.create({
        data: {
          profileId: profile.id,
          organismId,
          versionNumber: 1,
          changeField: "profile_created",
          newValue: "Profile created",
          changeReason: changeReason || "Initial profile creation",
          dataSource: dataSource || "Manual",
          changedBy: changedBy || "system:api",
          notes,
        },
      });
    } else if (changes.length > 0) {
      for (const change of changes) {
        await db.profileHistory.create({
          data: {
            profileId: profile.id,
            organismId,
            versionNumber: newVersionNumber,
            changeField: change.field,
            previousValue: change.oldValue,
            newValue: change.newValue,
            changeReason: changeReason || "Profile update",
            dataSource: dataSource || "Manual",
            changedBy: changedBy || "system:api",
            notes,
          },
        });
      }
    }

    return NextResponse.json(profile, { status: isNewProfile ? 201 : 200 });
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return NextResponse.json(
      { error: "Failed to create/update profile" },
      { status: 500 }
    );
  }
}
