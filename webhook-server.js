const http = require('http');
const { exec } = require('child_process');

const PORT = 9000;
const PROJECT_PATH = '/home/kabstore/Kabstore-mis-backend';

// Execute deployment commands
function deploy() {
  console.log('🚀 Starting deployment...');

  const commands = `
    cd ${PROJECT_PATH} &&
    git pull origin main &&
    npm ci --production=false &&
    npm run build &&
    pm2 reload kabstore-api || pm2 start dist/main.js -i 2 --name kabstore-api --max-memory-restart 1G &&
    pm2 save
  `;

  exec(commands, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deployment failed:', error);
      console.error(stderr);
      return;
    }
    console.log('✅ Deployment successful!');
    console.log(stdout);
  });
}

// HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const payload = JSON.parse(body);

      // Check if push event to main branch
      if (payload.ref === 'refs/heads/main') {
        console.log(`📦 Received push to main branch from ${payload.pusher.name}`);
        deploy();
        res.writeHead(200);
        res.end('Deployment triggered');
      } else {
        console.log(`ℹ️  Ignoring push to ${payload.ref}`);
        res.writeHead(200);
        res.end('Ignored - not main branch');
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🎣 Webhook server listening on port ${PORT}`);
  console.log(`📍 Endpoint: http://46.202.175.32:${PORT}/webhook`);
});
