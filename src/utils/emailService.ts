import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig";
import logger from "../utils/logger"; // Ensure you have a logger utility

interface EmailOptions {
  to: string; // Recipient's email address
  subject: string; // Email subject
  text?: string; // Plain text body
  html?: string; // HTML body (optional)
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure, // Use TLS if false
      auth: emailConfig.auth,
      logger: true,
      debug: true
    });
    
    // Define email options
    const mailOptions = {
      from: `"Newsletter API" <${emailConfig.auth.user}>`, // Sender address
      to: options.to, // Recipient address
      subject: options.subject, // Email subject
      text: options.text 
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log the message ID for debugging
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error(`Failed to send email: ${(error as Error).message}`);
    throw new Error("Failed to send email");
  }
};







// import { sendEmail } from "../utils/emailService";

// const notifyUser = async () => {
//   try {
//     await sendEmail({
//       to: "user@example.com",
//       subject: "Welcome to the Newsletter!",
//       text: "Thank you for subscribing to our newsletter.",
//     });
//     console.log("Email sent successfully.");
//   } catch (error) {
//     console.error("Failed to send email:", error);
//   }
// };

// notifyUser();
