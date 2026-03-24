const path = require('path');
const fs = require('fs');

// Try to load .env from root
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
}

const target = process.env["BACKEND_URL"];

if (!target) {
  console.warn('\x1b[33m%s\x1b[0m', 'WARNING: BACKEND_URL is not set in environment. Proxy may not work.');
}

const PROXY_CONFIG = {
  "/api": {
    "target": target,
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;
