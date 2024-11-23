import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig";
import logger from "../utils/logger"; 
import { AppError } from './AppError'
//import { renderTemplate } from "./templateRenderer";

const MAX_RETRIES = 3;

interface EmailOptions {
  to: string; // Recipient's email address
  subject: string; // Email subject
  templateFileName: string;
  replacements: { [key: string]: string };
}

export const sendEmail = async (options: EmailOptions) => {
  // Create a transporter (configure Mailtrap for testing)
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    logger: true,
    debug: true
  });

  // Load the HTML template
  const templatePath = path.join(__dirname, "../templates", options.templateFileName);
  if (!fs.existsSync(templatePath)) {
    throw new AppError(`Email template ${options.templateFileName} not found`, 500);
  }

  let templateContent = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholders in the template
  for (const [key, value] of Object.entries(options.replacements)) {
    const placeholder = `{{${key}}}`;
    templateContent = templateContent.replace(new RegExp(placeholder, "g"), value);
  }
  
  // Define email options
  const mailOptions = {
    from: `"Newsletter Team" <${emailConfig.auth.user}>`,
    to: options.to,
    subject: options.subject,
    html: templateContent,
  };

  let attempts = 0;
  let sent = false;
  while (attempts < MAX_RETRIES && !sent) {
    try{
      // Send the email
      await transporter.sendMail(mailOptions);
      sent = true;
      console.log(`Email successfully sent to ${options.to}`);
    } catch (error: any) {
      attempts++;
      logger.error(
        `Failed to send email to ${options.to}. Attempt ${attempts} of ${MAX_RETRIES}. Error: ${error.message}`
      );

      if (attempts >= MAX_RETRIES) {
        logger.error(`Max retries reached. Email to ${options.to} could not be sent.`);
        throw new AppError("Failed to send email after multiple attempts", 500);
      }

      // Wait before retrying (optional, e.g., 5-second delay)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

};









