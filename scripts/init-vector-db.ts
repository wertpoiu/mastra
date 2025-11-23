#!/usr/bin/env node
import "dotenv/config";
import { initializeVectorIndex } from "../src/mastra/utils/pdf-processor";

async function main() {
    console.log("Initializing vector database...");

    try {
        await initializeVectorIndex();
        console.log("✅ Vector database initialized successfully!");
        console.log("You can now upload PDFs using the upload-pdf script.");
    } catch (error: any) {
        if (error.message?.includes("already exists")) {
            console.log("ℹ️  Vector index already exists. Skipping initialization.");
        } else {
            console.error("❌ Error initializing vector database:", error);
            process.exit(1);
        }
    }
}

main();
