import { CloudflareVector } from "@mastra/vectorize";

export const vectorStore = new CloudflareVector({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
});
