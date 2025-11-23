import { MDocument } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";
import { vectorStore } from "../vector-store";
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

/**
 * Process a PDF file and store its embeddings in Cloudflare Vectorize
 * @param pdfPath - Path to the PDF file
 * @param metadata - Additional metadata to store with the embeddings
 */
export async function processPDF(
    pdfPath: string,
    metadata: Record<string, any> = {}
) {
    try {
        // Read and parse PDF
        const fileUrl = `file://${path.resolve(pdfPath)}`;
        const parser = new PDFParse({ url: fileUrl });
        const result = await parser.getText();
        const pdfContent = result.text;

        // Create document from text
        const doc = MDocument.fromText(pdfContent);

        // Chunk the document
        const chunks = await doc.chunk({
            strategy: "recursive",
            maxSize: 512,
            overlap: 50,
        });

        console.log(`Created ${chunks.length} chunks from ${pdfPath}`);

        // Generate embeddings
        const embeddings = await Promise.all(
            chunks.map(async (chunk) => {
                const result = await openai.embedding("text-embedding-3-small").doEmbed({
                    values: [chunk.text],
                });
                return result.embeddings[0];
            })
        );

        console.log(`Generated ${embeddings.length} embeddings`);

        // Store in Cloudflare Vectorize
        await vectorStore.upsert({
            indexName: "support-docs",
            vectors: embeddings,
            metadata: chunks.map((chunk, index) => ({
                text: chunk.text,
                source: path.basename(pdfPath),
                chunkIndex: index,
                ...metadata,
            })),
        });

        console.log(`Successfully processed and stored ${pdfPath}`);
        return { success: true, chunksProcessed: chunks.length };
    } catch (error) {
        console.error(`Error processing PDF ${pdfPath}:`, error);
        throw error;
    }
}

/**
 * Initialize the vector index (run this once)
 */
export async function initializeVectorIndex() {
    try {
        await vectorStore.createIndex({
            indexName: "support-docs",
            dimension: 1536, // text-embedding-3-small dimension
        });
        console.log("Vector index created successfully");
    } catch (error) {
        console.error("Error creating vector index:", error);
        throw error;
    }
}
