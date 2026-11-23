'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT) || 3000;
const STATIC_ROOT = path.join(__dirname, 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
let version = 0;
let lastUpdate = { version, message: 'Welcome! No new announcements yet.', timestamp: Date.now() };
const statistics = { polls: 0, websocketConnections: 0, websocketBroadcasts: 0, updates: 0 };

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
function broadcast(payload) {
  const packet = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(packet);
  }
}
const server = http.createServer((req, res) => {
  const uri = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && uri.pathname === '/api/update') {
    statistics.polls++;
    return json(res, 200, { ...lastUpdate, stats: statistics });
  }
  if (req.method === 'GET' && uri.pathname === '/api/stats') {
    return json(res, 200, { ...statistics, currentVersion: version });
  }
  if (req.method === 'POST' && uri.pathname === '/api/announce') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 4096) req.destroy();
    });
    req.on('end', () => {
      let message;
      try { message = JSON.parse(body).message; } catch { return json(res, 400, { error: 'Invalid JSON' }); }
      if (typeof message !== 'string' || !message.trim() || message.length > 160) return json(res, 400, { error: 'Message must be 1–160 characters' });
      version++;
      lastUpdate = { version, message: message.trim(), timestamp: Date.now() };
      statistics.updates++;
      statistics.websocketBroadcasts++;
      broadcast({ type: 'update', ...lastUpdate });
      return json(res, 200, { ok: true, ...lastUpdate });
    });
    return;
  }
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const requested = uri.pathname === '/' ? '/index.html' : uri.pathname;
  let safePath;
  try { safePath = path.resolve(STATIC_ROOT, '.' + decodeURIComponent(requested)); }
  catch { return json(res, 400, { error: 'Bad request' }); }
  if (!safePath.startsWith(STATIC_ROOT + path.sep)) return json(res, 403, { error: 'Forbidden' });
  fs.readFile(safePath, (err, content) => {
    if (err) return json(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': mime[path.extname(safePath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  });
});
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', socket => {
  statistics.websocketConnections++;
  socket.send(JSON.stringify({ type: 'hello', ...lastUpdate }));
  socket.on('message', data => {
    try {
      const event = JSON.parse(data.toString());
      if (event.type === 'ping') socket.send(JSON.stringify({ type: 'pong', sentAt: event.sentAt }));
    } catch { /* ignore malformed client packet */ }
  });
});
server.listen(PORT, '0.0.0.0', () => console.log(`\nClassroom demo running on port ${PORT}\nLocal address: http://localhost:${PORT}\nPress Ctrl+C to stop.\n`));
