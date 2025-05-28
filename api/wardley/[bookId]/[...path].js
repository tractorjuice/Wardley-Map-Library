export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { bookId, path: wardleyPath } = req.query;
        const fileName = Array.isArray(wardleyPath) ? wardleyPath.join('/') : wardleyPath;
        
        // For now, return a simple error message since we can't access the books directory
        // This will be replaced with a different approach (e.g., serving from GitHub raw URLs)
        res.status(503).json({
            success: false,
            error: 'Wardley map content temporarily unavailable - working on solution',
            bookId: bookId,
            path: fileName
        });
        
    } catch (error) {
        console.error('Error in Wardley API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}