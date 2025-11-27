import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

// Test accounts with full_name - MUST match test-admin-and-dashboards.sh
const TEST_ACCOUNTS = {
  ADMIN: { email: 'admin@gallerypia.com', password: 'Admin1234!@#', full_name: 'Admin User', role: 'admin', dashboard: '/admin/dashboard' },
  BUYER: { email: 'buyer_dash@test.com', password: 'Test1234!@#', full_name: 'Buyer User', role: 'buyer', dashboard: '/dashboard' },
  ARTIST: { email: 'artist_dash@test.com', password: 'Test1234!@#', full_name: 'Artist User', role: 'artist', dashboard: '/dashboard/artist' },
  EXPERT: { email: 'expert_dash@test.com', password: 'Test1234!@#', full_name: 'Expert User', role: 'expert', dashboard: '/dashboard/expert' },
  GENERAL: { email: 'general_dash@test.com', password: 'Test1234!@#', full_name: 'General User', role: 'general', dashboard: '/dashboard' },
  SELLER: { email: 'seller_dash@test.com', password: 'Test1234!@#', full_name: 'Seller User', role: 'seller', dashboard: '/dashboard' },
  CURATOR: { email: 'curator_dash@test.com', password: 'Test1234!@#', full_name: 'Curator User', role: 'curator', dashboard: '/dashboard' },
  MUSEUM: { email: 'museum_dash@test.com', password: 'Test1234!@#', full_name: 'Museum User', role: 'museum', dashboard: '/dashboard' }
};

let browser;
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logTest(name, result, details = '') {
  totalTests++;
  if (result) {
    passedTests++;
    console.log(`✅ [PASS] ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedTests++;
    console.log(`❌ [FAIL] ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

async function testLoginAndDashboard(accountType, accountInfo) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`\n=== Testing ${accountType} Account ===`);
    
    // 1. Go to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await wait(1000); // Wait for JavaScript to initialize
    
    logTest(`${accountType}: Load login page`, true, page.url());
    
    // 2. Wait for form elements to be ready
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    logTest(`${accountType}: Form elements ready`, true);
    
    // 3. Fill login form with delay
    await page.fill('#email', accountInfo.email);
    await wait(300);
    await page.fill('#password', accountInfo.password);
    await wait(300);
    
    logTest(`${accountType}: Fill login form`, true);
    
    // 4. Submit by triggering the handleLoginImproved function directly
    const submitResult = await page.evaluate(async ({ email, password }) => {
      try {
        // Check if handleLoginImproved exists
        if (typeof handleLoginImproved !== 'function') {
          return { error: 'handleLoginImproved not found' };
        }
        
        // Fill fields
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        
        // Create a fake event
        const fakeEvent = new Event('submit', { bubbles: true, cancelable: true });
        fakeEvent.preventDefault = () => {};
        fakeEvent.target = document.getElementById('loginForm');
        
        // Call the handler directly
        await handleLoginImproved(fakeEvent);
        
        // Wait a bit for redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true, url: window.location.href };
      } catch (error) {
        return { error: error.message };
      }
    }, { email: accountInfo.email, password: accountInfo.password });
    
    if (submitResult.error) {
      logTest(`${accountType}: Login submission`, false, `Error: ${submitResult.error}`);
      return { success: false, reason: submitResult.error };
    }
    
    // Wait for navigation
    await wait(2000);
    
    const currentUrl = page.url();
    
    // Check if we're still on login page
    if (currentUrl.includes('/login')) {
      // Check for any visible errors
      const errorVisible = await page.isVisible('#alertMessage:not(.hidden)').catch(() => false);
      if (errorVisible) {
        const errorText = await page.textContent('#alertMessage').catch(() => '');
        logTest(`${accountType}: Login submission`, false, `Error: ${errorText}`);
        return { success: false, reason: 'Login error' };
      }
      
      logTest(`${accountType}: Login submission`, false, `Still on login page. URL: ${currentUrl}`);
      return { success: false, reason: 'No redirect from login' };
    }
    
    logTest(`${accountType}: Login success`, true, `Redirected to: ${currentUrl}`);
    
    // 5. Wait for dashboard to load
    await wait(2000);
    
    // 6. Check if we're on expected dashboard
    const finalUrl = page.url();
    const expectedDashboard = accountInfo.dashboard;
    
    if (finalUrl.includes(expectedDashboard) || (expectedDashboard === '/dashboard' && finalUrl.includes('/dashboard'))) {
      logTest(`${accountType}: Dashboard access`, true, finalUrl);
      
      // 7. Verify dashboard content loaded
      await page.waitForSelector('h1, h2, .dashboard', { timeout: 10000 });
      const pageTitle = await page.title();
      logTest(`${accountType}: Dashboard content loaded`, true, `Title: ${pageTitle}`);
      
      return { success: true, url: finalUrl };
    } else {
      logTest(`${accountType}: Dashboard access`, false, `Expected: ${expectedDashboard}, Got: ${finalUrl}`);
      return { success: false, reason: 'Wrong dashboard', expected: expectedDashboard, actual: finalUrl };
    }
    
  } catch (error) {
    logTest(`${accountType}: Test execution`, false, error.message);
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

async function testUnauthorizedAccess() {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`\n=== Testing Unauthorized Access ===`);
    
    // Try to access artist dashboard without login
    await page.goto(`${BASE_URL}/dashboard/artist`, { waitUntil: 'networkidle' });
    await wait(1000);
    
    const url = page.url();
    
    if (url.includes('/login')) {
      logTest('Unauthorized access blocked', true, 'Redirected to login');
      return { success: true };
    } else {
      logTest('Unauthorized access blocked', false, `Not redirected, URL: ${url}`);
      return { success: false };
    }
    
  } catch (error) {
    logTest('Unauthorized access test', false, error.message);
    return { success: false, error: error.message };
  } finally {
    await context.close();
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Starting Playwright Browser Simulation Tests');
  console.log('='.repeat(60));
  
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Browser launched successfully\n');
    
    // Test all account types
    for (const [accountType, accountInfo] of Object.entries(TEST_ACCOUNTS)) {
      await testLoginAndDashboard(accountType, accountInfo);
      await wait(1000); // Small delay between tests
    }
    
    // Test unauthorized access
    await testUnauthorizedAccess();
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ Browser closed');
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedTests} (${(failedTests / totalTests * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  
  if (failedTests > 0) {
    console.log(`\n❌ ${failedTests} test(s) failed - requires attention`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  }
}

runTests();
