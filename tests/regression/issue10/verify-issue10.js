const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const TEST_DIR = path.join(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
};

function createServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let filePath;
      if (req.url.startsWith('/dist/')) {
        filePath = path.join(ROOT, req.url);
      } else {
        filePath = path.join(TEST_DIR, req.url);
      }
      const ext = path.extname(filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + req.url);
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
        res.end(data);
      });
    });
    server.listen(0, () => {
      resolve({ server, port: server.address().port });
    });
    server.on('error', reject);
  });
}

async function run() {
  const { server, port } = await createServer();
  console.log('Test server started on port', port);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log('Browser launched\n');

  console.log('Issue #10 - Video icon playsInline on iOS Safari');
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('[ISSUE10]') || text.startsWith('  PASS') || text.startsWith('  FAIL')) {
      console.log(' ', text);
    }
  });
  page.on('pageerror', err => console.log('  [ERROR]', err.message));

  const url = `http://localhost:${port}/test-issue10.html`;
  await page.goto(url, { waitUntil: 'networkidle0' });

  await page.waitForFunction(
    () => window.__testResults && window.__testResults.passed !== undefined,
    { timeout: 30000 }
  );

  const result = await page.evaluate(() => window.__testResults);

  if (result.failed === 0) {
    console.log(`\n  All ${result.passed} tests passed\n`);
  } else {
    console.log(`\n  ${result.failed} test(s) failed\n`);
  }

  await page.close();
  await browser.close();
  server.close();

  console.log('═══════════════════════════════════════════');
  console.log(` Total: ${result.passed} passed, ${result.failed} failed\n`);

  process.exit(result.failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
