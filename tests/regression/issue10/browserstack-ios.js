const http = require('http');
const { promisify } = require('util');

const USERNAME = process.env.BROWSERSTACK_USERNAME;
const ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const BS_URL = `https://${USERNAME}:${ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`;

const SERVER_PORT = process.env.PORT || 3000;

const CAPABILITIES = {
  platformName: 'ios',
  'bstack:options': {
    platformVersion: '16',
    deviceName: 'iPhone 14',
    realMobile: true,
    local: true,
    localIdentifier: 'random',
    projectName: 'Toast-JS',
    buildName: 'Issue #10 - iOS Safari playsInline',
    sessionName: 'Video icon playsInline test',
    debug: true,
  },
  browserName: 'Safari',
};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hub-cloud.browserstack.com',
      port: 443,
      path: `/wd/hub${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${ACCESS_KEY}`).toString('base64'),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ value: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  if (!USERNAME || !ACCESS_KEY) {
    console.error('Error: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
    process.exit(1);
  }

  console.log('Creating BrowserStack iOS Safari session...');
  const createRes = await request('POST', '/session', {
    desiredCapabilities: CAPABILITIES,
  });
  const sessionId = createRes.value?.sessionId;
  if (!sessionId) {
    console.error('Failed to create session:', JSON.stringify(createRes));
    process.exit(1);
  }
  console.log('Session created:', sessionId);

  async function cmd(method, path, body) {
    return request(method, `/session/${sessionId}${path}`, body);
  }

  const testUrl = `http://localhost:${SERVER_PORT}/test-issue10.html`;
  console.log('Navigating to:', testUrl);
  await cmd('POST', '/url', { url: testUrl });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const resultRes = await cmd('GET', '/execute/sync', {
    script: 'return window.__testResults;',
    args: [],
  });

  await cmd('DELETE', '');

  const result = resultRes?.value;
  if (result && result.passed !== undefined) {
    console.log(`\nResults: ${result.passed} passed, ${result.failed} failed\n`);
    process.exit(result.failed > 0 ? 1 : 0);
  } else {
    console.log('Could not retrieve test results. Response:', JSON.stringify(resultRes));
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
