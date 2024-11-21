import dotenv from "dotenv";

dotenv.config();

export const emailConfig = {
  host: process.env.EMAIL_HOST, // Replace with your SMTP server
  port: 2525,
  secure: false, 
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
};
