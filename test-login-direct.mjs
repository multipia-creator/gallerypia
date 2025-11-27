import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testDirectLogin() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== Direct Login Test ===\n');
    
    // Go to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for all scripts to load
    
    console.log('1. Page loaded');
    
    // Fill login form by evaluating JavaScript directly
    const result = await page.evaluate(async ({ email, password }) => {
      // Fill form fields
      document.getElementById('email').value = email;
      document.getElementById('password').value = password;
      
      // Check if axios is loaded
      if (typeof axios === 'undefined') {
        return { error: 'axios not loaded' };
      }
      
      // Try to call login API directly
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password,
          remember_me: false
        });
        
        return {
          success: true,
          status: response.status,
          data: response.data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
      }
    }, { email: 'buyer_test@test.com', password: 'Test1234!@#' });
    
    console.log('2. Direct API call result:', JSON.stringify(result, null, 2));
    
    // Wait for redirect if successful
    if (result.success && result.data?.success) {
      await page.waitForTimeout(2000);
      console.log('3. Current URL after login:', page.url());
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testDirectLogin();
