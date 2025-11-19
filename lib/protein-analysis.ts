// Protein analysis utilities for calculating properties

export interface AminoAcidProperties {
  hydrophobicity: number;
  charge: number;
  polarity: 'polar' | 'nonpolar' | 'charged';
  molecularWeight: number;
}

// Kyte-Doolittle hydrophobicity scale
const hydrophobicityScale: Record<string, number> = {
  'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5,
  'Q': -3.5, 'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5,
  'L': 3.8, 'K': -3.9, 'M': 1.9, 'F': 2.8, 'P': -1.6,
  'S': -0.8, 'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
};

// Amino acid charges at pH 7
const chargeScale: Record<string, number> = {
  'D': -1, 'E': -1, 'K': 1, 'R': 1, 'H': 0.5,
  // All others are neutral
};

// Molecular weights (Da)
const molecularWeights: Record<string, number> = {
  'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.15,
  'Q': 146.15, 'E': 147.13, 'G': 75.07, 'H': 155.16, 'I': 131.17,
  'L': 131.17, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
  'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
};

export function getAminoAcidProperties(aa: string): AminoAcidProperties {
  const upper = aa.toUpperCase();
  const hydrophobicity = hydrophobicityScale[upper] || 0;
  const charge = chargeScale[upper] || 0;
  const molecularWeight = molecularWeights[upper] || 0;
  
  let polarity: 'polar' | 'nonpolar' | 'charged' = 'nonpolar';
  if (charge !== 0) {
    polarity = 'charged';
  } else if (hydrophobicity < 0) {
    polarity = 'polar';
  }
  
  return { hydrophobicity, charge, polarity, molecularWeight };
}

export interface ProteinProperties {
  molecularWeight: number;
  length: number;
  composition: Record<string, number>;
  averageHydrophobicity: number;
  netCharge: number;
  isoelectricPoint: number;
  hydrophobicRegions: Array<{ start: number; end: number; score: number }>;
  chargedRegions: Array<{ start: number; end: number; charge: number }>;
}

export function analyzeProtein(sequence: string): ProteinProperties {
  const cleanSeq = sequence.replace(/[^A-Z]/gi, '').toUpperCase();
  
  // Calculate composition
  const composition: Record<string, number> = {};
  for (const aa of cleanSeq) {
    composition[aa] = (composition[aa] || 0) + 1;
  }
  
  // Calculate molecular weight (subtract water for peptide bonds)
  let mw = 0;
  for (const aa of cleanSeq) {
    mw += molecularWeights[aa] || 0;
  }
  mw -= (cleanSeq.length - 1) * 18.015; // Subtract water for peptide bonds
  
  // Calculate average hydrophobicity
  let totalHydrophobicity = 0;
  for (const aa of cleanSeq) {
    totalHydrophobicity += hydrophobicityScale[aa] || 0;
  }
  const averageHydrophobicity = totalHydrophobicity / cleanSeq.length;
  
  // Calculate net charge
  let netCharge = 0;
  for (const aa of cleanSeq) {
    netCharge += chargeScale[aa] || 0;
  }
  
  // Estimate pI (simplified calculation)
  const numPositive = (composition['K'] || 0) + (composition['R'] || 0) + (composition['H'] || 0) * 0.5;
  const numNegative = (composition['D'] || 0) + (composition['E'] || 0);
  const isoelectricPoint = 7.0 + (numPositive - numNegative) / cleanSeq.length * 3;
  
  // Find hydrophobic regions (window size 7)
  const hydrophobicRegions = findRegions(cleanSeq, 7, (window) => {
    let score = 0;
    for (const aa of window) {
      score += hydrophobicityScale[aa] || 0;
    }
    return score / window.length;
  }, 1.5); // Threshold for hydrophobic
  
  // Find charged regions
  const chargedRegions = findRegions(cleanSeq, 5, (window) => {
    let charge = 0;
    for (const aa of window) {
      charge += Math.abs(chargeScale[aa] || 0);
    }
    return charge;
  }, 1.5); // Threshold for charged
  
  return {
    molecularWeight: Math.round(mw),
    length: cleanSeq.length,
    composition,
    averageHydrophobicity: Math.round(averageHydrophobicity * 100) / 100,
    netCharge: Math.round(netCharge * 10) / 10,
    isoelectricPoint: Math.round(isoelectricPoint * 100) / 100,
    hydrophobicRegions,
    chargedRegions: chargedRegions.map(r => ({ ...r, charge: r.score }))
  };
}

function findRegions(
  sequence: string,
  windowSize: number,
  scoreFn: (window: string) => number,
  threshold: number
): Array<{ start: number; end: number; score: number }> {
  const regions: Array<{ start: number; end: number; score: number }> = [];
  let inRegion = false;
  let regionStart = 0;
  
  for (let i = 0; i <= sequence.length - windowSize; i++) {
    const window = sequence.slice(i, i + windowSize);
    const score = scoreFn(window);
    
    if (score >= threshold && !inRegion) {
      inRegion = true;
      regionStart = i;
    } else if (score < threshold && inRegion) {
      regions.push({
        start: regionStart,
        end: i + windowSize - 1,
        score: scoreFn(sequence.slice(regionStart, i + windowSize))
      });
      inRegion = false;
    }
  }
  
  // Close any open region
  if (inRegion) {
    regions.push({
      start: regionStart,
      end: sequence.length - 1,
      score: scoreFn(sequence.slice(regionStart))
    });
  }
  
  return regions;
}

// Generate hydrophobicity plot data
export function generateHydrophobicityPlot(
  sequence: string,
  windowSize: number = 7
): Array<{ position: number; hydrophobicity: number }> {
  const cleanSeq = sequence.replace(/[^A-Z]/gi, '').toUpperCase();
  const plot: Array<{ position: number; hydrophobicity: number }> = [];
  
  for (let i = 0; i <= cleanSeq.length - windowSize; i++) {
    const window = cleanSeq.slice(i, i + windowSize);
    let score = 0;
    for (const aa of window) {
      score += hydrophobicityScale[aa] || 0;
    }
    plot.push({
      position: i + Math.floor(windowSize / 2),
      hydrophobicity: score / windowSize
    });
  }
  
  return plot;
}
