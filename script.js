// Configuration
const API_ENDPOINT = '/api/chat'; // Serverless function endpoint
const MAX_QUESTIONS = 5;
const LINKEDIN_URL = 'https://www.linkedin.com/in/marti-taru-38358320/'; // LinkedIn profile URL

// State management
let sessionId = generateSessionId();
let questionCount = 0;
let conversationHistory = [];

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const questionsLeftSpan = document.getElementById('questionsLeft');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateQuestionCounter();
});

function setupEventListeners() {
    sendButton.addEventListener('click', handleSend);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });
}

async function handleSend() {
    const message = userInput.value.trim();

    if (!message || questionCount >= MAX_QUESTIONS) {
        return;
    }

    // Disable input
    setInputState(false);

    // Add user message to UI
    addMessage(message, 'user');

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
        // Send to API
        const response = await sendMessageToAPI(message);

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response
        addMessage(response.reply, 'bot');

        // Update conversation history
        conversationHistory.push({
            role: 'user',
            content: message
        });
        conversationHistory.push({
            role: 'assistant',
            content: response.reply
        });

        // Increment question count
        questionCount++;
        updateQuestionCounter();

        // Check if we've reached the limit
        if (questionCount >= MAX_QUESTIONS) {
            handleQuestionLimitReached();
        } else {
            setInputState(true);
        }

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        setInputState(true);
    }
}

async function sendMessageToAPI(message) {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId: sessionId,
            message: message,
            conversationHistory: conversationHistory,
            questionCount: questionCount
        })
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    return await response.json();
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}

function handleQuestionLimitReached() {
    setTimeout(() => {
        const redirectDiv = document.createElement('div');
        redirectDiv.className = 'redirect-message';
        redirectDiv.innerHTML = `
            <p><strong>Thank you for exploring this consultation demo!</strong></p>
            <p>Want to dive deeper into your youth work challenges? Let's connect on LinkedIn for a full consultation.</p>
            <p><a href="${LINKEDIN_URL}" target="_blank">Visit My LinkedIn Profile →</a></p>
        `;
        chatMessages.appendChild(redirectDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function updateQuestionCounter() {
    const remaining = MAX_QUESTIONS - questionCount;
    questionsLeftSpan.textContent = remaining;
}

function setInputState(enabled) {
    userInput.disabled = !enabled;
    sendButton.disabled = !enabled;
    if (enabled) {
        userInput.focus();
    }
}

function generateSessionId() {
    // Generate a simple UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
