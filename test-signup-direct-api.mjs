import { chromium } from 'playwright';

async function testSignupDirectAPI() {
  console.log('🚀 Starting Direct API Signup Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
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
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="password"]', 'Test1234!@#$');
    await page.fill('input[name="confirm_password"]', 'Test1234!@#$');
    console.log('✅ Form filled\n');
    
    // Use page.request API to call signup directly (bypassing JavaScript issues)
    console.log('🚀 Calling /api/auth/register directly via Playwright request API...\n');
    
    const response = await page.request.post('http://localhost:3000/api/auth/register', {
      data: {
        email: testEmail,
        password: 'Test1234!@#$',
        full_name: 'Test User',
        role: 'general',
        phone: ''
      }
    });
    
    const status = response.status();
    const body = await response.json();
    
    console.log(`📥 Response Status: ${status}`);
    console.log(`📦 Response Body:`, JSON.stringify(body, null, 2));
    
    if (status === 200 && body.success) {
      console.log('\n✅ ✅ ✅ API SUCCESS!');
      console.log('🎉 Signup API works correctly!');
      console.log('\n📝 This confirms the issue is in the frontend JavaScript, not the API.');
      return true;
    } else {
      console.log('\n❌ API FAILED');
      console.log('Error:', body.error || 'Unknown error');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testSignupDirectAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
