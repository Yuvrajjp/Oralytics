import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const org = await prisma.organism.findFirst({ where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } } });
  if(!org){
    console.log('Organism not found');
    await prisma.$disconnect();
    return;
  }
  const profile = await prisma.organismProfile.findUnique({ where: { organismId: org.id } });
  if(!profile){
    console.log('No profile exists; creating one');
    // compute current counts
    const proteinCount = await prisma.protein.count({ where: { gene: { organismId: org.id } } });
    const geneCount = await prisma.gene.count({ where: { organismId: org.id } });
    await prisma.organismProfile.create({ data: { organism: { connect: { id: org.id } }, genomeDescription: `NCBI BioProject ${735719} - proteins: ${proteinCount}`, estimatedProteins: proteinCount, estimatedGenes: geneCount } as any });
    console.log('Profile created');
  } else {
    const proteinCount = await prisma.protein.count({ where: { gene: { organismId: org.id } } });
    const geneCount = await prisma.gene.count({ where: { organismId: org.id } });
    await prisma.organismProfile.update({ where: { id: profile.id }, data: { genomeDescription: `NCBI BioProject ${735719} - proteins: ${proteinCount}`, estimatedProteins: proteinCount, estimatedGenes: geneCount } as any });
    console.log(`Profile updated to ${proteinCount} proteins and ${geneCount} genes`);
  }
  await prisma.$disconnect();
}

main().catch(async(e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });