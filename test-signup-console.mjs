import { chromium } from 'playwright';

async function testSignupWithFullConsole() {
  console.log('🚀 Starting Full Console Capture Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Capture ALL console logs
    page.on('console', msg => {
      console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}\n${error.stack}`);
    });
    
    // Track requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/auth')) {
        console.log(`\n📤 API REQUEST: ${request.method()} ${url}`);
      }
    });
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth')) {
        console.log(`📥 API RESPONSE: ${response.status()} ${url}`);
      }
    });
    
    // Navigate to signup
    console.log('📄 Loading signup page...\n');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForSelector('#signupForm');
    console.log('\n✅ Signup form loaded\n');
    
    // Fill form
    console.log('📝 Filling form...\n');
    const testEmail = `testuser_${Date.now()}@test.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.focus('input[name="full_name"]'); // Trigger blur
    await page.waitForTimeout(1500);
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="password"]', 'Test1234!@#');
    await page.fill('input[name="confirm_password"]', 'Test1234!@#');
    console.log('✅ Form filled\n');
    
    // Submit
    console.log('🖱️ Clicking submit button...\n');
    await page.click('button[type="submit"]');
    
    // Wait and see what happens
    console.log('\n⏳ Waiting 5 seconds to capture all events...\n');
    await page.waitForTimeout(5000);
    
    console.log(`\n📍 Final URL: ${page.url()}`);
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSignupWithFullConsole().catch(console.error);
