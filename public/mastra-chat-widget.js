/**
 * Mastra Chat Widget - Embeddable Version
 * 
 * Usage: Add this script to your website:
 * <script src="https://your-domain.com/mastra-chat-widget.js"></script>
 * 
 * Or initialize manually:
 * <script>
 *   MastraChat.init({
 *     apiUrl: 'https://your-api.com/api/agents/supportAgent/generate',
 *     position: 'bottom-right', // or 'bottom-left'
 *     primaryColor: '#667eea',
 *     title: 'Support Assistant',
 *     subtitle: 'We\'re here to help!',
 *   });
 * </script>
 */

(function () {
    'use strict';

    const MastraChat = {
        config: {
            apiUrl: 'http://localhost:4113/api/agents/supportAgent/generate',
            position: 'bottom-right',
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            title: 'Support Assistant',
            subtitle: 'We\'re here to help!',
            welcomeMessage: 'Ask me anything about our services, products, or documentation.',
        },

        init: function (customConfig = {}) {
            this.config = { ...this.config, ...customConfig };
            this.injectStyles();
            this.injectHTML();
            this.attachEventListeners();
            this.state = {
                threadId: 'thread-' + Date.now(),
                resourceId: 'user-' + Math.random().toString(36).substr(2, 9),
                messages: [],
                isTyping: false,
            };
        },

        injectStyles: function () {
            const style = document.createElement('style');
            style.textContent = `
        * { box-sizing: border-box; }
        
        #mastra-chat-button {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          bottom: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 999999;
        }
        
        #mastra-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        #mastra-chat-button svg {
          width: 28px;
          height: 28px;
          fill: white;
        }
        
        #mastra-chat-widget {
          position: fixed;
          ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          bottom: 90px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 999998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #mastra-chat-widget.open {
          display: flex;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        #mastra-chat-header {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        #mastra-chat-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        #mastra-chat-header p {
          font-size: 12px;
          opacity: 0.9;
          margin: 4px 0 0 0;
        }
        
        #mastra-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        #mastra-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        #mastra-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f7f9fc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        #mastra-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        #mastra-messages::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        .mastra-message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .mastra-message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .mastra-message.agent {
          align-self: flex-start;
          background: white;
          color: #2d3748;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .mastra-message.typing {
          align-self: flex-start;
          background: white;
          display: flex;
          gap: 4px;
          padding: 16px;
        }
        
        .mastra-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e0;
          animation: typing 1.4s infinite;
        }
        
        .mastra-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .mastra-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        
        #mastra-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }
        
        #mastra-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        
        #mastra-input:focus {
          border-color: ${this.config.primaryColor};
        }
        
        #mastra-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        
        #mastra-send-btn:hover { transform: scale(1.05); }
        #mastra-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        #mastra-send-btn svg {
          width: 20px;
          height: 20px;
          fill: white;
        }
        
        .mastra-welcome {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }
        
        .mastra-welcome h4 {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .mastra-welcome p {
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        
        @media (max-width: 480px) {
          #mastra-chat-widget {
            width: 100%;
            height: 100%;
            bottom: 0;
            ${this.config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
            border-radius: 0;
          }
        }
      `;
            document.head.appendChild(style);
        },

        injectHTML: function () {
            const container = document.createElement('div');
            container.innerHTML = `
        <button id="mastra-chat-button" aria-label="Open chat">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>
        
        <div id="mastra-chat-widget">
          <div id="mastra-chat-header">
            <div>
              <h3>${this.config.title}</h3>
              <p>${this.config.subtitle}</p>
            </div>
            <button id="mastra-close-btn" aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M15.1 2.3L13.7.9 8 6.6 2.3.9.9 2.3 6.6 8 .9 13.7l1.4 1.4L8 9.4l5.7 5.7 1.4-1.4L9.4 8z"/>
              </svg>
            </button>
          </div>
          
          <div id="mastra-messages">
            <div class="mastra-welcome">
              <h4>👋 Welcome!</h4>
              <p>${this.config.welcomeMessage}</p>
            </div>
          </div>
          
          <div id="mastra-input-container">
            <input type="text" id="mastra-input" placeholder="Type your message..." autocomplete="off" />
            <button id="mastra-send-btn" aria-label="Send message">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;
            document.body.appendChild(container);
        },

        attachEventListeners: function () {
            const chatButton = document.getElementById('mastra-chat-button');
            const chatWidget = document.getElementById('mastra-chat-widget');
            const closeBtn = document.getElementById('mastra-close-btn');
            const input = document.getElementById('mastra-input');
            const sendBtn = document.getElementById('mastra-send-btn');

            chatButton.addEventListener('click', () => {
                chatWidget.classList.add('open');
                input.focus();
            });

            closeBtn.addEventListener('click', () => {
                chatWidget.classList.remove('open');
            });

            sendBtn.addEventListener('click', () => this.sendMessage(input.value));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage(input.value);
            });

            input.addEventListener('focus', () => {
                const welcome = document.querySelector('.mastra-welcome');
                if (welcome && this.state.messages.length === 0) {
                    welcome.style.display = 'none';
                }
            }, { once: true });
        },

        addMessage: function (role, content) {
            const messagesContainer = document.getElementById('mastra-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `mastra-message ${role}`;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },

        showTyping: function () {
            if (this.state.isTyping) return;
            this.state.isTyping = true;
            const messagesContainer = document.getElementById('mastra-messages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'mastra-message typing';
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = `
        <div class="mastra-typing-dot"></div>
        <div class="mastra-typing-dot"></div>
        <div class="mastra-typing-dot"></div>
      `;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },

        hideTyping: function () {
            this.state.isTyping = false;
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
        },

        sendMessage: async function (content) {
            if (!content.trim()) return;

            const input = document.getElementById('mastra-input');
            const sendBtn = document.getElementById('mastra-send-btn');

            this.addMessage('user', content);
            this.state.messages.push({ role: 'user', content });
            input.value = '';
            sendBtn.disabled = true;

            this.showTyping();

            try {
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: this.state.messages,
                        memory: {
                            thread: this.state.threadId,
                            resource: this.state.resourceId,
                        },
                    }),
                });

                this.hideTyping();

                if (!response.ok) throw new Error('Failed to get response');

                const data = await response.json();
                const agentResponse = data.text || 'Sorry, I could not process your request.';

                this.addMessage('agent', agentResponse);
                this.state.messages.push({ role: 'assistant', content: agentResponse });
            } catch (error) {
                this.hideTyping();
                this.addMessage('agent', 'Sorry, something went wrong. Please try again.');
                console.error('Mastra Chat Error:', error);
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        },
    };

    // Auto-initialize if script is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MastraChat.init());
    } else {
        MastraChat.init();
    }

    // Expose to window for manual initialization
    window.MastraChat = MastraChat;
})();
