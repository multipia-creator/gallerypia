import { chromium } from 'playwright';

async function testSignupComplete() {
  console.log('🚀 Starting Complete Signup Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Track API requests
    const requests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        console.log(`📤 API REQUEST: ${request.method()} ${url}`);
        requests.push(url);
      }
    });
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        console.log(`📥 API RESPONSE: ${response.status()} ${url}`);
      }
    });
    
    // Capture ALL console logs to debug
    page.on('console', msg => {
      const text = msg.text();
      console.log(`[Browser] ${text}`);
    });
    
    // Navigate to signup page
    console.log('📄 Loading signup page...\n');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForSelector('#signupForm');
    console.log('✅ Signup form loaded\n');
    
    // Generate unique email
    const testEmail = `testuser_${Date.now()}@test.com`;
    console.log(`📧 Using test email: ${testEmail}\n`);
    
    // Fill form
    console.log('📝 Filling form...');
    await page.fill('input[name="email"]', testEmail);
    
    // Wait for auto-check to complete
    console.log('⏳ Waiting for auto email check (blur event)...');
    await page.focus('input[name="full_name"]'); // Trigger blur on email
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="password"]', 'Test1234!@#');
    await page.fill('input[name="confirm_password"]', 'Test1234!@#');
    console.log('✅ Form filled\n');
    
    // Submit form
    console.log('🖱️ Submitting form...\n');
    await page.click('button[type="submit"]');
    
    // Wait for API calls and navigation
    await page.waitForTimeout(5000);
    
    const finalUrl = page.url();
    console.log(`\n📍 Final URL: ${finalUrl}`);
    console.log(`📊 Total API requests: ${requests.length}`);
    
    if (finalUrl === 'http://localhost:3000/login') {
      console.log('\n✅ ✅ ✅ SUCCESS! Redirected to login page!');
      console.log('🎉 Signup completed successfully!');
      return true;
    } else if (finalUrl === 'http://localhost:3000/signup') {
      console.log('\n❌ FAILED: Still on signup page');
      
      // Check for error messages
      const errors = await page.$$eval('[class*="text-red"], [class*="error"]', 
        els => els.map(el => el.textContent.trim()).filter(t => t.length > 0 && t.length < 100)
      );
      
      if (errors.length > 0) {
        console.log('\n⚠️ Error messages:');
        errors.forEach(err => console.log(`  - ${err}`));
      }
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testSignupComplete()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
