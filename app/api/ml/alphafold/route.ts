// app/api/ml/alphafold/route.ts
// API route for AlphaFold structure data and predictions

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Search for AlphaFold structures by UniProt ID or protein sequence
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniprotId = searchParams.get('uniprotId');
    const proteinId = searchParams.get('proteinId');
    const accession = searchParams.get('accession');
    
    if (!uniprotId && !proteinId && !accession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either uniprotId, proteinId, or accession must be provided'
        },
        { status: 400 }
      );
    }
    
    // Fetch protein from database
    let protein = null;
    if (proteinId) {
      protein = await prisma.protein.findUnique({
        where: { id: proteinId },
        include: {
          gene: true,
          secretionInfo: true
        }
      });
    } else if (accession) {
      protein = await prisma.protein.findUnique({
        where: { accession },
        include: {
          gene: true,
          secretionInfo: true
        }
      });
    }
    
    if (!protein && (proteinId || accession)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Protein not found'
        },
        { status: 404 }
      );
    }
    
    // Check if we have AlphaFold prediction cached
    const cacheKey = `alphafold:${uniprotId || accession || proteinId}`;
    const cachedPrediction = await prisma.predictionCache.findUnique({
      where: { cacheKey }
    });
    
    if (cachedPrediction) {
      // Update hit count and last accessed time
      await prisma.predictionCache.update({
        where: { id: cachedPrediction.id },
        data: {
          hitCount: cachedPrediction.hitCount + 1,
          lastAccessedAt: new Date()
        }
      });
      
      return NextResponse.json({
        success: true,
        cached: true,
        data: JSON.parse(cachedPrediction.cacheValue),
        protein: protein ? {
          id: protein.id,
          accession: protein.accession,
          name: protein.name,
          sequence: protein.sequence,
          sequenceLength: protein.sequenceLength
        } : null
      });
    }
    
    // Mock AlphaFold data (in real implementation, fetch from AlphaFold DB API)
    const mockAlphaFoldData = {
      uniprotId: uniprotId || 'MOCK_UNIPROT',
      entryId: uniprotId || 'AF-MOCK-F1',
      modelUrl: `https://alphafold.ebi.ac.uk/entry/${uniprotId || 'MOCK'}`,
      pdbUrl: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId || 'MOCK'}-F1-model_v4.pdb`,
      cifUrl: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId || 'MOCK'}-F1-model_v4.cif`,
      paeUrl: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId || 'MOCK'}-F1-predicted_aligned_error_v4.json`,
      confidence: {
        avgPlddt: 82.5,
        plddt: Array.from({ length: protein?.sequenceLength || 100 }, (_, i) => ({
          residue: i + 1,
          score: 70 + Math.random() * 25 // Mock scores between 70-95
        }))
      },
      metadata: {
        modelVersion: 4,
        predictedOn: new Date().toISOString(),
        sequenceLength: protein?.sequenceLength || null
      }
    };
    
    // Cache the result
    await prisma.predictionCache.create({
      data: {
        cacheKey,
        cacheValue: JSON.stringify(mockAlphaFoldData),
        predictionType: 'alphafold_structure',
        metadata: JSON.stringify({
          uniprotId,
          proteinId,
          accession,
          timestamp: new Date().toISOString()
        }),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    return NextResponse.json({
      success: true,
      cached: false,
      data: mockAlphaFoldData,
      protein: protein ? {
        id: protein.id,
        accession: protein.accession,
        name: protein.name,
        sequence: protein.sequence,
        sequenceLength: protein.sequenceLength
      } : null
    });
  } catch (error) {
    console.error('Error fetching AlphaFold data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AlphaFold data'
      },
      { status: 500 }
    );
  }
}

/**
 * Submit a protein sequence for structure prediction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proteinId, sequence, email } = body;
    
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
    
    if (proteinId) {
      protein = await prisma.protein.findUnique({
        where: { id: proteinId }
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
      
      targetSequence = protein.sequence;
    }
    
    if (!targetSequence) {
      return NextResponse.json(
        {
          success: false,
          error: 'No sequence available'
        },
        { status: 400 }
      );
    }
    
    // Create an analysis record
    const analysis = await prisma.proteinAnalysis.create({
      data: {
        proteinId: proteinId || 'unknown',
        analysisType: 'alphafold_structure_prediction',
        status: 'pending',
        inputParams: JSON.stringify({
          sequence: targetSequence.substring(0, 100) + '...', // Store truncated
          sequenceLength: targetSequence.length,
          email
        })
      }
    });
    
    // In a real implementation, this would submit to AlphaFold Server API
    // For now, return a mock job ID
    const jobId = `AF_JOB_${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      jobId,
      analysisId: analysis.id,
      status: 'submitted',
      message: 'Structure prediction job submitted. This is a mock response.',
      estimatedTime: '15-30 minutes',
      checkStatusUrl: `/api/ml/alphafold/status?jobId=${jobId}`
    });
  } catch (error) {
    console.error('Error submitting structure prediction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit structure prediction'
      },
      { status: 500 }
    );
  }
}
