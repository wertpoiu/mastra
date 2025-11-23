import { Mastra } from "@mastra/core/mastra";
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";
import { summaryAgent } from "./agents/summaryAgent";
import { supportAgent } from "./agents/supportAgent";
import { vectorStore } from "./vector-store";
import { storage } from "./memory";

export const mastra = new Mastra({
  agents: { summaryAgent, supportAgent },
  vectors: { cloudflare: vectorStore },
  storage,
  deployer: new CloudflareDeployer({
    projectName: "hello-mastra",
    env: {
      NODE_ENV: "production",
    },
  }),
});