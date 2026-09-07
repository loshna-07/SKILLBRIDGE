import prisma from './config/db';

async function main() {
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;');
  await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
  console.log('Public schema dropped and recreated in PostgreSQL.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
