#!/usr/bin/env node
import "dotenv/config";
import { processPDF } from "../src/mastra/utils/pdf-processor";
import * as path from "path";

async function main() {
    const pdfPath = process.argv[2];

    if (!pdfPath) {
        console.error("❌ Error: Please provide a PDF file path");
        console.log("\nUsage:");
        console.log("  npm run upload-pdf <path-to-pdf>");
        console.log("\nExample:");
        console.log("  npm run upload-pdf ./docs/user-guide.pdf");
        process.exit(1);
    }

    // Check if file exists
    const fs = require("fs");
    if (!fs.existsSync(pdfPath)) {
        console.error(`❌ Error: File not found: ${pdfPath}`);
        process.exit(1);
    }

    // Check if it's a PDF
    if (!pdfPath.toLowerCase().endsWith(".pdf")) {
        console.error(`❌ Error: File must be a PDF: ${pdfPath}`);
        process.exit(1);
    }

    console.log(`📄 Processing PDF: ${pdfPath}`);
    console.log("⏳ This may take a moment...\n");

    try {
        const result = await processPDF(pdfPath, {
            uploadedAt: new Date().toISOString(),
            category: "support-docs",
        });

        console.log(`✅ Success! Processed ${result.chunksProcessed} chunks`);
        console.log(`📁 Source: ${path.basename(pdfPath)}`);
        console.log("\n🎉 PDF uploaded to knowledge base!");
    } catch (error: any) {
        console.error("❌ Error processing PDF:", error.message);
        process.exit(1);
    }
}

main();
