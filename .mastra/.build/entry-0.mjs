import { Mastra } from '@mastra/core/mastra';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { createVectorQueryTool } from '@mastra/rag';
import { VECTORIZE_PROMPT, CloudflareVector } from '@mastra/vectorize';

const summaryAgent = new Agent({
  name: "summary-agent",
  instructions: "You are a helpful assistant that summarizes text.",
  model: openai("gpt-4o-mini")
});

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "cloudflare",
  indexName: "support-docs",
  model: openai.embedding("text-embedding-3-small")
});
const supportAgent = new Agent({
  name: "support-agent",
  instructions: `You are a helpful support assistant for a website. 

Your role is to:
- Answer user questions based on the knowledge base from uploaded PDF documents
- Provide clear, concise, and accurate information
- Be friendly and professional
- Use the SearchKnowledgeBase tool to find relevant information before answering
- If you don't find relevant information in the knowledge base, politely say so
- Always cite the source when providing information from the knowledge base

${VECTORIZE_PROMPT}

When a user asks a question:
1. Use the SearchKnowledgeBase tool to find relevant information
2. Synthesize the information into a clear answer
3. Mention the source document if available in metadata
`,
  model: openai("gpt-4o-mini"),
  tools: { vectorQueryTool }
});

const vectorStore = new CloudflareVector({
  accountId: process.env.CF_ACCOUNT_ID,
  apiToken: process.env.CF_API_TOKEN
});

const mastra = new Mastra({
  agents: {
    summaryAgent,
    supportAgent
  },
  vectors: {
    cloudflare: vectorStore
  }
});

export { mastra };
