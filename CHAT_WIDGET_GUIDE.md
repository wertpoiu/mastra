# Chat Widget Implementation Guide

## 🎨 What's Included

I've created **two versions** of the chat widget for you:

1. **Standalone HTML** (`public/chat-widget.html`) - Complete page for testing
2. **Embeddable Script** (`public/mastra-chat-widget.js`) - Add to any website

## ✅ Mastra Support

**Yes, Mastra supports this out of the box!** 

Mastra automatically provides these API endpoints:
- `/api/agents/{agentName}/generate` - For chat responses
- `/api/agents/{agentName}/stream` - For streaming responses
- Memory management (conversation history)
- Tool calling (vector search for PDFs)

No additional setup needed - the widget works with your existing Mastra setup!

## 🚀 Quick Start

### Option 1: Test the Standalone Version

1. Open `public/chat-widget.html` in your browser
2. Click the chat button in the bottom-right
3. Start chatting!

### Option 2: Embed on Your Website

Add this single line to your HTML:

```html
<script src="https://your-domain.com/mastra-chat-widget.js"></script>
```

That's it! The widget will automatically appear on your page.

## 🎨 Features

### ✨ Beautiful Design
- Modern gradient UI
- Smooth animations
- Typing indicators
- Mobile responsive
- Customizable colors

### 💬 Smart Functionality
- **Conversation Memory** - Remembers chat history
- **PDF Knowledge Base** - Searches uploaded PDFs
- **Real-time Responses** - Fast AI responses
- **Error Handling** - Graceful error messages
- **Auto-scroll** - Always shows latest messages

### 🎯 User Experience
- Welcome message
- Typing indicators
- Message timestamps
- Smooth animations
- Keyboard shortcuts (Enter to send)

## 📝 Customization

### Basic Customization

```html
<script>
  MastraChat.init({
    apiUrl: 'https://your-api.com/api/agents/supportAgent/generate',
    position: 'bottom-right', // or 'bottom-left'
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    title: 'Support Assistant',
    subtitle: 'We\'re here to help!',
    welcomeMessage: 'Ask me anything!',
  });
</script>
```

### Advanced Customization

Edit `public/mastra-chat-widget.js` to modify:
- Colors and gradients
- Button size and position
- Widget dimensions
- Animation speeds
- Message styling

## 🔧 Integration Examples

### React/Next.js

```jsx
// components/ChatWidget.tsx
import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/mastra-chat-widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}

// In your layout or page:
import ChatWidget from '@/components/ChatWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

### Vue.js

```vue
<template>
  <div id="app">
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = '/mastra-chat-widget.js';
    document.body.appendChild(script);
  }
}
</script>
```

### Plain HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Add chat widget -->
  <script src="/mastra-chat-widget.js"></script>
  
  <!-- Optional: Custom configuration -->
  <script>
    MastraChat.init({
      apiUrl: 'https://your-api.com/api/agents/supportAgent/generate',
      primaryColor: '#ff6b6b',
      title: 'Customer Support',
    });
  </script>
</body>
</html>
```

### WordPress

1. Upload `mastra-chat-widget.js` to your theme folder
2. Add to `functions.php`:

```php
function add_mastra_chat() {
    wp_enqueue_script('mastra-chat', get_template_directory_uri() . '/mastra-chat-widget.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'add_mastra_chat');
```

## 🌐 Deployment

### Serve the Widget File

#### Option 1: Static Hosting
Upload `mastra-chat-widget.js` to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Your own server

#### Option 2: Serve from Mastra
Add to your Mastra project:

```typescript
// src/api/widget.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const widgetScript = readFileSync(
    join(process.cwd(), 'public/mastra-chat-widget.js'),
    'utf-8'
  );
  
  return new Response(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

Then use: `https://your-mastra-domain.com/api/widget`

## 🔒 Security & CORS

### Enable CORS on Your Mastra Server

If your website is on a different domain, you need to enable CORS:

```typescript
// src/mastra/index.ts
export const mastra = new Mastra({
  // ... your config
  cors: {
    origin: ['https://your-website.com'],
    credentials: true,
  },
});
```

Or allow all origins (development only):
```typescript
cors: {
  origin: '*',
}
```

## 📊 Analytics & Monitoring

### Track Conversations

Add analytics to the widget:

```javascript
// In mastra-chat-widget.js, modify sendMessage:
sendMessage: async function(content) {
  // Track message sent
  if (window.gtag) {
    gtag('event', 'chat_message_sent', {
      message_length: content.length,
    });
  }
  
  // ... rest of the code
}
```

### Monitor Performance

```javascript
// Track response time
const startTime = Date.now();
const response = await fetch(this.config.apiUrl, { ... });
const responseTime = Date.now() - startTime;

console.log('Response time:', responseTime, 'ms');
```

## 🎯 Best Practices

1. **Update API URL** - Change from `localhost` to your production URL
2. **Add Error Tracking** - Integrate Sentry or similar
3. **Rate Limiting** - Prevent abuse on your API
4. **Cache Responses** - For common questions
5. **A/B Testing** - Test different welcome messages
6. **Mobile Testing** - Ensure it works on all devices

## 🐛 Troubleshooting

### Widget Not Appearing
- Check browser console for errors
- Verify script is loaded: `console.log(window.MastraChat)`
- Check CORS settings

### No Responses from Agent
- Verify API URL is correct
- Check network tab in browser dev tools
- Ensure Mastra server is running
- Check API key is set in `.env`

### Memory Not Working
- Ensure `memory` object is sent in requests
- Check storage is configured in Mastra
- Verify thread/resource IDs are consistent

## 📱 Mobile Optimization

The widget is fully responsive:
- Full-screen on mobile devices
- Touch-friendly buttons
- Optimized for small screens
- Smooth animations

## 🎨 Theming Examples

### Dark Mode

```javascript
MastraChat.init({
  primaryColor: '#1a202c',
  secondaryColor: '#2d3748',
  // Add custom CSS for dark theme
});
```

### Brand Colors

```javascript
MastraChat.init({
  primaryColor: '#your-brand-color',
  secondaryColor: '#your-secondary-color',
  title: 'Your Company Name',
});
```

## 📈 Next Steps

1. **Test the widget** - Open `public/chat-widget.html`
2. **Customize colors** - Match your brand
3. **Deploy to production** - Upload to your hosting
4. **Add to your website** - Include the script tag
5. **Monitor usage** - Track conversations and improve

## 🎉 You're All Set!

Your chat widget is ready to use! It automatically:
- ✅ Connects to your Mastra agent
- ✅ Remembers conversation history
- ✅ Searches your PDF knowledge base
- ✅ Provides a beautiful user experience

Need help? The widget includes error handling and will show user-friendly messages if something goes wrong.
