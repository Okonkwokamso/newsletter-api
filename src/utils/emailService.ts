import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig";
import logger from "../utils/logger"; 
import { renderTemplate } from "./templateRenderer";

interface EmailOptions {
  to: string; // Recipient's email address
  subject: string; // Email subject
  templateFileName: string;
  replacements: { [key: string]: string };
}

/*export const sendEmail = async (options: EmailOptions): Promise<void> => {
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
};*/


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

  try {
    // Load the HTML template
    const templatePath = path.join(__dirname, "../templates", options.templateFileName);
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

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
};









