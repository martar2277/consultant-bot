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
        const fileExists = fs.existsSync(LOG_FILE);
        console.log(`Log file exists: ${fileExists}, path: ${LOG_FILE}`);

        if (!fileExists) {
            // List what's in /tmp to debug
            try {
                const tmpFiles = fs.readdirSync('/tmp');
                console.log('Files in /tmp:', tmpFiles);
            } catch (e) {
                console.log('Could not list /tmp:', e.message);
            }

            return res.status(200).json({
                message: 'No logs found yet - file does not exist. This is normal if no conversations have happened yet, or if this serverless instance has not processed any chats.',
                logs: [],
                debug: {
                    logFilePath: LOG_FILE,
                    tmpAccessible: true
                }
            });
        }

        // Read logs
        const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
        const logs = fileContent.trim() ? JSON.parse(fileContent) : [];

        console.log(`Successfully read ${logs.length} log entries`);

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
        res.status(500).json({
            error: 'Failed to read logs',
            details: error.message
        });
    }
}
