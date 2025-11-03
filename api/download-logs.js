import fs from 'fs';

const LOG_FILE = '/tmp/chat_logs.json';

export default async function handler(req, res) {
    // Simple authentication - add a secret query parameter
    // Usage: /api/download-logs?secret=your_secret_here
    const SECRET = process.env.DOWNLOAD_SECRET || 'change-me-in-vercel';

    if (req.query.secret !== SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if log file exists
        if (!fs.existsSync(LOG_FILE)) {
            return res.status(200).json({
                message: 'No logs found yet',
                logs: []
            });
        }

        // Read logs
        const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
        const logs = fileContent.trim() ? JSON.parse(fileContent) : [];

        // Return as downloadable JSON file
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="chat_logs.json"');
        res.status(200).json({
            downloadedAt: new Date().toISOString(),
            totalConversations: logs.length,
            logs: logs
        });

    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).json({ error: 'Failed to read logs' });
    }
}
