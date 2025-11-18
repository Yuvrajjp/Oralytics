// app/api/ml/secreted-proteins/route.ts
// API route for retrieving secreted proteins

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organismId = searchParams.get('organismId');
    const pathway = searchParams.get('pathway');
    const isSecreted = searchParams.get('isSecreted');
    const isMachinery = searchParams.get('isMachinery');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    
    const where: any = {};
    
    // Filter by secretion status
    if (isSecreted !== null) {
      where.isSecreted = isSecreted === 'true';
    }
    
    if (isMachinery !== null) {
      where.isSecretionMachinery = isMachinery === 'true';
    }
    
    if (pathway) {
      where.secretionPathway = pathway;
    }
    
    // Add organism filter if provided
    if (organismId) {
      where.protein = {
        gene: {
          organismId: organismId
        }
      };
    }
    
    const [proteins, total] = await Promise.all([
      prisma.proteinSecretionInfo.findMany({
        where,
        include: {
          protein: {
            include: {
              gene: {
                include: {
                  organism: true,
                  chromosome: true
                }
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.proteinSecretionInfo.count({
        where
      })
    ]);
    
    return NextResponse.json({
      success: true,
      count: proteins.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: proteins
    });
  } catch (error) {
    console.error('Error fetching secreted proteins:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch secreted proteins'
      },
      { status: 500 }
    );
  }
}
