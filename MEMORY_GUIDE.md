# Using Memory with Support Agent

The support agent now has conversation memory enabled, allowing it to remember previous messages and maintain context across a conversation.

## How Memory Works

The agent uses:
- **Storage**: LibSQL (local file database `local.db`)
- **Last Messages**: Remembers the last 20 messages in a conversation
- **Thread-based**: Each conversation thread is isolated

## Using Memory in API Calls

To use memory, include `memory` object with `thread` and `resource` identifiers:

### Example: Starting a Conversation

```bash
curl -X POST http://localhost:4113/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "My name is John and I need help with billing"
      }
    ],
    "memory": {
      "thread": "conversation-123",
      "resource": "user-john"
    }
  }'
```

### Example: Continuing the Conversation

```bash
curl -X POST http://localhost:4113/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What was my name again?"
      }
    ],
    "memory": {
      "thread": "conversation-123",
      "resource": "user-john"
    }
  }'
```

The agent will remember "John" from the previous message!

## Memory Identifiers

- **`thread`**: Unique ID for a specific conversation (e.g., `"conversation-123"`, `"chat-session-abc"`)
- **`resource`**: Identifier for the user or entity (e.g., `"user-john"`, `"customer-456"`)

## Updated Chat Widget with Memory

```html
<!DOCTYPE html>
<html>
<head>
  <title>Support Chat with Memory</title>
  <style>
    /* Same styles as before */
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
    const API_URL = 'http://localhost:4113/api/agents/supportAgent/generate';
    
    // Generate unique IDs for this session
    const threadId = 'thread-' + Date.now();
    const resourceId = 'user-' + Math.random().toString(36).substr(2, 9);
    
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
          body: JSON.stringify({ 
            messages,
            memory: {
              thread: threadId,
              resource: resourceId
            }
          })
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

## Key Changes in the Widget

1. **Thread ID**: Generated once per session using timestamp
2. **Resource ID**: Unique identifier for the user
3. **Memory Object**: Included in every API call to maintain conversation context

## Benefits of Memory

✅ **Context Retention**: Agent remembers user's name, preferences, and previous questions
✅ **Natural Conversations**: No need to repeat information
✅ **Better Support**: Agent can reference earlier parts of the conversation
✅ **Personalization**: Each user gets their own conversation history

## Storage Location

By default, conversations are stored in `local.db` in your project root. For production:

1. Use a cloud database (Turso, PostgreSQL, etc.)
2. Set `DATABASE_URL` in your `.env`:
   ```env
   DATABASE_URL=libsql://your-database-url
   DATABASE_AUTH_TOKEN=your-auth-token
   ```

## Testing Memory

1. Start a conversation with a unique thread ID
2. Tell the agent your name
3. Ask a few questions
4. Ask "What's my name?" - the agent will remember!

```bash
# First message
curl -X POST http://localhost:4113/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hi, my name is Alice"}],
    "memory": {"thread": "test-123", "resource": "alice"}
  }'

# Later message
curl -X POST http://localhost:4113/api/agents/supportAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is my name?"}],
    "memory": {"thread": "test-123", "resource": "alice"}
  }'
```

The agent will respond with "Alice"!
