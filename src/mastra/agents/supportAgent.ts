import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";
import { VECTORIZE_PROMPT } from "@mastra/vectorize";
import { Memory } from "@mastra/memory";

// Create vector query tool for retrieving relevant context from PDFs
const vectorQueryTool = createVectorQueryTool({
    vectorStoreName: "cloudflare",
    indexName: "support-docs",
    model: openai.embedding("text-embedding-3-small"),
});

export const supportAgent = new Agent({
    name: "support-agent",
    instructions: `You are a helpful support assistant for a website. 

Your role is to:
- Answer user questions based on the knowledge base from uploaded PDF documents
- Provide clear, concise, and accurate information
- Be friendly and professional
- Use the SearchKnowledgeBase tool to find relevant information before answering
- If you don't find relevant information in the knowledge base, politely say so
- Always cite the source when providing information from the knowledge base
- Remember previous messages in the conversation to provide contextual responses

${VECTORIZE_PROMPT}

When a user asks a question:
1. Use the SearchKnowledgeBase tool to find relevant information
2. Synthesize the information into a clear answer
3. Mention the source document if available in metadata
`,
    model: openai("gpt-4o-mini"),
    tools: { vectorQueryTool },
    memory: new Memory({
        options: {
            lastMessages: 20, // Remember last 20 messages
        },
    }),
});
