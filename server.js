/**
 * server.js - PivotPoint (PP)
 *
 * Features:
 *   - HTTPS (TLS) so traffic is encrypted.
 *   - Token-based Guacamole credentials, so we never put user/pass in the query string.
 *   - guacamole-lite for RDP, VNC, SSH, Telnet.
 *   - Simple Notepad for persistent notes in JSON.
 */

/**
 * Notes:
 * 1. If you don’t want to run on port 443, change const PORT = 443; to something else (e.g. 3000).
 * 2. If you use a self‐signed cert, your browser will show a warning, but traffic is encrypted.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const { createServer } = require('https');
const guacServer = require('guacamole-lite');
const crypto = require('crypto');

// ----------------------------------------------------------------------------
// 0) Load SSL Certificates for HTTPS
// In production, use real certificates from e.g. Let's Encrypt.
// ----------------------------------------------------------------------------
const SSL_KEY = path.join(__dirname, 'certs', 'server.key');
const SSL_CERT = path.join(__dirname, 'certs', 'server.crt');
const httpsOptions = {
  key: fs.readFileSync(SSL_KEY),
  cert: fs.readFileSync(SSL_CERT)
};

// ----------------------------------------------------------------------------
// 1) Set up Express for static files & JSON-based endpoints
// ----------------------------------------------------------------------------
const app = express();
app.use(express.json());

// Ensure data folder and JSON files exist
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, '[]', 'utf8');
if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, '[]', 'utf8');

function loadJsonFile(fp) {
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}
function saveJsonFile(fp, data) {
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
}

// Serve static assets from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// --- Notepad endpoints ---
app.get('/api/notes', (req, res) => {
  const notes = loadJsonFile(NOTES_FILE);
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const notes = loadJsonFile(NOTES_FILE);
  const newNote = req.body; // { id, title, content }
  const idx = notes.findIndex(n => n.id === newNote.id);
  if (idx >= 0) {
    notes[idx] = newNote;
  } else {
    notes.push(newNote);
  }
  saveJsonFile(NOTES_FILE, notes);
  res.json({ success: true });
});

app.delete('/api/notes/:id', (req, res) => {
  let notes = loadJsonFile(NOTES_FILE);
  notes = notes.filter(n => n.id !== req.params.id);
  saveJsonFile(NOTES_FILE, notes);
  res.json({ success: true });
});

// --- Session endpoints (optional usage) ---
app.get('/api/sessions', (req, res) => {
  const sessions = loadJsonFile(SESSIONS_FILE);
  res.json(sessions);
});
app.post('/api/sessions', (req, res) => {
  const sessions = loadJsonFile(SESSIONS_FILE);
  const s = req.body;
  const idx = sessions.findIndex(x => x.id === s.id);
  if (idx >= 0) sessions[idx] = s;
  else sessions.push(s);
  saveJsonFile(SESSIONS_FILE, sessions);
  res.json({ success: true });
});
app.delete('/api/sessions/:id', (req, res) => {
  let sessions = loadJsonFile(SESSIONS_FILE);
  sessions = sessions.filter(s => s.id !== req.params.id);
  saveJsonFile(SESSIONS_FILE, sessions);
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// 2) Token approach for Guacamole credentials
//
// The client posts JSON to /api/guac-token. We generate a random token,
// store the Guac config in memory, and return { token }. The front-end
// opens wss://.../guac/?token=xxx, which we handle below.
// ----------------------------------------------------------------------------
const tokensMap = {}; // { token: {type, settings} }

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

app.post('/api/guac-token', (req, res) => {
  // Expect body like: { protocol, host, port, username, password, security, resolution }
  const {
    protocol = 'rdp',
    host = 'localhost',
    port = 3389,
    username = '',
    password = '',
    security = '',
    resolution = '1024x768'
  } = req.body;

  const [width, height] = resolution.split('x').map(v => parseInt(v, 10) || 1024);

  // Build guacamole-lite config object
  const guacConfig = {
    type: protocol,
    settings: {}
  };

  switch (protocol) {
    case 'rdp':
      guacConfig.settings = {
        hostname: host,
        port,
        username,
        password,
        security: security || 'nla', 
        width,
        height
      };
      break;
    case 'vnc':
      guacConfig.settings = {
        hostname: host,
        port,
        password,
        width,
        height
      };
      break;
    case 'ssh':
      guacConfig.settings = {
        hostname: host,
        port,
        username,
        password
      };
      break;
    case 'telnet':
      guacConfig.settings = {
        hostname: host,
        port
      };
      break;
    default:
      // fallback
      guacConfig.type = 'rdp';
      guacConfig.settings = {
        hostname: host,
        port,
        username,
        password
      };
      break;
  }

  // Generate a token
  const token = generateToken();
  tokensMap[token] = guacConfig;

  // Optionally remove it after 1 minute
  setTimeout(() => {
    delete tokensMap[token];
  }, 60_000);

  // Return token
  res.json({ token });
});

// ----------------------------------------------------------------------------
// 3) Create HTTPS server and attach guacamole-lite
// ----------------------------------------------------------------------------
const httpsServer = createServer(httpsOptions, app);

guacServer({
  server: httpsServer,
  path: '/guac/',
  configFromQueryString: (query) => {
    const token = query.token;
    if (!token) {
      throw new Error('No token provided');
    }
    const conf = tokensMap[token];
    if (!conf) {
      throw new Error('Invalid or expired token');
    }
    return conf;
  }
});

// ----------------------------------------------------------------------------
// 4) Start
// ----------------------------------------------------------------------------
const PORT = 443; // or choose a different port if you like
httpsServer.listen(PORT, () => {
  console.log('========================================');
  console.log(' PivotPoint (PP) running with HTTPS');
  console.log(` Visit: https://localhost:${PORT}/`);
  console.log(` Guac WebSocket: wss://localhost:${PORT}/guac/`);
  console.log('========================================');
});