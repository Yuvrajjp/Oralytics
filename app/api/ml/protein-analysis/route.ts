// app/api/ml/protein-analysis/route.ts
// API route for protein sequence analysis

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mock protein analysis function
 * In a real implementation, this would call HuggingFace models or other ML services
 */
async function analyzeProteinSequence(sequence: string, analysisType: string) {
  // Mock analysis results
  switch (analysisType) {
    case 'basic':
      return {
        length: sequence.length,
        molecularWeight: sequence.length * 110, // Approximate
        isoelectricPoint: 7.2, // Mock value
        composition: {
          hydrophobic: 0.35,
          polar: 0.25,
          charged: 0.15,
          other: 0.25
        }
      };
    
    case 'structure':
      return {
        predictedStructure: 'Mock structure prediction',
        confidence: 0.85,
        secondaryStructure: {
          helix: 0.45,
          sheet: 0.30,
          coil: 0.25
        },
        domains: [
          { name: 'Domain 1', start: 1, end: 100, confidence: 0.9 },
          { name: 'Domain 2', start: 150, end: 250, confidence: 0.85 }
        ]
      };
    
    case 'localization':
      return {
        predictions: [
          { location: 'Extracellular', probability: 0.65 },
          { location: 'Cell membrane', probability: 0.20 },
          { location: 'Cytoplasm', probability: 0.15 }
        ],
        hasSignalPeptide: true,
        signalPeptideCleavageSite: 25
      };
    
    case 'function':
      return {
        predictedFunctions: [
          { function: 'Toxin activity', confidence: 0.78 },
          { function: 'Membrane binding', confidence: 0.62 }
        ],
        goTerms: ['GO:0090729', 'GO:0044659'],
        enzymeClass: null
      };
    
    default:
      return { error: 'Unknown analysis type' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proteinId, sequence, analysisType = 'basic' } = body;
    
    if (!sequence && !proteinId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either proteinId or sequence must be provided'
        },
        { status: 400 }
      );
    }
    
    let targetSequence = sequence;
    let protein = null;
    
    // If proteinId provided, fetch from database
    if (proteinId) {
      protein = await prisma.protein.findUnique({
        where: { id: proteinId },
        include: {
          gene: true,
          secretionInfo: true
        }
      });
      
      if (!protein) {
        return NextResponse.json(
          {
            success: false,
            error: 'Protein not found'
          },
          { status: 404 }
        );
      }
      
      targetSequence = protein.sequence || '';
    }
    
    if (!targetSequence) {
      return NextResponse.json(
        {
          success: false,
          error: 'No sequence available for analysis'
        },
        { status: 400 }
      );
    }
    
    // Perform analysis
    const results = await analyzeProteinSequence(targetSequence, analysisType);
    
    // Store analysis record if proteinId provided
    if (proteinId) {
      await prisma.proteinAnalysis.create({
        data: {
          proteinId,
          analysisType,
          status: 'completed',
          inputParams: JSON.stringify({ analysisType }),
          results: JSON.stringify(results),
          completedAt: new Date()
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      proteinId,
      analysisType,
      results,
      protein: protein ? {
        id: protein.id,
        accession: protein.accession,
        name: protein.name,
        sequenceLength: protein.sequenceLength
      } : null
    });
  } catch (error) {
    console.error('Error analyzing protein:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze protein'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proteinId = searchParams.get('proteinId');
    const analysisType = searchParams.get('analysisType');
    
    if (!proteinId) {
      return NextResponse.json(
        {
          success: false,
          error: 'proteinId parameter is required'
        },
        { status: 400 }
      );
    }
    
    const where: any = { proteinId };
    if (analysisType) {
      where.analysisType = analysisType;
    }
    
    const analyses = await prisma.proteinAnalysis.findMany({
      where,
      orderBy: {
        startedAt: 'desc'
      },
      take: 10
    });
    
    return NextResponse.json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error('Error fetching protein analyses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch protein analyses'
      },
      { status: 500 }
    );
  }
}
