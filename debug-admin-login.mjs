import { chromium } from 'playwright';

async function debugLogin() {
  console.log('🔍 Debugging Admin Login Process...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Capture all console logs
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[Request] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      console.log(`[Response] ${status} ${response.url()}`);
      
      if (response.url().includes('/api/auth/login')) {
        try {
          const body = await response.text();
          console.log(`[Response Body] ${body}`);
          
          // Check cookies
          const cookies = await context.cookies();
          console.log('[Cookies]', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));
        } catch (e) {
          console.log('[Response] Could not read body');
        }
      }
    }
  });
  
  // Capture page errors
  page.on('pageerror', err => {
    console.log(`[Page Error] ${err.message}`);
  });
  
  try {
    // Go to login page
    console.log('\n1. Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    console.log('\n2. Current URL:', page.url());
    console.log('   Page Title:', await page.title());
    
    // Check if login form exists
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log('\n3. Form elements check:');
    console.log('   Email input:', emailInput ? '✅ Found' : '❌ Not found');
    console.log('   Password input:', passwordInput ? '✅ Found' : '❌ Not found');
    console.log('   Submit button:', submitButton ? '✅ Found' : '❌ Not found');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.log('\n❌ Login form not found. Taking screenshot...');
      await page.screenshot({ path: 'login-page-error.png', fullPage: true });
      await browser.close();
      return;
    }
    
    // Fill login form
    console.log('\n4. Filling login form...');
    await page.fill('input[name="email"]', 'admin@gallerypia.com');
    await page.fill('input[name="password"]', 'admin123!@#');
    
    console.log('\n5. Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    console.log('\n6. After login:');
    console.log('   Current URL:', page.url());
    console.log('   Page Title:', await page.title());
    
    // Check session storage
    const sessionStorage = await page.evaluate(() => {
      return {
        session_token: sessionStorage.getItem('session_token'),
        token: sessionStorage.getItem('token'),
        user: sessionStorage.getItem('user')
      };
    });
    console.log('\n7. Session Storage:', JSON.stringify(sessionStorage, null, 2));
    
    // Check local storage
    const localStorage = await page.evaluate(() => {
      return {
        session_token: localStorage.getItem('session_token'),
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      };
    });
    console.log('\n8. Local Storage:', JSON.stringify(localStorage, null, 2));
    
    // Check cookies
    const cookies = await context.cookies();
    console.log('\n9. Cookies:');
    cookies.forEach(c => {
      console.log(`   ${c.name}: ${c.value.substring(0, 30)}... (domain: ${c.domain})`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    console.log('\n📸 Screenshot saved: after-login.png');
    
    // Wait a bit before closing
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    await page.screenshot({ path: 'login-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugLogin().catch(console.error);
