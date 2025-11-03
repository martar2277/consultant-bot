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
├── script.js           # Frontend logic with session tracking
├── profile.jpg         # Profile image displayed in chat header
├── api/
│   ├── chat.js        # Serverless function for OpenAI proxy and logging
│   └── download-logs.js # Endpoint to download conversation logs
├── package.json        # Dependencies (node-fetch, @vercel/blob)
└── README.md          # This file
```

## Setup & Deployment

### Prerequisites

- GitHub account (for repository hosting)
- Vercel account (free tier works - sign up at https://vercel.com)
- OpenAI API key (get from https://platform.openai.com/api-keys)
- Your profile image (for `profile.jpg`)

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

### Deployment to Vercel (Recommended Method)

**Step 1: Prepare Your Repository**

1. Fork or clone this repository to your GitHub account
2. Update `script.js` with your LinkedIn profile URL (line 4):
   ```javascript
   const LINKEDIN_URL = 'https://www.linkedin.com/in/your-profile/';
   ```
3. Replace `profile.jpg` with your own profile image
4. Commit and push changes to GitHub

**Step 2: Deploy to Vercel**

1. Go to https://vercel.com and sign in with your GitHub account
2. Click "Add New..." → "Project"
3. Select your chatbot repository from the list
4. Click "Import"

**Step 3: Configure Environment Variables**

Before clicking "Deploy", add these environment variables:

- **Name:** `OPENAI_API_KEY`
  **Value:** Your OpenAI API key (from https://platform.openai.com/api-keys)

- **Name:** `DOWNLOAD_SECRET`
  **Value:** A strong password for downloading logs (choose your own, e.g., `MySecurePassword2024!`)

Click "Deploy" and wait ~2 minutes.

**Step 4: Enable Vercel Blob Storage**

After deployment completes:

1. Go to your project dashboard in Vercel
2. Click "Storage" tab
3. Click "Create Database" → Select "Blob"
4. **Database name:** Accept default (e.g., `consultant-bot-blob`)
5. **Region:** Choose closest to your location (e.g., Europe for EU visitors)
6. **Environments:** Check all three (Development, Preview, Production)
7. **Custom Prefix:** Leave as `BLOB`
8. Click "Create"

Vercel will automatically redeploy with the new storage configuration.

**Step 5: Test Your Chatbot**

1. Visit your deployment URL (shown in Vercel dashboard): `https://your-app.vercel.app`
2. Have a conversation with the chatbot
3. Verify logging works by downloading logs (see Conversation Logs section below)

### Alternative: Deploy via Vercel CLI

If you prefer command-line deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add DOWNLOAD_SECRET

# Deploy
vercel --prod
```

Then follow Step 4 above to enable Blob storage via the web dashboard.

### Automatic Deployments

Once connected to GitHub, Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every pull request

No manual redeployment needed!

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

All conversations are automatically logged to **Vercel Blob Storage** for persistent storage across all serverless function instances.

### Log Storage Architecture

Each interaction is stored as an individual JSON file in Blob storage:
- **File path:** `logs/{sessionId}_{timestamp}.json`
- **Storage:** Vercel Blob (free tier: 500MB)
- **Persistence:** Permanent until manually deleted
- **Access:** Only via authenticated download endpoint

### Log Entry Format

Each log file contains:
```json
{
  "sessionId": "uuid-v4-string",
  "timestamp": "2025-11-03T11:00:32.721Z",
  "questionNumber": 2,
  "userMessage": "user's question here",
  "botResponse": "AI's response here"
}
```

### Downloading Conversation Logs

To download all conversation logs, visit:

```
https://your-app.vercel.app/api/download-logs?secret=YOUR_DOWNLOAD_SECRET
```

Replace:
- `your-app.vercel.app` with your actual Vercel deployment URL
- `YOUR_DOWNLOAD_SECRET` with the secret you set in environment variables

**What you get:**
- JSON file with all log entries combined
- Sorted by timestamp (chronological order)
- Total conversation count
- Download timestamp

**Example output:**
```json
{
  "downloadedAt": "2025-11-03T12:00:00.000Z",
  "totalConversations": 15,
  "logs": [
    {
      "sessionId": "abc-123",
      "timestamp": "2025-11-03T11:00:32.721Z",
      "questionNumber": 1,
      "userMessage": "...",
      "botResponse": "..."
    },
    // ... more entries
  ]
}
```

**Recommended frequency:** Download weekly or monthly for analysis.

### Analyzing Logs

Use the downloaded JSON to analyze:
- **Popular topics:** What questions users ask most
- **Session length:** How many questions per sessionId
- **Drop-off points:** Where users stop engaging
- **Response quality:** Which answers lead to more questions
- **Time patterns:** When users visit (from timestamps)

**Security:** The download endpoint is protected by the `DOWNLOAD_SECRET` environment variable to prevent unauthorized access to conversation data.

## How It Works

### User Flow

1. **Visitor arrives** → Page loads with greeting message
2. **Session created** → UUID generated in browser (stored in session)
3. **User asks question** → JavaScript sends to `/api/chat`
4. **Serverless function:**
   - Receives message + conversation history
   - Calls OpenAI GPT-4 API
   - Logs interaction to Vercel Blob storage
   - Returns AI response
5. **Response displayed** → Chat interface updates
6. **Question counter increments** → Tracks progress toward limit
7. **After 5 questions** → LinkedIn redirect message appears

### Response Strategy

The AI adjusts response length based on question count:
- **Questions 1-2:** Detailed, valuable responses (150-200 words) showing expertise
- **Questions 3-5:** Shorter, general responses (50-75 words) encouraging deeper consultation
- **After 5:** Chatbot stops, displays LinkedIn redirect

### Data Gathering

The AI naturally weaves in discovery questions about:
- Organizational background
- Nature of the problem/challenge
- Timeline and deadlines
- Available resources
- Stakeholder dynamics

This mimics a real consultation while gathering context for potential clients.

### Architecture

```
┌─────────────┐
│   Browser   │
│ (HTML/JS)   │ ← User interacts
└──────┬──────┘
       │ POST /api/chat
       ▼
┌─────────────┐
│   Vercel    │
│ Serverless  │ ← Runs api/chat.js
└──────┬──────┘
       │
       ├──→ OpenAI API (GPT-4)
       │
       └──→ Vercel Blob Storage (logs)
```

### Logging Architecture

To avoid race conditions in serverless environment:
- Each interaction = separate blob file
- Filename: `logs/{sessionId}_{timestamp}.json`
- No read-modify-write operations
- Download endpoint combines all files on-demand

This ensures no logs are lost when multiple users chat simultaneously.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Vercel Serverless Functions (Node.js 18+)
- **AI:** OpenAI GPT-4 API
- **Storage:** Vercel Blob (persistent log storage)
- **Hosting:** Vercel (integrated with GitHub)
- **Dependencies:**
  - `node-fetch` v3.3.2 - HTTP requests to OpenAI
  - `@vercel/blob` v0.23.0 - Blob storage SDK

## Customization Ideas

- Add more sophisticated conversation branching
- Integrate analytics (Google Analytics, Plausible)
- Add email capture before question limit
- Create dashboard to view conversation logs
- Implement conversation export feature

## Security & Privacy

### API Key Protection
- OpenAI API key stored in Vercel environment variables (encrypted)
- Never exposed to client-side code
- Only accessible by serverless functions on Vercel's infrastructure

### Download Endpoint Security
- Protected by `DOWNLOAD_SECRET` environment variable
- Returns 401 Unauthorized without correct secret
- Prevents public access to conversation logs

### CORS Configuration
- Set to allow all origins (`*`) for public chatbot access
- Safe because no authentication or sensitive operations in browser

### Privacy
- **No user identification:** Session IDs are random UUIDs (not personally identifiable)
- **No tracking cookies:** Session ID stored in browser memory only
- **No personal data collected:** Only conversation content logged
- **GDPR considerations:** Logs may contain user-provided information - treat accordingly

### Data Storage
- All logs stored in Vercel Blob (EU region if selected during setup)
- Persistent until manually deleted
- Access restricted to project owner via Vercel dashboard

## Troubleshooting

### Chatbot shows 404 error after deployment
- Wait 1-2 minutes for deployment to complete
- Check Vercel dashboard for deployment status
- Ensure all files are committed to GitHub repository

### "No token found" error for Blob storage
- Verify Blob storage is created in Vercel dashboard (Storage tab)
- Check that `BLOB_READ_WRITE_TOKEN` appears in environment variables
- Trigger a redeploy after creating Blob storage

### OpenAI API errors
- Verify `OPENAI_API_KEY` is correctly set in Vercel environment variables
- Check your OpenAI account has available credits
- Review Vercel function logs for detailed error messages

### Logs are missing or incomplete
- Ensure Blob storage is properly configured
- Check Vercel function logs for logging errors
- Verify download secret matches `DOWNLOAD_SECRET` environment variable

### Download endpoint returns "Unauthorized"
- Double-check the secret in URL matches `DOWNLOAD_SECRET` exactly
- Ensure no extra spaces in the environment variable value

### Chatbot not responding
- Check browser console for JavaScript errors
- Verify `/api/chat` endpoint is accessible
- Review Vercel function logs for backend errors

### How to view Vercel function logs
1. Go to your project in Vercel dashboard
2. Click "Deployments" tab
3. Click on latest deployment
4. Click "Functions" tab
5. Select function to view logs

## License

MIT - feel free to use and modify for your own projects.

---

## Credits

Built with Claude Code - AI-powered development assistant by Anthropic.
