export default async function handler(req, res) {
    // Simple redirect to main app for any direct access to Wardley map reports
    // Users can then navigate to find the book they're looking for
    
    try {
        const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
        
        // Set redirect headers
        res.setHeader('Location', baseUrl);
        res.status(302).end();
        
    } catch (error) {
        // Fallback redirect
        res.setHeader('Location', '/');
        res.status(302).end();
    }
}