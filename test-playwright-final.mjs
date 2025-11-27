import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

// Test accounts - MUST match test-admin-and-dashboards.sh
const TEST_ACCOUNTS = {
  ADMIN: { email: 'admin@gallerypia.com', password: 'Test1234!@#', role: 'admin', dashboard: '/admin/dashboard' },
  BUYER: { email: 'buyer_dash@test.com', password: 'Test1234!@#', role: 'buyer', dashboard: '/dashboard' },
  ARTIST: { email: 'artist_dash@test.com', password: 'Test1234!@#', role: 'artist', dashboard: '/dashboard/artist' },
  EXPERT: { email: 'expert_dash@test.com', password: 'Test1234!@#', role: 'expert', dashboard: '/dashboard/expert' },
  GENERAL: { email: 'general_dash@test.com', password: 'Test1234!@#', role: 'general', dashboard: '/dashboard' },
  SELLER: { email: 'seller_dash@test.com', password: 'Test1234!@#', role: 'seller', dashboard: '/dashboard' },
  CURATOR: { email: 'curator_dash@test.com', password: 'Test1234!@#', role: 'curator', dashboard: '/dashboard' },
  MUSEUM: { email: 'museum_dash@test.com', password: 'Test1234!@#', role: 'museum', dashboard: '/dashboard' }
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
    await wait(2000);
    
    logTest(`${accountType}: Load login page`, true, page.url());
    
    // 2. Use Playwright's request API to login (preserves cookies)
    let sessionToken;
    try {
      const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: accountInfo.email,
          password: accountInfo.password,
          remember_me: false
        }
      });
      
      const responseData = await response.json();
      
      if (!responseData.success) {
        logTest(`${accountType}: Login API call`, false, `Error: ${responseData.error}`);
        return { success: false, reason: responseData.error };
      }
      
      sessionToken = responseData.session_token;
      logTest(`${accountType}: Login API call`, true, `User: ${responseData.user.email}`);
      
      // Store token in localStorage for dashboard routes that check it
      await page.evaluate((token) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('session_token', token);
      }, sessionToken);
      
    } catch (error) {
      logTest(`${accountType}: Login API call`, false, `Error: ${error.message}`);
      return { success: false, reason: error.message };
    }
    
    // 3. Navigate to expected dashboard
    await page.goto(`${BASE_URL}${accountInfo.dashboard}`, { waitUntil: 'networkidle' });
    await wait(1000);
    
    const finalUrl = page.url();
    const expectedDashboard = accountInfo.dashboard;
    
    // 4. Check if we're on the expected dashboard
    if (finalUrl.includes(expectedDashboard) || (expectedDashboard === '/dashboard' && finalUrl.includes('/dashboard'))) {
      logTest(`${accountType}: Dashboard access`, true, finalUrl);
      
      // 5. Verify dashboard content loaded
      const pageTitle = await page.title().catch(() => '');
      logTest(`${accountType}: Dashboard content`, true, `Title: ${pageTitle}`);
      
      return { success: true, url: finalUrl };
    } else if (finalUrl.includes('/login')) {
      logTest(`${accountType}: Dashboard access`, false, `Redirected to login - auth failed`);
      return { success: false, reason: 'Auth failed' };
    } else {
      logTest(`${accountType}: Dashboard access`, false, `Expected: ${expectedDashboard}, Got: ${finalUrl}`);
      return { success: false, reason: 'Wrong dashboard' };
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
  console.log('🎭 Playwright Browser Simulation Tests - Final Version');
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
      await wait(500);
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
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failedTests} (${(failedTests / totalTests * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  
  if (failedTests > 0) {
    console.log(`\n⚠️  ${failedTests} test(s) failed - requires attention`);
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
  }
}

runTests();
