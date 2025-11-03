import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOG_FILE = '/tmp/chat_logs.json';

// System prompt that guides the conversation
const SYSTEM_PROMPT = `You are an AI consultation assistant specializing in youth work and youth policy. Your role is to provide valuable insights while naturally gathering information about the user's context.

Key behaviors:
1. For the first 2 questions, provide detailed, thoughtful responses (150-200 words) that demonstrate deep expertise
2. From question 3 onwards, provide shorter, more general responses (50-75 words) to encourage the user to seek a full consultation
3. Naturally weave in questions to understand: organizational background, nature of the problem, deadlines, available resources, and stakeholder dynamics
4. Don't ask these questions directly - incorporate them conversationally within your responses
5. Maintain a professional, consultative tone
6. Show expertise in youth development, youth policy, program design, and organizational strategy
7. Be encouraging and demonstrate value, but keep responses brief after the first 2 questions

Example conversational data gathering:
- Instead of "What is your organizational background?", say "Many youth organizations I work with face similar challenges, especially when navigating stakeholder expectations. What kind of organization are you working with?"
- Instead of "What are your deadlines?", incorporate "Given that these initiatives often have tight timelines, when are you looking to implement this?"`;

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionId, message, conversationHistory, questionCount } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Build messages array for OpenAI
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // Add context about question count to adjust response length
        if (questionCount >= 2) {
            messages[0].content += `\n\nIMPORTANT: This is question ${questionCount + 1}. Keep your response brief (50-75 words) and somewhat general to encourage the user to connect on LinkedIn for deeper consultation.`;
        }

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                temperature: 0.7,
                max_tokens: questionCount < 2 ? 300 : 150
            })
        });

        if (!openaiResponse.ok) {
            const error = await openaiResponse.json();
            console.error('OpenAI API error:', error);
            return res.status(500).json({ error: 'Failed to get response from AI' });
        }

        const data = await openaiResponse.json();
        const reply = data.choices[0].message.content;

        // Log the interaction
        await logInteraction({
            sessionId,
            timestamp: new Date().toISOString(),
            questionNumber: questionCount + 1,
            userMessage: message,
            botResponse: reply
        });

        // Return response
        res.status(200).json({ reply });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function logInteraction(logEntry) {
    try {
        let logs = [];

        // Read existing logs if file exists
        try {
            if (fs.existsSync(LOG_FILE)) {
                const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
                if (fileContent.trim()) {
                    logs = JSON.parse(fileContent);
                }
            }
        } catch (readError) {
            console.log('Could not read existing logs, starting fresh:', readError.message);
        }

        // Append new log entry
        logs.push(logEntry);

        // Write back to file
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

        console.log(`Logged interaction for session ${logEntry.sessionId}, total logs: ${logs.length}`);
    } catch (error) {
        console.error('Error logging interaction:', error);
        // Don't throw - logging failure shouldn't break the chat
    }
}
