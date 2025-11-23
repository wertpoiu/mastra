import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const summaryAgent = new Agent({
    name: "summary-agent",
    instructions: "You are a helpful assistant that summarizes text.",
    model: openai("gpt-4o-mini"),
});
