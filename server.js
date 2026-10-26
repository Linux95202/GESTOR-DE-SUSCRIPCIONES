const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let port = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startServer(p) {
  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${p} ocupado, intentando con ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error('Error en el servidor:', err);
    }
  });

  server.listen(p, () => {
    const os = require('os');
    const nets = os.networkInterfaces();
    let localIp = null;
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
      if (localIp) break;
    }

    const localUrl = `http://localhost:${p}`;
    const mobileUrl = localIp ? `http://${localIp}:${p}` : localUrl;

    console.log(`\n======================================================`);
    console.log(`✨ SubManager Gold Pro - Servidor Activo:`);
    console.log(`💻 PC / Laptop:     ${localUrl}`);
    if (localIp) {
      console.log(`📱 Celular Móvil:   ${mobileUrl} (Mismo Wi-Fi)`);
    }
    console.log(`🔑 PIN Maestro:     1234`);
    console.log(`⚡ Sincronización en Tiempo Real activa con Google Sheets`);
    console.log(`======================================================\n`);

    // Abrir automáticamente el navegador predeterminado en Windows
    const startCmd = process.platform === 'win32' ? `start ${localUrl}` : `open ${localUrl}`;
    exec(startCmd, (err) => {
      if (err) console.log(`Para abrirlo manualmente, ingresa a: ${localUrl}`);
    });
  });
}

startServer(port);
