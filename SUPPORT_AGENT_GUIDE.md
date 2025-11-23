# Support AI Agent with PDF Knowledge Base - Implementation Guide

This guide explains how to set up and use the support AI agent with PDF knowledge base capabilities.

## Overview

The support agent uses:
- **Cloudflare Vectorize** for vector storage
- **OpenAI embeddings** (text-embedding-3-small) for document processing
- **RAG (Retrieval-Augmented Generation)** for context-aware responses

## Setup Steps

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-...

# Cloudflare Vectorize Configuration (required)
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token
```

### 2. Get Cloudflare Credentials

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Get your Account ID from the dashboard
3. Create an API Token:
   - Go to "My Profile" > "API Tokens"
   - Create Token with "Vectorize" permissions
   - Copy the token

### 3. Initialize Vector Index (One-time setup)

Create a script to initialize the vector database:

```typescript
// scripts/init-vector-db.ts
import { initializeVectorIndex } from "../src/mastra/utils/pdf-processor";

async function main() {
  await initializeVectorIndex();
  console.log("Vector database initialized!");
}

main().catch(console.error);
```

Run it:
```bash
npx tsx scripts/init-vector-db.ts
```

### 4. Process PDF Documents

Create a script to upload and process PDFs:

```typescript
// scripts/upload-pdf.ts
import { processPDF } from "../src/mastra/utils/pdf-processor";

async function main() {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.error("Usage: npx tsx scripts/upload-pdf.ts <path-to-pdf>");
    process.exit(1);
  }

  await processPDF(pdfPath, {
    uploadedAt: new Date().toISOString(),
    category: "support-docs",
  });
}

main().catch(console.error);
```

Run it:
```bash
npx tsx scripts/upload-pdf.ts ./docs/user-guide.pdf
```

## API Endpoints

### 1. Chat with Support Agent

```bash
curl -X POST http://localhost:4111/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do I reset my password?"
      }
    ]
  }'
```

### 2. Stream Responses

```bash
curl -X POST http://localhost:4111/api/agents/supportAgent/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are your pricing plans?"
      }
    ]
  }'
```

## Embedding a Chat Widget on Your Website

### Simple HTML/JavaScript Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>Support Chat</title>
  <style>
    #chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      border: 1px solid #ccc;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    
    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    
    #chat-input-container {
      padding: 10px;
      border-top: 1px solid #eee;
    }
    
    #chat-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    
    .message {
      margin: 10px 0;
      padding: 10px;
      border-radius: 5px;
    }
    
    .user-message {
      background: #007bff;
      color: white;
      margin-left: 20%;
    }
    
    .agent-message {
      background: #f1f1f1;
      margin-right: 20%;
    }
  </style>
</head>
<body>
  <div id="chat-widget">
    <div id="chat-messages"></div>
    <div id="chat-input-container">
      <input 
        type="text" 
        id="chat-input" 
        placeholder="Ask a question..."
        onkeypress="handleKeyPress(event)"
      />
    </div>
  </div>

  <script>
    const API_URL = 'http://localhost:4111/api/agents/supportAgent/generate';
    const messages = [];

    function addMessage(role, content) {
      const messagesDiv = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}-message`;
      messageDiv.textContent = content;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage(content) {
      addMessage('user', content);
      messages.push({ role: 'user', content });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        });

        const data = await response.json();
        const agentResponse = data.text || 'Sorry, I could not process your request.';
        
        addMessage('agent', agentResponse);
        messages.push({ role: 'assistant', content: agentResponse });
      } catch (error) {
        addMessage('agent', 'Error: Could not connect to support agent.');
        console.error(error);
      }
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
          sendMessage(message);
          input.value = '';
        }
      }
    }
  </script>
</body>
</html>
```

## Advanced Features

### PDF Processing with Metadata

```typescript
await processPDF("./docs/pricing.pdf", {
  category: "pricing",
  version: "2024-01",
  language: "en",
});
```

### Batch Processing Multiple PDFs

```typescript
const pdfs = [
  "./docs/user-guide.pdf",
  "./docs/faq.pdf",
  "./docs/troubleshooting.pdf",
];

for (const pdf of pdfs) {
  await processPDF(pdf);
}
```

## Deployment

When deploying to production:

1. **Update API URL** in the chat widget to your production URL
2. **Set environment variables** on your VPS or cloud platform
3. **Enable CORS** if your website is on a different domain
4. **Add rate limiting** to prevent abuse
5. **Monitor usage** through Cloudflare dashboard

## Troubleshooting

### Vector Index Not Found
Run the initialization script:
```bash
npx tsx scripts/init-vector-db.ts
```

### No Results from Knowledge Base
- Ensure PDFs have been processed
- Check that embeddings were created successfully
- Verify Cloudflare credentials are correct

### Agent Not Using Knowledge Base
- Verify the vector store is registered in `src/mastra/index.ts`
- Check that the `vectorQueryTool` is added to the agent's tools
- Ensure the `VECTORIZE_PROMPT` is in the agent's instructions

## Next Steps

1. Add PDF upload API endpoint
2. Implement conversation history
3. Add user authentication
4. Create admin dashboard for managing knowledge base
5. Add analytics and monitoring
