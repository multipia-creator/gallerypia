import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testLoginWithDebug() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type()}]:`, msg.text());
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[NETWORK REQUEST]:`, request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[NETWORK RESPONSE]:`, response.status(), response.url());
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });
  
  try {
    console.log('\n=== Starting Debug Test ===\n');
    
    // Go to login page
    console.log('1. Loading login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('2. Checking page title:', await page.title());
    
    // Check if JavaScript files loaded
    const scripts = await page.$$eval('script[src]', scripts => 
      scripts.map(s => s.src)
    );
    console.log('3. Loaded scripts:', scripts.filter(s => s.includes('auth') || s.includes('axios')));
    
    // Wait for form elements
    console.log('4. Waiting for form elements...');
    await page.waitForSelector('#email', { state: 'visible' });
    await page.waitForSelector('#password', { state: 'visible' });
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });
    
    // Fill login form
    console.log('5. Filling login form...');
    await page.fill('#email', 'buyer_test@test.com');
    await page.waitForTimeout(500);
    await page.fill('#password', 'Test1234!@#');
    await page.waitForTimeout(500);
    
    // Check if event listener is attached
    const hasEventListener = await page.evaluate(() => {
      const form = document.getElementById('loginForm');
      return form ? 'Form exists, checking listeners...' : 'Form not found!';
    });
    console.log('6. Form status:', hasEventListener);
    
    // Click submit and watch for events
    console.log('7. Clicking submit button...');
    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
    
    // Wait for response or error
    await page.waitForTimeout(5000);
    
    console.log('8. Current URL:', page.url());
    
    // Check for error messages
    const errorVisible = await page.isVisible('#alertMessage:not(.hidden)').catch(() => false);
    if (errorVisible) {
      const errorText = await page.textContent('#alertMessage');
      console.log('9. Error message:', errorText);
    } else {
      console.log('9. No error message visible');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginWithDebug();
