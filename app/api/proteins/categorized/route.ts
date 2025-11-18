import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

export async function GET() {
  try {
    const proteins = await prisma.protein.findMany({ select: { id: true, accession: true, name: true, functionClass: true, structureClass: true, predictedLocalization: true, sequenceLength: true, molecularWeight: true, gene: { select: { id: true, symbol: true } } } });
    // Build counts
    const functionCounts: Record<string, number> = {};
    const structureCounts: Record<string, number> = {};
    const locCounts: Record<string, number> = {};
    for (const p of proteins) {
      functionCounts[p.functionClass || 'Unknown'] = (functionCounts[p.functionClass || 'Unknown'] || 0) + 1;
      structureCounts[p.structureClass || 'Unknown'] = (structureCounts[p.structureClass || 'Unknown'] || 0) + 1;
      locCounts[p.predictedLocalization || 'Unknown'] = (locCounts[p.predictedLocalization || 'Unknown'] || 0) + 1;
    }

    return NextResponse.json({ total: proteins.length, functionCounts, structureCounts, locCounts, proteins });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
