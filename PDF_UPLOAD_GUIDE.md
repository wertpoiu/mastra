# PDF Upload Guide

This guide explains how to upload PDFs to your support agent's knowledge base.

## Prerequisites

1. **Cloudflare Vectorize credentials** configured in `.env`:
   ```env
   CF_ACCOUNT_ID=your_account_id
   CF_API_TOKEN=your_api_token
   ```

2. **OpenAI API key** configured in `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```

## Method 1: Command Line Upload (Recommended for Initial Setup)

### Step 1: Initialize the Vector Database (One-time)

```bash
npm run init-db
```

This creates the `support-docs` index in Cloudflare Vectorize.

### Step 2: Upload a PDF

```bash
npm run upload-pdf path/to/your/file.pdf
```

**Example:**
```bash
npm run upload-pdf ./docs/user-guide.pdf
```

### Step 3: Upload Multiple PDFs

Create a simple bash script or run multiple commands:

```bash
npm run upload-pdf ./docs/user-guide.pdf
npm run upload-pdf ./docs/faq.pdf
npm run upload-pdf ./docs/pricing.pdf
```

## Method 2: Programmatic Upload

Create a script to batch upload PDFs:

```typescript
// scripts/batch-upload.ts
import { processPDF } from "../src/mastra/utils/pdf-processor";
import * as fs from "fs";
import * as path from "path";

async function uploadAllPDFs() {
  const docsDir = "./docs";
  const files = fs.readdirSync(docsDir);
  
  for (const file of files) {
    if (file.endsWith(".pdf")) {
      const filePath = path.join(docsDir, file);
      console.log(`Processing: ${file}`);
      
      try {
        await processPDF(filePath, {
          category: "support",
          uploadedAt: new Date().toISOString(),
        });
        console.log(`✅ ${file} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Error uploading ${file}:`, error);
      }
    }
  }
}

uploadAllPDFs();
```

Run it:
```bash
tsx scripts/batch-upload.ts
```

## Method 3: API Endpoint (For Production)

### Create Upload API Endpoint

Create `src/api/upload-pdf.ts`:

```typescript
import { processPDF } from "../mastra/utils/pdf-processor";
import * as fs from "fs";
import * as path from "path";

export async function handlePDFUpload(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No PDF file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save file temporarily
    const tempPath = path.join("/tmp", file.name);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buffer));

    // Process PDF
    const result = await processPDF(tempPath, {
      uploadedAt: new Date().toISOString(),
      filename: file.name,
    });

    // Clean up
    fs.unlinkSync(tempPath);

    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF uploaded successfully",
        chunksProcessed: result.chunksProcessed,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

### Use the API

```bash
curl -X POST http://localhost:4113/api/upload-pdf \
  -F "pdf=@./docs/user-guide.pdf"
```

## Method 4: Web Interface

Create a simple HTML upload form:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Upload PDF to Knowledge Base</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    .upload-container {
      border: 2px dashed #ccc;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
    }
    input[type="file"] {
      margin: 20px 0;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #0056b3;
    }
    .status {
      margin-top: 20px;
      padding: 10px;
      border-radius: 5px;
    }
    .success {
      background: #d4edda;
      color: #155724;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <h1>📄 Upload PDF to Knowledge Base</h1>
  
  <div class="upload-container">
    <h3>Select a PDF file to upload</h3>
    <input type="file" id="pdfFile" accept=".pdf" />
    <br>
    <button onclick="uploadPDF()">Upload PDF</button>
    <div id="status"></div>
  </div>

  <script>
    async function uploadPDF() {
      const fileInput = document.getElementById('pdfFile');
      const statusDiv = document.getElementById('status');
      const file = fileInput.files[0];

      if (!file) {
        statusDiv.className = 'status error';
        statusDiv.textContent = 'Please select a PDF file';
        return;
      }

      statusDiv.className = 'status';
      statusDiv.textContent = 'Uploading...';

      const formData = new FormData();
      formData.append('pdf', file);

      try {
        const response = await fetch('http://localhost:4113/api/upload-pdf', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          statusDiv.className = 'status success';
          statusDiv.textContent = `✅ Success! Processed ${data.chunksProcessed} chunks`;
        } else {
          statusDiv.className = 'status error';
          statusDiv.textContent = `❌ Error: ${data.error}`;
        }
      } catch (error) {
        statusDiv.className = 'status error';
        statusDiv.textContent = `❌ Error: ${error.message}`;
      }
    }
  </script>
</body>
</html>
```

## How It Works

1. **PDF Parsing**: The `pdf-parse` library extracts text from PDFs
2. **Chunking**: Text is split into 512-character chunks with 50-character overlap
3. **Embedding**: Each chunk is converted to a vector using OpenAI's `text-embedding-3-small`
4. **Storage**: Vectors are stored in Cloudflare Vectorize with metadata

## Metadata Stored

Each chunk includes:
- `text`: The actual text content
- `source`: PDF filename
- `chunkIndex`: Position in the document
- `uploadedAt`: Timestamp
- `category`: Document category (customizable)

## Testing

After uploading a PDF, test if it works:

```bash
curl -X POST http://localhost:4113/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What information do you have about [topic from your PDF]?"
      }
    ]
  }'
```

## Troubleshooting

### Error: "Vector index not found"
Run the initialization script:
```bash
npm run init-db
```

### Error: "Cloudflare credentials not found"
Check your `.env` file has:
```env
CF_ACCOUNT_ID=...
CF_API_TOKEN=...
```

### Error: "PDF parsing failed"
Ensure the PDF contains extractable text (not just images). Scanned PDFs may need OCR.

### Large PDFs taking too long
- PDFs are processed sequentially
- Large documents (100+ pages) may take several minutes
- Consider splitting large PDFs into smaller sections

## Best Practices

1. **Organize by Category**: Use metadata to categorize documents
   ```typescript
   await processPDF("./pricing.pdf", { category: "pricing" });
   await processPDF("./support.pdf", { category: "support" });
   ```

2. **Version Control**: Include version numbers
   ```typescript
   await processPDF("./guide.pdf", { version: "2024-01" });
   ```

3. **Regular Updates**: Re-upload PDFs when content changes

4. **Monitor Storage**: Cloudflare Vectorize has storage limits on free tier

## Next Steps

1. Upload your first PDF: `npm run upload-pdf ./your-file.pdf`
2. Test the agent with questions about the PDF content
3. Set up automated uploads via API for your application
4. Create an admin dashboard for managing documents
