/**
 * Readability Analysis API Endpoint
 * 
 * Returns comprehensive readability analysis for the entire library:
 * - Overall statistics with 6 readability metrics
 * - Best practices analysis
 * - Common issues identification
 * - Book rankings (all/most/least readable)
 * - Category-based comparisons
 * 
 * Metrics included:
 * - avgFleschScore: Flesch Reading Ease average
 * - avgFleschKincaidGrade: Flesch-Kincaid Grade Level average
 * - avgFogIndex: Gunning Fog Index average
 * - avgSmogIndex: SMOG Index average  
 * - avgAriIndex: Automated Readability Index average
 * - avgCliIndex: Coleman-Liau Index average
 * 
 * Endpoint: GET /api/readability-analysis
 * Response: JSON with complete analysis data
 */

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
        
        // Path to the readability analysis report
        const reportPath = path.join(process.cwd(), 'analysis-results', 'readability-analysis.json');
        
        // Check if report exists
        if (!fs.existsSync(reportPath)) {
            res.status(404).json({ 
                error: 'Readability analysis report not found. Please run the analysis first.' 
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
                endpoint: '/api/readability-analysis'
            }
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error serving readability analysis:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}