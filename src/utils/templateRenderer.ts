import fs from "fs";
import path from "path";
import handlebars from "handlebars";

/**
 * Renders an HTML template with dynamic data.
 * @param templateName - Name of the template file (without extension).
 * @param data - Dynamic data to populate the template.
 * @returns A rendered HTML string.
 */
export const renderTemplate = (templateName: string, data: Record<string, any>): string => {
    const filePath = path.resolve(__dirname, "../templates", `${templateName}.html`);

    // Read the template file
    const templateSource = fs.readFileSync(filePath, "utf-8");

    // Compile the template with Handlebars
    const template = handlebars.compile(templateSource);

    // Return the rendered HTML
    return template(data);
};
