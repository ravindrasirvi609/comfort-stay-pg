/**
 * Script to update all metadata configurations in the app
 * - Creates shared-metadata.ts for viewport config
 * - Updates layout files to move viewport and themeColor to viewport export
 *
 * Run with: ts-node src/scripts/update-metadata.ts
 */

import * as fs from "fs";
import * as path from "path";

// Define the path to the app directory
const APP_DIR = path.join(__dirname, "..", "app");

// Define the shared metadata content
const SHARED_METADATA_CONTENT = `import type { Viewport } from 'next';

// Default viewport configuration to use across the application
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d53f8c', // Comfort Stay PG brand color
};
`;

// Write the shared metadata file
fs.writeFileSync(
  path.join(APP_DIR, "shared-metadata.ts"),
  SHARED_METADATA_CONTENT
);
console.log("✅ Created shared-metadata.ts");

/**
 * Find all files in a directory that match the given patterns
 */
function findFiles(
  dir: string,
  patterns: RegExp[],
  fileList: string[] = []
): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, patterns, fileList);
    } else if (patterns.some((pattern) => pattern.test(file))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Update a file to fix metadata configuration
 */
function updateFile(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Check if the file has metadata with viewport or themeColor
    if (
      (content.includes("viewport:") || content.includes("themeColor:")) &&
      content.includes("export const metadata")
    ) {
      console.log(`🔍 Processing ${filePath}`);

      // Add import if not already there
      if (
        !content.includes("import { defaultViewport }") &&
        !content.includes("export const viewport")
      ) {
        // Calculate relative path to shared-metadata
        const relativePath =
          path.relative(path.dirname(filePath), APP_DIR).replace(/\\/g, "/") ||
          ".";

        const importLine = `import { defaultViewport } from '${relativePath}/shared-metadata';\n`;

        // Add import after other imports
        const lastImportIndex = content.lastIndexOf("import");
        if (lastImportIndex !== -1) {
          const importEndIndex = content.indexOf("\n", lastImportIndex) + 1;
          content =
            content.slice(0, importEndIndex) +
            importLine +
            content.slice(importEndIndex);
        } else {
          content = importLine + content;
        }

        modified = true;
      }

      // Extract and remove viewport and themeColor from metadata
      let viewportValue: string | undefined;
      let themeColorValue: string | undefined;

      // Extract viewport value if it exists
      const viewportMatch = content.match(/viewport\s*:\s*["']([^"']+)["']/);
      if (viewportMatch) {
        viewportValue = viewportMatch[1];
        // Remove viewport from metadata
        content = content.replace(/\s*viewport\s*:\s*["'][^"']+["'],?/g, "");
        modified = true;
      }

      // Extract themeColor value if it exists
      const themeColorMatch = content.match(
        /themeColor\s*:\s*["']([^"']+)["']/
      );
      if (themeColorMatch) {
        themeColorValue = themeColorMatch[1];
        // Remove themeColor from metadata
        content = content.replace(/\s*themeColor\s*:\s*["'][^"']+["'],?/g, "");
        modified = true;
      }

      // Fix any double commas or trailing commas that might have been created
      content = content.replace(/,\s*,/g, ",").replace(/,\s*}/g, " }");

      // Add viewport export if not already present and we have values to add
      if (
        (viewportValue || themeColorValue) &&
        !content.includes("export const viewport")
      ) {
        // Create a new viewport export
        let viewportExport = "export const viewport: Viewport = {\n";

        if (viewportValue && viewportValue.includes("device-width")) {
          viewportExport += '  width: "device-width",\n';
          viewportExport += "  initialScale: 1,\n";
        } else if (viewportValue) {
          viewportExport += `  viewport: "${viewportValue}",\n`;
        } else {
          viewportExport += '  width: "device-width",\n';
          viewportExport += "  initialScale: 1,\n";
        }

        if (themeColorValue) {
          viewportExport += `  themeColor: "${themeColorValue}",\n`;
        }

        viewportExport += "};\n\n";

        // Add after metadata
        const metadataEndIndex =
          content.indexOf("};", content.indexOf("export const metadata")) + 2;
        content =
          content.slice(0, metadataEndIndex + 1) +
          "\n" +
          viewportExport +
          content.slice(metadataEndIndex + 1);

        modified = true;
      }

      // If we're using defaultViewport, add it
      if (
        !viewportValue &&
        !themeColorValue &&
        !content.includes("export const viewport")
      ) {
        // Add after metadata
        const metadataEndIndex =
          content.indexOf("};", content.indexOf("export const metadata")) + 2;
        content =
          content.slice(0, metadataEndIndex + 1) +
          "\n\nexport const viewport = defaultViewport;\n" +
          content.slice(metadataEndIndex + 1);

        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Find all layout and page files
const files = findFiles(APP_DIR, [
  /layout\.tsx$/,
  /page\.tsx$/,
  /layout\.js$/,
  /page\.js$/,
]);
console.log(`Found ${files.length} layout/page files to process`);

// Update each file
files.forEach(updateFile);

console.log("✅ All files updated!");
