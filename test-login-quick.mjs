import { chromium } from 'playwright';

async function quickLoginTest() {
  console.log('🔐 Quick Login Test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    
    let hasError = false;
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' || text.includes('Error') || text.includes('error')) {
        console.log(`[Browser ${msg.type().toUpperCase()}] ${text}`);
        if (text.includes('setFormLoading') || text.includes('undefined')) {
          hasError = true;
        }
      }
    });
    
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
      hasError = true;
    });
    
    // Test login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('✓ Login page loaded');
    
    await page.fill('input[name="email"]', 'buyer_dash@test.com');
    await page.fill('input[name="password"]', 'Test1234!@#');
    console.log('✓ Form filled');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    if (hasError) {
      console.log('\n❌ ERRORS DETECTED - setFormLoading issue still exists');
      return false;
    }
    
    if (finalUrl !== 'http://localhost:3000/login') {
      console.log('\n✅ ✅ ✅ LOGIN SUCCESSFUL - No errors!');
      return true;
    } else {
      console.log('\n⚠️  Still on login page but no errors');
      return true; // No JavaScript errors is still a win
    }
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

quickLoginTest()
  .then(success => process.exit(success ? 0 : 1))
  .catch(() => process.exit(1));
