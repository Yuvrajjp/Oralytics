// Core gene data for the MVP showcase
// Extracted from CP076449.1 genomic files

export interface GeneData {
  id: string;
  name: string;
  proteinId: string;
  locusTag: string;
  description: string;
  sequence: string;
  proteinSequence: string;
  location: {
    start: number;
    end: number;
    strand: '+' | '-';
    chromosome: string;
  };
  properties: {
    molecularWeight: number;
    length: number;
    calculatedMw: number;
  };
  function: string;
  pathway: string;
}

// AaFlp-1: Flp family type IVb pilin (unique Aa pili protein)
export const aaFlp1Gene: GeneData = {
  id: 'UEL54261.1',
  name: 'AaFlp-1',
  proteinId: 'UEL54261.1',
  locusTag: 'KO461_04680',
  description: 'Flp family type IVb pilin',
  sequence: '', // CDS sequence from genomic DNA
  proteinSequence: 'MLNTLTTKAYIKASEAIRSFRENQAGVTAIEYGLIAIAVAVLIVAVFYSNNGFIANLQSKFNSLASTVASANVTK',
  location: {
    start: 905814,
    end: 906041,
    strand: '-',
    chromosome: 'CP076449.1'
  },
  properties: {
    molecularWeight: 7840,
    length: 75,
    calculatedMw: 7840
  },
  function: 'Type IVb pilus assembly protein; forms adhesive pili on bacterial surface for host cell attachment',
  pathway: 'Flp pilus assembly system / EPS PNAG biosynthesis'
};

// AaDcuB: C4-dicarboxylate transporter (involved in fumarate respiration)
// Using dcuC which is the actual C4-dicarboxylate transporter in the genome
export const aaDcuBGene: GeneData = {
  id: 'UEL52696.1',
  name: 'AaDcuC',
  proteinId: 'UEL52696.1',
  locusTag: 'KO461_06895',
  description: 'Anaerobic C4-dicarboxylate transporter DcuC',
  sequence: '', // CDS sequence from genomic DNA
  proteinSequence: 'MDLIIGLITIVAVAYYIVKGYSATGVLMFGGLALLLISVLLGHPILPEKVKSTGSDFFDILEYVKYLLSERSGG' +
    'LGLMIMILCGFSAYMTHLGANDVVVKLVSKPLKNIRSPYILMVFAYFLACLMSFAVASATGLGVLLMATLFPVIV' +
    'NVGISRGAAAAICASPISIILSPTSGDVVLSAEISQIPLSEFAFGTSLPVSLSAICGIAVAHFFWQRYLDRKEGIKIE' +
    'RVDASEIKTIAPNFYAILPLLPIIGVLLFDGKFGLPKLHIVTIIILCFIITAVIDFARNFSAKKTFDNLVIAYRGMA' +
    'DAFAGVVMLLVAAGIFAQSLSTIGFITNLINSAQSFGGGSLITMLVLAVITILATMATGSGNAAFYAFAELIPKLAT' +
    'QMGANPAYLTIPMLQASNLGRGLSPVSGVVVAVSGMAKISPFEIVKRMSVPMAVGFICVVIATELFIPA',
  location: {
    start: 1373241,
    end: 1374593,
    strand: '-',
    chromosome: 'CP076449.1'
  },
  properties: {
    molecularWeight: 48500,
    length: 450,
    calculatedMw: 48500
  },
  function: 'Anaerobic C4-dicarboxylate transporter; transports succinate and fumarate across membrane for energy metabolism',
  pathway: 'Fumarate respiration / EPS PNAG biosynthesis support'
};

export const allGenes = [aaFlp1Gene, aaDcuBGene];

// Helper to get gene by ID
export function getGeneById(id: string): GeneData | undefined {
  return allGenes.find(gene => gene.id === id);
}
