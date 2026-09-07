import prisma from './config/db';

async function main() {
  console.log('Updating all assessment records to 75% passing score...');
  const result = await prisma.assessment.updateMany({
    data: {
      passingScore: 75.0,
    },
  });
  console.log(`Updated ${result.count} assessments to passingScore: 75.0`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
