import { PrismaClient } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient();

// Test the database connection
async function testConnection() {
  try {
    // Run a simple query to check if connection works
    await prisma.$connect();
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    // Disconnect after testing
    await prisma.$disconnect();
  }
}

// Run the function
testConnection();
