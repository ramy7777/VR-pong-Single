const express = require('express');
const https = require('https');
const path = require('path');
const selfsigned = require('selfsigned');

const app = express();
app.use(express.static('./'));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Check if we're running on Render
const isRender = process.env.RENDER === 'true';

if (isRender) {
    // On Render.com - use HTTP
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} else {
    // Local development - use HTTPS
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365 });

    const options = {
        key: pems.private,
        cert: pems.cert
    };

    const PORT = 8443;
    https.createServer(options, app).listen(PORT, () => {
        console.log(`Secure server running at https://localhost:${PORT}`);
        console.log(`Access from Quest: https://[your-local-ip]:${PORT}`);
        console.log('Note: You will need to accept the self-signed certificate warning in your browser');
    });
}
