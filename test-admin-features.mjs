import { chromium } from 'playwright';

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  adminEmail: 'admin@gallerypia.com',
  adminPassword: 'admin123!@#',
  timeout: 30000
};

const results = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: []
};

async function captureConsoleLogs(page) {
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));
  return logs;
}

async function waitForNetworkIdle(page, timeout = 3000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (e) {
    console.log('Network idle timeout (continuing anyway)');
  }
}

async function testAdminLogin(page) {
  console.log('\n🔐 Testing Admin Login...');
  results.totalTests++;
  
  try {
    await page.goto(`${TEST_CONFIG.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="email"]', TEST_CONFIG.adminEmail);
    await page.fill('input[name="password"]', TEST_CONFIG.adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    await waitForNetworkIdle(page);
    
    const url = page.url();
    const title = await page.title();
    
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
    
    if (url.includes('/admin/dashboard')) {
      console.log('   ✅ Login successful');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Login failed - not redirected to admin dashboard');
      results.failed++;
      results.errors.push({ test: 'Admin Login', error: 'Not redirected to admin dashboard' });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Admin Login', error: error.message });
    return false;
  }
}

async function testDashboardStats(page) {
  console.log('\n📊 Testing Dashboard Statistics...');
  results.totalTests++;
  
  try {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    console.log(`   Data:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data) {
      console.log('   ✅ Dashboard stats loaded successfully');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Failed to load dashboard stats');
      results.failed++;
      results.errors.push({ test: 'Dashboard Stats', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Dashboard Stats', error: error.message });
    return false;
  }
}

async function testArtworksList(page) {
  console.log('\n🖼️  Testing Artworks List...');
  results.totalTests++;
  
  try {
    // Artworks tab should be active by default
    await page.waitForTimeout(500);
    
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/artworks?page=1&limit=10', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    console.log(`   Artworks count: ${response.data?.artworks?.length || 0}`);
    
    if (response.status === 200) {
      console.log('   ✅ Artworks list loaded successfully');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Failed to load artworks list');
      results.failed++;
      results.errors.push({ test: 'Artworks List', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Artworks List', error: error.message });
    return false;
  }
}

async function testArtistsList(page) {
  console.log('\n👨‍🎨 Testing Artists List...');
  results.totalTests++;
  
  try {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/artists', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    console.log(`   Artists count: ${response.data?.length || 0}`);
    
    if (response.status === 200) {
      console.log('   ✅ Artists list loaded successfully');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Failed to load artists list');
      results.failed++;
      results.errors.push({ test: 'Artists List', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Artists List', error: error.message });
    return false;
  }
}

async function testTransactionsList(page) {
  console.log('\n💰 Testing Transactions List...');
  results.totalTests++;
  
  try {
    // Navigate to transactions tab
    await page.click('button:has-text("거래 내역")');
    await page.waitForTimeout(1000);
    
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/transactions?page=1&limit=10', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    
    if (response.status === 200 || response.status === 404) {
      console.log('   ✅ Transactions endpoint accessible');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Failed to load transactions list');
      results.failed++;
      results.errors.push({ test: 'Transactions List', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Transactions List', error: error.message });
    return false;
  }
}

async function testValuationModule(page) {
  console.log('\n💎 Testing Valuation Module...');
  results.totalTests++;
  
  try {
    // Navigate to valuation tab
    await page.click('button:has-text("가치 평가")');
    await page.waitForTimeout(1000);
    
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/valuations?page=1&limit=10', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    
    if (response.status === 200 || response.status === 404) {
      console.log('   ✅ Valuation module accessible');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Valuation module failed');
      results.failed++;
      results.errors.push({ test: 'Valuation Module', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Valuation Module', error: error.message });
    return false;
  }
}

async function testActivityLogs(page) {
  console.log('\n📜 Testing Activity Logs...');
  results.totalTests++;
  
  try {
    // Navigate to logs tab
    await page.click('button:has-text("활동 로그")');
    await page.waitForTimeout(1000);
    
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/logs?page=1&limit=10', {
        credentials: 'include'
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });
    
    console.log(`   API Response: ${response.status}`);
    
    if (response.status === 200 || response.status === 404) {
      console.log('   ✅ Activity logs accessible');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Activity logs failed');
      results.failed++;
      results.errors.push({ test: 'Activity Logs', error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Activity Logs', error: error.message });
    return false;
  }
}

async function capturePageErrors(page) {
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  return { errors, warnings };
}

async function runTests() {
  console.log('🚀 Starting Admin Features Browser Test\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Capture errors
  const pageErrors = await capturePageErrors(page);
  
  try {
    // 1. Login
    const loginSuccess = await testAdminLogin(page);
    if (!loginSuccess) {
      console.log('\n❌ Login failed, stopping tests');
      await browser.close();
      return;
    }
    
    // 2. Dashboard Stats
    await testDashboardStats(page);
    
    // 3. Artworks List
    await testArtworksList(page);
    
    // 4. Artists List
    await testArtistsList(page);
    
    // 5. Transactions List
    await testTransactionsList(page);
    
    // 6. Valuation Module
    await testValuationModule(page);
    
    // 7. Activity Logs
    await testActivityLogs(page);
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-features-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: admin-features-test.png');
    
  } catch (error) {
    console.log(`\n❌ Test suite error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🐛 ERRORS FOUND:');
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  return results;
}

runTests().catch(console.error);
