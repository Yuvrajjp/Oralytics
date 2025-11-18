// app/api/ml/secretion-systems/route.ts
// API route for retrieving secretion systems

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organismId = searchParams.get('organismId');
    const type = searchParams.get('type');
    
    const where: any = {};
    
    if (organismId) {
      where.organismId = organismId;
    }
    
    if (type) {
      where.type = type;
    }
    
    const systems = await prisma.secretionSystem.findMany({
      where,
      include: {
        components: true,
        cargoProteins: true
      },
      orderBy: {
        startPosition: 'asc'
      }
    });
    
    // Fetch related gene and protein data for each component
    for (const system of systems) {
      for (const component of system.components) {
        if (component.geneId) {
          const gene = await prisma.gene.findUnique({
            where: { id: component.geneId }
          });
          (component as any).gene = gene;
        }
        if (component.proteinId) {
          const protein = await prisma.protein.findUnique({
            where: { id: component.proteinId },
            include: {
              secretionInfo: true
            }
          });
          (component as any).protein = protein;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      count: systems.length,
      data: systems
    });
  } catch (error) {
    console.error('Error fetching secretion systems:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch secretion systems'
      },
      { status: 500 }
    );
  }
}
