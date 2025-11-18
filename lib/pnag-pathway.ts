// PNAG EPS biosynthesis pathway data

export interface PathwayNode {
  id: string;
  name: string;
  type: 'gene' | 'enzyme' | 'metabolite' | 'complex';
  description: string;
  highlighted?: boolean;
}

export interface PathwayEdge {
  from: string;
  to: string;
  label?: string;
}

export interface PathwayData {
  nodes: PathwayNode[];
  edges: PathwayEdge[];
  description: string;
}

export const pnagPathway: PathwayData = {
  description: 'PNAG (Poly-β-1,6-N-acetyl-D-glucosamine) is a key exopolysaccharide component that forms biofilms and protects bacteria. This pathway shows the integration of AaFlp-1 pili for adhesion and AaDcuC for metabolic support.',
  nodes: [
    {
      id: 'aaflp1',
      name: 'AaFlp-1',
      type: 'gene',
      description: 'Flp pilus protein for adhesion',
      highlighted: true
    },
    {
      id: 'pili-assembly',
      name: 'Pili Complex',
      type: 'complex',
      description: 'Type IVb pilus assembly on cell surface'
    },
    {
      id: 'adhesion',
      name: 'Host Adhesion',
      type: 'metabolite',
      description: 'Attachment to host cells and surfaces'
    },
    {
      id: 'biofilm',
      name: 'Biofilm Formation',
      type: 'metabolite',
      description: 'Multi-layered bacterial community'
    },
    {
      id: 'pnag-synthesis',
      name: 'PNAG Synthesis',
      type: 'enzyme',
      description: 'Biosynthesis of PNAG polysaccharide'
    },
    {
      id: 'pnag',
      name: 'PNAG EPS',
      type: 'metabolite',
      description: 'Exopolysaccharide matrix'
    },
    {
      id: 'aadcuc',
      name: 'AaDcuC',
      type: 'gene',
      description: 'C4-dicarboxylate transporter',
      highlighted: true
    },
    {
      id: 'succinate',
      name: 'Succinate/Fumarate',
      type: 'metabolite',
      description: 'C4-dicarboxylates for respiration'
    },
    {
      id: 'energy',
      name: 'ATP Production',
      type: 'metabolite',
      description: 'Energy for biosynthesis'
    },
    {
      id: 'fumarate-respiration',
      name: 'Fumarate Respiration',
      type: 'enzyme',
      description: 'Anaerobic respiration pathway'
    }
  ],
  edges: [
    { from: 'aaflp1', to: 'pili-assembly', label: 'assembles' },
    { from: 'pili-assembly', to: 'adhesion', label: 'enables' },
    { from: 'adhesion', to: 'biofilm', label: 'initiates' },
    { from: 'biofilm', to: 'pnag-synthesis', label: 'triggers' },
    { from: 'pnag-synthesis', to: 'pnag', label: 'produces' },
    { from: 'pnag', to: 'biofilm', label: 'stabilizes' },
    { from: 'aadcuc', to: 'succinate', label: 'imports' },
    { from: 'succinate', to: 'fumarate-respiration', label: 'substrate' },
    { from: 'fumarate-respiration', to: 'energy', label: 'generates' },
    { from: 'energy', to: 'pnag-synthesis', label: 'powers' },
    { from: 'energy', to: 'pili-assembly', label: 'powers' }
  ]
};

// Genomic context data
export interface GenomicContext {
  geneId: string;
  chromosome: string;
  position: number;
  neighbors: Array<{
    name: string;
    locusTag: string;
    distance: number;
    function: string;
  }>;
}

export const aaFlp1Context: GenomicContext = {
  geneId: 'UEL54261.1',
  chromosome: 'CP076449.1',
  position: 905927, // midpoint
  neighbors: [
    {
      name: 'flp-2',
      locusTag: 'KO461_04675',
      distance: -500,
      function: 'Flp family type IVb pilin'
    },
    {
      name: 'cpaA',
      locusTag: 'KO461_04670',
      distance: -1200,
      function: 'Flp pilus assembly peptidase CpaA'
    },
    {
      name: 'ybeY',
      locusTag: 'KO461_04685',
      distance: 600,
      function: 'rRNA maturation RNase YbeY'
    }
  ]
};

export const aaDcuCContext: GenomicContext = {
  geneId: 'UEL52696.1',
  chromosome: 'CP076449.1',
  position: 1373917, // midpoint
  neighbors: [
    {
      name: 'IS3',
      locusTag: 'KO461_06890',
      distance: -1000,
      function: 'IS3 family transposase'
    },
    {
      name: 'transposase',
      locusTag: 'KO461_06900',
      distance: 1000,
      function: 'IS3 family transposase'
    },
    {
      name: 'integrase',
      locusTag: 'KO461_06905',
      distance: 1500,
      function: 'Integrase'
    }
  ]
};
