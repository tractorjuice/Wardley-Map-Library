export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    res.status(503).json({
        success: false,
        error: 'Wardley map content temporarily unavailable'
    });
}