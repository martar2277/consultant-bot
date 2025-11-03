# LinkedIn Chatbot - AI Consultation Demo

An AI-powered chatbot demonstrating consultation capabilities in youth work and youth policy. Built as a marketing tool to showcase AI implementation skills and consultation expertise.

## Features

- OpenAI GPT-4 powered responses
- Session-based conversation tracking
- Question limit (5 questions) with LinkedIn redirect
- Responsive design (mobile, tablet, desktop)
- Conversation logging for analysis
- Clean, professional UI

## Project Structure

```
├── index.html          # Main chat interface
├── styles.css          # Responsive styling
├── script.js           # Frontend logic
├── api/
│   └── chat.js        # Serverless function for OpenAI proxy
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── README.md          # This file
```

## Setup & Deployment

### Prerequisites

- Node.js 18+
- Vercel account (free tier works)
- OpenAI API key

### Local Development

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run locally:
```bash
npm run dev
```

### Deploy to Vercel

1. Login to Vercel:
```bash
vercel login
```

2. Set up environment variable:
```bash
vercel env add OPENAI_API_KEY
```
(Paste your OpenAI API key when prompted)

3. Deploy:
```bash
vercel --prod
```

### Using with GitHub Pages

While the frontend can be hosted on GitHub Pages, the API function requires Vercel (or similar serverless platform) because GitHub Pages only serves static files.

**Deployment strategy:**
- Host frontend (HTML/CSS/JS) on GitHub Pages
- Host API function on Vercel
- Update `API_ENDPOINT` in `script.js` to point to your Vercel API URL

Alternatively, deploy everything to Vercel for simplicity.

## Configuration

### Update LinkedIn Profile URL

Edit `script.js`:
```javascript
const LINKEDIN_URL = 'https://www.linkedin.com/in/yourprofile';
```

### Add Profile Image

Replace or add `profile.jpg` in the root directory with your profile photo.

### Adjust Question Limit

Edit `script.js`:
```javascript
const MAX_QUESTIONS = 5; // Change to desired number
```

### Customize System Prompt

Edit `api/chat.js` to modify the AI's behavior and expertise focus.

## Conversation Logs

Conversations are logged to `/tmp/chat_logs.json` on Vercel's serverless infrastructure. Each entry includes:
- Session ID (UUID)
- Timestamp
- Question number
- User message
- Bot response

**Note:** Vercel's `/tmp` directory is ephemeral. For persistent logging, integrate a database (Vercel KV, MongoDB, etc.).

## How It Works

1. **Session Management:** Each visitor gets a unique UUID on page load
2. **Question Tracking:** Frontend counts questions and enforces 5-question limit
3. **Response Strategy:**
   - Questions 1-2: Detailed responses (150-200 words)
   - Questions 3-5: Brief responses (50-75 words)
   - After 5: Redirect to LinkedIn
4. **Data Gathering:** AI naturally asks about organizational context, resources, timelines
5. **Logging:** All interactions stored for later analysis

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Vercel Serverless Functions (Node.js)
- **AI:** OpenAI GPT-4 API
- **Hosting:** Vercel (or GitHub Pages + Vercel)

## Customization Ideas

- Add more sophisticated conversation branching
- Integrate analytics (Google Analytics, Plausible)
- Add email capture before question limit
- Create dashboard to view conversation logs
- Implement conversation export feature

## Security Notes

- API key stored securely in Vercel environment variables
- CORS configured for public access
- No sensitive user data collected
- Session IDs are random UUIDs (not personally identifiable)

## License

MIT - feel free to use and modify for your own projects.
