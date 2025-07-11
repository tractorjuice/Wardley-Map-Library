const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        
        // Path to the word analysis report
        const reportPath = path.join(process.cwd(), 'analysis-results', 'word-analysis-report.json');
        
        // Check if report exists
        if (!fs.existsSync(reportPath)) {
            res.status(404).json({ 
                error: 'Word analysis report not found. Please run the analysis first.' 
            });
            return;
        }
        
        // Read the report data
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Add metadata
        const response = {
            ...reportData,
            metadata: {
                generatedAt: fs.statSync(reportPath).mtime,
                version: '1.0.0',
                endpoint: '/api/word-analysis'
            }
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error serving word analysis:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}