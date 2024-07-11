import  prisma  from '@/lib/prisma';

async function emptyTables() {
  try {
    // Delete all users
    await prisma.user.deleteMany();
    
    // Delete all organizations
    await prisma.organisation.deleteMany();

    console.log('Users and Organizations tables emptied successfully.');
  } catch (error) {
    console.error('Error emptying tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

emptyTables();
