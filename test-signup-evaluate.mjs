import { chromium } from 'playwright';

async function testSignupEvaluate() {
  console.log('🚀 Starting Signup Test with JavaScript Evaluation...\n');
  
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
    
    // Directly call signup API via JavaScript evaluation
    console.log('🚀 Calling signup API via JavaScript evaluation...\n');
    
    const result = await page.evaluate(async (email) => {
      try {
        // Check if axios is available
        if (typeof axios === 'undefined') {
          return { success: false, error: 'axios not loaded' };
        }
        
        const response = await axios.post('/api/auth/register', {
          email: email,
          password: 'Test1234!@#$',
          full_name: 'Test User',
          role: 'general',
          phone: ''
        });
        
        return { success: true, data: response.data };
      } catch (error) {
        return { 
          success: false, 
          error: error.message,
          responseData: error.response?.data 
        };
      }
    }, testEmail);
    
    console.log('📥 Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data.success) {
      console.log('\n✅ ✅ ✅ SUCCESS via JavaScript Evaluation!');
      console.log('🎉 Signup works when called directly via axios!');
      
      // Now navigate to login to verify
      await page.goto('http://localhost:3000/login');
      console.log('\n📍 Navigated to login page');
      
      return true;
    } else {
      console.log('\n❌ FAILED');
      console.log('Error:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testSignupEvaluate()
  .then(success => {
    if (success) {
      console.log('\n🎯 CONCLUSION: The issue is that form submit event handler is not working.');
      console.log('   The API and axios calls work fine when called directly.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
