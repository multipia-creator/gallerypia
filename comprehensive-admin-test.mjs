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
  errors: [],
  apiErrors: [],
  jsErrors: []
};

async function captureErrors(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.jsErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    results.jsErrors.push(`Page Error: ${err.message}`);
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      try {
        const body = await response.text();
        results.apiErrors.push({
          url: response.url(),
          status: response.status(),
          body: body.substring(0, 200)
        });
      } catch (e) {
        // Ignore
      }
    }
  });
}

async function testAdminLogin(page) {
  console.log('\n🔐 Testing Admin Login...');
  results.totalTests++;
  
  try {
    await page.goto(`${TEST_CONFIG.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Check form elements
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.log('   ❌ Login form elements missing');
      results.failed++;
      results.errors.push({ test: 'Admin Login', error: 'Form elements not found' });
      return false;
    }
    
    await page.fill('input[name="email"]', TEST_CONFIG.adminEmail);
    await page.fill('input[name="password"]', TEST_CONFIG.adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    
    const url = page.url();
    const title = await page.title();
    
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
    
    if (url.includes('/admin/dashboard')) {
      console.log('   ✅ Login successful');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Login failed - not redirected');
      results.failed++;
      results.errors.push({ test: 'Admin Login', error: 'Not redirected to dashboard' });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Admin Login', error: error.message });
    return false;
  }
}

async function testDashboardLoad(page) {
  console.log('\n📊 Testing Dashboard Load...');
  results.totalTests++;
  
  try {
    // Check if dashboard content is visible
    const statsVisible = await page.isVisible('.text-3xl, .text-2xl, h1, h2').catch(() => false);
    
    if (statsVisible) {
      console.log('   ✅ Dashboard content loaded');
      results.passed++;
      return true;
    } else {
      console.log('   ❌ Dashboard content not visible');
      results.failed++;
      results.errors.push({ test: 'Dashboard Load', error: 'Content not visible' });
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: 'Dashboard Load', error: error.message });
    return false;
  }
}

async function testAllAPIs(page) {
  console.log('\n🌐 Testing All Admin APIs...');
  
  const apis = [
    { name: 'Dashboard Stats', url: '/api/admin/stats' },
    { name: 'Artworks List', url: '/api/admin/artworks?page=1&limit=10' },
    { name: 'Artists List', url: '/api/admin/artists' },
    { name: 'Transactions', url: '/api/admin/transactions' },
    { name: 'Activity Logs', url: '/api/admin/logs?page=1&limit=10' },
    { name: 'Users List', url: '/api/admin/users?page=1&limit=10' },
  ];
  
  for (const api of apis) {
    results.totalTests++;
    console.log(`\n   Testing ${api.name}...`);
    
    try {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(url, { credentials: 'include' });
        return {
          status: res.status,
          ok: res.ok,
          body: await res.text()
        };
      }, api.url);
      
      console.log(`      Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`      ✅ ${api.name} OK`);
        results.passed++;
      } else {
        console.log(`      ❌ ${api.name} failed`);
        console.log(`      Response: ${response.body.substring(0, 100)}`);
        results.failed++;
        results.errors.push({ 
          test: api.name, 
          error: `Status ${response.status}`,
          body: response.body.substring(0, 200)
        });
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
      results.failed++;
      results.errors.push({ test: api.name, error: error.message });
    }
  }
}

async function testTabNavigation(page) {
  console.log('\n📑 Testing Tab Navigation...');
  
  const tabs = [
    { name: '작품 관리', selector: 'button:has-text("작품 관리")' },
    { name: '작가 관리', selector: 'button:has-text("작가 관리")' },
    { name: '가치 평가', selector: 'button:has-text("가치 평가")' },
    { name: '거래 내역', selector: 'button:has-text("거래 내역")' },
    { name: '활동 로그', selector: 'button:has-text("활동 로그")' },
  ];
  
  for (const tab of tabs) {
    results.totalTests++;
    console.log(`\n   Testing ${tab.name} tab...`);
    
    try {
      const button = await page.$(tab.selector);
      
      if (button) {
        await page.click(tab.selector);
        await page.waitForTimeout(500);
        console.log(`      ✅ ${tab.name} tab clicked`);
        results.passed++;
      } else {
        console.log(`      ❌ ${tab.name} tab button not found`);
        results.failed++;
        results.errors.push({ test: `${tab.name} Tab`, error: 'Button not found' });
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
      results.failed++;
      results.errors.push({ test: `${tab.name} Tab`, error: error.message });
    }
  }
}

async function checkJavaScriptErrors(page) {
  console.log('\n🐛 Checking JavaScript Errors...');
  
  if (results.jsErrors.length > 0) {
    console.log(`   ⚠️  Found ${results.jsErrors.length} JavaScript errors`);
    
    // Show unique errors only
    const uniqueErrors = [...new Set(results.jsErrors)];
    uniqueErrors.slice(0, 5).forEach((err, idx) => {
      console.log(`      ${idx + 1}. ${err.substring(0, 100)}`);
    });
    
    if (uniqueErrors.length > 5) {
      console.log(`      ... and ${uniqueErrors.length - 5} more errors`);
    }
  } else {
    console.log('   ✅ No JavaScript errors found');
  }
}

async function checkAPIErrors() {
  console.log('\n🌐 Checking API Errors...');
  
  if (results.apiErrors.length > 0) {
    console.log(`   ⚠️  Found ${results.apiErrors.length} API errors`);
    
    // Group by status code
    const errorsByStatus = {};
    results.apiErrors.forEach(err => {
      if (!errorsByStatus[err.status]) {
        errorsByStatus[err.status] = [];
      }
      errorsByStatus[err.status].push(err);
    });
    
    Object.keys(errorsByStatus).forEach(status => {
      const errors = errorsByStatus[status];
      console.log(`\n      ${status} Errors (${errors.length}):`);
      errors.slice(0, 3).forEach((err, idx) => {
        console.log(`         ${idx + 1}. ${err.url}`);
        console.log(`            ${err.body.substring(0, 80)}`);
      });
    });
  } else {
    console.log('   ✅ No API errors found');
  }
}

async function generateFixRecommendations() {
  console.log('\n🔧 Fix Recommendations:');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const recommendations = [];
  
  // Analyze errors and generate recommendations
  results.errors.forEach(err => {
    if (err.error.includes('500') || err.body?.includes('500')) {
      recommendations.push({
        priority: 'HIGH',
        issue: err.test,
        recommendation: 'Fix server-side error in API endpoint',
        file: 'src/index.tsx',
        action: 'Add error logging and fix database query'
      });
    }
    
    if (err.error.includes('401') || err.error.includes('Unauthorized')) {
      recommendations.push({
        priority: 'HIGH',
        issue: err.test,
        recommendation: 'Fix authentication/authorization',
        file: 'src/index.tsx',
        action: 'Check middleware and session validation'
      });
    }
    
    if (err.error.includes('404') || err.error.includes('Not Found')) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: err.test,
        recommendation: 'Create missing API endpoint',
        file: 'src/index.tsx',
        action: 'Implement the API route'
      });
    }
    
    if (err.error.includes('Button not found') || err.error.includes('not found')) {
      recommendations.push({
        priority: 'LOW',
        issue: err.test,
        recommendation: 'Fix UI element selector or create missing element',
        file: 'src/index.tsx (Dashboard HTML)',
        action: 'Add missing button or update selector'
      });
    }
  });
  
  // Remove duplicates
  const uniqueRecs = recommendations.filter((rec, index, self) =>
    index === self.findIndex((r) => r.issue === rec.issue && r.recommendation === rec.recommendation)
  );
  
  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  uniqueRecs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  if (uniqueRecs.length === 0) {
    console.log('   ✅ No fixes needed - all tests passed!');
  } else {
    uniqueRecs.forEach((rec, idx) => {
      console.log(`${idx + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`   Issue: ${rec.recommendation}`);
      console.log(`   File: ${rec.file}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  }
  
  return uniqueRecs;
}

async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Admin Dashboard Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Capture all errors
  await captureErrors(page);
  
  try {
    // 1. Login Test
    const loginSuccess = await testAdminLogin(page);
    if (!loginSuccess) {
      console.log('\n❌ Login failed, stopping tests');
      await browser.close();
      return;
    }
    
    // 2. Dashboard Load Test
    await testDashboardLoad(page);
    
    // 3. Test All APIs
    await testAllAPIs(page);
    
    // 4. Test Tab Navigation
    await testTabNavigation(page);
    
    // 5. Check JavaScript Errors
    await checkJavaScriptErrors(page);
    
    // 6. Check API Errors
    await checkAPIErrors();
    
    // Take screenshot
    await page.screenshot({ path: 'comprehensive-admin-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: comprehensive-admin-test.png');
    
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
  
  // Generate and display fix recommendations
  const recommendations = await generateFixRecommendations();
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  return { results, recommendations };
}

runComprehensiveTest().catch(console.error);
