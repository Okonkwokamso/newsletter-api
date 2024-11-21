// import { PrismaClient } from '@prisma/client';

// // Initialize the Prisma Client
// const prisma = new PrismaClient();

// // Test the database connection
// async function testConnection() {
//   try {
//     // Run a simple query to check if connection works
//     await prisma.$connect();
//     console.log('Database connection successful!');
//   } catch (error) {
//     console.error('Error connecting to the database:', error);
//   } finally {
//     // Disconnect after testing
//     await prisma.$disconnect();
//   }
// }

// // Run the function
// testConnection();

import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Replace with your SMTP server
  port: parseInt(process.env.EMAIL_PORT as string, 10) || 2525,
  secure: process.env.EMAIL_SECURE === "false", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates (for testing only)
  },
  logger: true,
  debug: true
  // tls: {
  //   ciphers:'SSLv3'
  // }
});


(async () => {
  try {
    console.log("Verifying Mailtrap SMTP connection...");

    const success = await transporter.verify();
    if (success) {
      console.log("SMTP server is ready to accept messages.");
    }
  } catch (error: any) {
    console.error("Failed to connect to SMTP server:", error.message);
  }
})();


