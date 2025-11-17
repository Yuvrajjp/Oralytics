import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const org = await prisma.organism.findFirst({ where: { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } } });
  if(!org){ console.log('Aggregatibacter not found'); await prisma.$disconnect(); return; }
  const count = await prisma.protein.count({ where: { gene: { organismId: org.id } } });
  console.log(`Organism ${org.scientificName} has ${count} proteins linked to its genes (organismId=${org.id})`);
  await prisma.$disconnect();
}

main().catch(async(e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
