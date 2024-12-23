const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const app = express();
app.use(express.static('./'));

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
