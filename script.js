class ChatInterface {
    constructor() {
        this.chatHistory = document.querySelector('.chat-history');
        this.textarea = document.querySelector('#chat_bot');
        this.sendButton = document.querySelector('#sendButton');
        this.apiKey = 'API_KEY_HERE';

        this.sendButton.addEventListener('click', () => this.handleSend());
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
    }

    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = text;
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            indicator.appendChild(dot);
        }
        this.chatHistory.appendChild(indicator);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        return indicator;
    }

    removeTypingIndicator() {
        const indicator = this.chatHistory.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async animateResponse(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        this.chatHistory.appendChild(messageDiv);
        
        for (let i = 0; i < text.length; i++) {
            messageDiv.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, 20));
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        }
    }

    async handleSend() {
        const message = this.textarea.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, true);
        this.textarea.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            const data = await response.json();
            this.removeTypingIndicator();

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                await this.animateResponse(aiResponse);
            } else {
                throw new Error('Unexpected API response');
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', false);
        }
    }
}

// Initialize chat interface when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});
