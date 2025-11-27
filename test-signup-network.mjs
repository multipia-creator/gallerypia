import { chromium } from 'playwright';

async function testSignupNetwork() {
  console.log('🚀 Starting Signup Network Debug Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Track network requests
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        requests.push({
          method: request.method(),
          url: url,
          postData: request.postData()
        });
        console.log(`📤 REQUEST: ${request.method()} ${url}`);
      }
    });
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.text();
        } catch (e) {
          body = '[Unable to read response body]';
        }
        
        responses.push({
          status: status,
          url: url,
          body: body
        });
        
        console.log(`📥 RESPONSE: ${status} ${url}`);
        if (body && body.length < 500) {
          console.log(`   Body: ${body}`);
        }
      }
    });
    
    // Capture console logs
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || text.includes('error') || text.includes('Error') || text.includes('fail')) {
        console.log(`[Browser ${type.toUpperCase()}] ${text}`);
      }
    });
    
    // Navigate to signup page
    console.log('📄 Loading signup page...\n');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    
    // Wait for form
    await page.waitForSelector('#signupForm', { timeout: 5000 });
    console.log('✅ Signup form loaded\n');
    
    // Fill form
    console.log('📝 Filling form...');
    await page.fill('input[name="email"]', 'testuser_' + Date.now() + '@test.com');
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="password"]', 'Test1234!@#');
    await page.fill('input[name="confirm_password"]', 'Test1234!@#');
    console.log('✅ Form filled\n');
    
    // Submit form
    console.log('🖱️ Submitting form...\n');
    await page.click('button[type="submit"]');
    
    // Wait for network activity
    await page.waitForTimeout(3000);
    
    console.log('\n📊 Network Summary:');
    console.log(`  Total API Requests: ${requests.length}`);
    console.log(`  Total API Responses: ${responses.length}`);
    
    if (requests.length === 0) {
      console.log('\n❌ NO API REQUESTS SENT - This is the problem!');
      console.log('   The form submit event is not triggering the API call.');
    }
    
    // Check final URL
    const finalUrl = page.url();
    console.log(`\n📍 Final URL: ${finalUrl}`);
    
    if (finalUrl === 'http://localhost:3000/login') {
      console.log('✅ SUCCESS: Redirected to login page');
    } else if (finalUrl === 'http://localhost:3000/signup') {
      console.log('❌ FAILED: Still on signup page');
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSignupNetwork().catch(console.error);
