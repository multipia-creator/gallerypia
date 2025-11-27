import { chromium } from 'playwright';

async function testSignupFlow() {
  console.log('🚀 Starting Signup Debug Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || text.includes('Signup') || text.includes('form') || text.includes('Error')) {
        console.log(`[Browser ${type.toUpperCase()}] ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
    });
    
    // Navigate to signup page
    console.log('📄 Loading signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    
    // Wait for form to be ready
    await page.waitForSelector('#signupForm', { timeout: 5000 });
    console.log('✅ Signup form found\n');
    
    // Check if form inputs are visible and enabled
    console.log('🔍 Checking form elements...');
    
    const emailInput = await page.$('input[name="email"]');
    const emailVisible = await emailInput.isVisible();
    const emailEnabled = await emailInput.isEnabled();
    console.log(`  Email input - Visible: ${emailVisible}, Enabled: ${emailEnabled}`);
    
    const passwordInput = await page.$('input[name="password"]');
    const passwordVisible = await passwordInput.isVisible();
    const passwordEnabled = await passwordInput.isEnabled();
    console.log(`  Password input - Visible: ${passwordVisible}, Enabled: ${passwordEnabled}`);
    
    const fullNameInput = await page.$('input[name="full_name"]');
    const fullNameVisible = await fullNameInput.isVisible();
    const fullNameEnabled = await fullNameInput.isEnabled();
    console.log(`  Full Name input - Visible: ${fullNameVisible}, Enabled: ${fullNameEnabled}`);
    
    const submitButton = await page.$('button[type="submit"]');
    const submitVisible = await submitButton.isVisible();
    const submitEnabled = await submitButton.isEnabled();
    console.log(`  Submit button - Visible: ${submitVisible}, Enabled: ${submitEnabled}\n`);
    
    // Try to fill the form
    console.log('📝 Filling signup form...');
    
    try {
      await page.fill('input[name="email"]', 'test_signup@test.com');
      console.log('  ✅ Email filled');
    } catch (error) {
      console.log(`  ❌ Email fill error: ${error.message}`);
    }
    
    try {
      await page.fill('input[name="full_name"]', 'Test User');
      console.log('  ✅ Full name filled');
    } catch (error) {
      console.log(`  ❌ Full name fill error: ${error.message}`);
    }
    
    try {
      await page.fill('input[name="password"]', 'Test1234!@#');
      console.log('  ✅ Password filled');
    } catch (error) {
      console.log(`  ❌ Password fill error: ${error.message}`);
    }
    
    try {
      await page.fill('input[name="confirm_password"]', 'Test1234!@#');
      console.log('  ✅ Confirm password filled');
    } catch (error) {
      console.log(`  ❌ Confirm password fill error: ${error.message}`);
    }
    
    // Check if role is selected (general is default checked)
    const roleChecked = await page.$eval('input[name="role"]:checked', el => el.value);
    console.log(`  ✅ Role selected: ${roleChecked}\n`);
    
    // Try to click submit button
    console.log('🖱️ Attempting to submit form...');
    
    try {
      // Check submit button text and attributes
      const buttonText = await submitButton.textContent();
      const buttonClasses = await submitButton.getAttribute('class');
      console.log(`  Button text: "${buttonText.trim()}"`);
      console.log(`  Button classes: ${buttonClasses}`);
      
      // Try clicking
      await submitButton.click();
      console.log('  ✅ Submit button clicked');
      
      // Wait a bit to see what happens
      await page.waitForTimeout(2000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`\n📍 Current URL: ${currentUrl}`);
      
      // Check for any error messages
      const errorElements = await page.$$('.text-red-400, .text-red-500, .error-message');
      if (errorElements.length > 0) {
        console.log('\n⚠️ Error messages found:');
        for (const el of errorElements) {
          const text = await el.textContent();
          if (text.trim()) {
            console.log(`  - ${text.trim()}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Submit error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSignupFlow().catch(console.error);
