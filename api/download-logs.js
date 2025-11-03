import { list } from '@vercel/blob';
import fetch from 'node-fetch';

const BLOB_STORAGE_URL = 'chat_logs.json';

export default async function handler(req, res) {
    // Simple authentication - add a secret query parameter
    // Usage: /api/download-logs?secret=your_secret_here
    const SECRET = process.env.DOWNLOAD_SECRET || 'change-me-in-vercel';

    if (req.query.secret !== SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // List all blobs in the logs/ directory
        const { blobs } = await list({ prefix: 'logs/' });

        if (blobs.length === 0) {
            console.log('No log blobs found yet');
            return res.status(200).json({
                message: 'No logs found yet. This is normal if no conversations have happened since Blob storage was enabled.',
                logs: [],
                downloadedAt: new Date().toISOString(),
                totalConversations: 0
            });
        }

        console.log(`Found ${blobs.length} log files`);

        // Fetch and combine all log entries
        const logs = [];
        for (const blob of blobs) {
            try {
                const response = await fetch(blob.url);
                if (response.ok) {
                    const logEntry = await response.json();
                    logs.push(logEntry);
                }
            } catch (err) {
                console.error(`Failed to fetch log ${blob.pathname}:`, err.message);
            }
        }

        // Sort by timestamp
        logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        console.log(`Successfully read ${logs.length} log entries from Blob storage`);

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
