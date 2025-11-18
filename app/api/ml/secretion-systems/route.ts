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
        components: {
          include: {
            gene: true,
            protein: {
              include: {
                secretionInfo: true
              }
            }
          }
        },
        cargoProteins: true
      },
      orderBy: {
        startPosition: 'asc'
      }
    });
    
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
