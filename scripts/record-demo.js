const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const demoPathArg = args[0];

if (!demoPathArg) {
  console.error('Usage: node record-demo.js <demo-path>');
  console.error('Example: node record-demo.js demos/v2.1.0-beta/index.html');
  process.exit(1);
}

// Extract version from path (e.g., "demos/v2.1.0-beta/index.html" -> "v2.1.0-beta")
const versionMatch = demoPathArg.match(/demos\/(v[\d.]+(-[\w]+)?)\//);
const version = versionMatch ? versionMatch[1] : 'unknown';

async function recordDemo(demoPath, versionNumber) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Output paths with version number
  const assetsDir = path.join(__dirname, '..', 'assets');
  const screenshotsDir = path.join(assetsDir, 'screenshots');
  const gifOutputPath = path.join(assetsDir, `toast-demo-${versionNumber}.gif`);
  
  // Ensure directories exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Clean up old screenshots
  const oldScreenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
  for (const file of oldScreenshots) {
    fs.unlinkSync(path.join(screenshotsDir, file));
  }
  
  console.log(`Starting recording for version: ${versionNumber}`);
  
  // Load the demo page
  const absoluteDemoPath = path.resolve(__dirname, '..', demoPath);
  const fileUrl = `file://${absoluteDemoPath}`;
  
  console.log(`Loading page: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  
  // Wait for page to fully load
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Capturing frames...');
  
  let frameCount = 0;
  
  // Function to capture frame
  const captureFrame = async () => {
    const screenshotPath = path.join(screenshotsDir, `frame-${String(frameCount).padStart(5, '0')}.png`);
    await page.screenshot({ path: screenshotPath });
    frameCount++;
  };
  
  // Capture initial frame
  await captureFrame();
  
  // List of toast buttons to click
  const toastButtons = [
    'Welcome Toast',
    'Custom Toast',
    'Success Toast',
    'Warning Toast',
    'Error Toast',
    'Info Toast',
    'Neon Toast',
    'Gradient Toast',
    'Dark Mode Toast',
    'Light Mode Toast'
  ];
  
  // Click each button with delays and capture frames
  for (const buttonText of toastButtons) {
    try {
      console.log(`Clicking: ${buttonText}`);
      
      // Find and click the button
      await page.evaluate((text) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const button = buttons.find(b => b.textContent.trim() === text);
        if (button) {
          button.click();
        }
      }, buttonText);
      
      // Capture frames during toast animation
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 250));
        await captureFrame();
      }
    } catch (error) {
      console.error(`Error clicking ${buttonText}:`, error.message);
    }
  }
  
  // Capture final frames
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 250));
    await captureFrame();
  }
  
  console.log(`Captured ${frameCount} frames`);
  
  await browser.close();
  
  // Convert frames to GIF using ffmpeg
  console.log('\nConverting frames to GIF...');
  
  const ffmpegCmd = [
    'ffmpeg',
    '-y',
    '-framerate 10',
    `-i ${path.join(screenshotsDir, 'frame-%05d.png')}`,
    '-vf "fps=10,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"',
    '-loop 0',
    gifOutputPath
  ].join(' ');
  
  try {
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log(`\nGIF created successfully: ${gifOutputPath}`);
  } catch (error) {
    console.error('Error creating GIF:', error.message);
    throw error;
  }
  
  // Clean up screenshots
  console.log('\nCleaning up temporary files...');
  const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
  for (const file of screenshots) {
    fs.unlinkSync(path.join(screenshotsDir, file));
  }
  fs.rmdirSync(screenshotsDir);
  
  console.log('Cleanup complete!');
  
  return gifOutputPath;
}

// Run the recording
recordDemo(demoPathArg, version)
  .then(outputPath => {
    console.log(`\n========================================`);
    console.log(`Recording completed successfully!`);
    console.log(`Version: ${version}`);
    console.log(`Output: ${outputPath}`);
    console.log(`========================================`);
  })
  .catch(error => {
    console.error('Recording failed:', error);
    process.exit(1);
  });