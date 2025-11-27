import { chromium } from 'playwright';

// Dashboard configuration for each role
const DASHBOARD_CONFIGS = [
  {
    role: 'admin',
    email: 'admin@gallerypia.com',
    password: 'Test1234!@#',
    expectedDashboard: '/admin/dashboard',
    expectedTitle: '관리자 대시보드',
    apiEndpoints: [
      '/api/admin/stats',
      '/api/admin/artists',
      '/api/admin/artworks'
    ]
  },
  {
    role: 'artist',
    email: 'artist@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard/artist',
    expectedTitle: '작가 대시보드',
    apiEndpoints: [
      '/api/artworks/my',
      '/api/artist/profile'
    ]
  },
  {
    role: 'expert',
    email: 'expert@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard/expert',
    expectedTitle: '전문가 대시보드',
    apiEndpoints: [
      '/api/expert/evaluations',
      '/api/expert/profile'
    ]
  },
  {
    role: 'museum',
    email: 'museum@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard/museum',
    expectedTitle: '박물관/갤러리 대시보드',
    apiEndpoints: [
      '/api/museum/collections',
      '/api/museum/exhibitions'
    ]
  },
  {
    role: 'gallery',
    email: 'gallery@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard/museum',
    expectedTitle: '박물관/갤러리 대시보드',
    apiEndpoints: [
      '/api/museum/collections',
      '/api/museum/exhibitions'
    ]
  },
  {
    role: 'curator',
    email: 'curator@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard/curator',
    expectedTitle: '큐레이터 대시보드',
    apiEndpoints: [
      '/api/curator/curation-sessions'
    ]
  },
  {
    role: 'buyer',
    email: 'buyer@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard',
    expectedTitle: 'GALLERYPIA',
    apiEndpoints: [
      '/api/artworks/purchased'
    ]
  },
  {
    role: 'seller',
    email: 'seller@test.com',
    password: 'Test1234!@#',
    expectedDashboard: '/dashboard',
    expectedTitle: 'GALLERYPIA',
    apiEndpoints: [
      '/api/artworks/listed'
    ]
  }
];

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  errors: []
};

async function testDashboard(config) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const result = {
    role: config.role,
    email: config.email,
    status: 'pending',
    errors: [],
    warnings: [],
    apiCalls: [],
    loginSuccess: false,
    dashboardAccess: false,
    correctRedirect: false,
    apiErrors: []
  };
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Track console errors
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        result.errors.push(text);
      }
    });
    
    // Track alerts
    page.on('dialog', async dialog => {
      const message = dialog.message();
      result.warnings.push(`Alert: ${message}`);
      await dialog.accept();
    });
    
    // Track API calls
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const status = response.status();
        result.apiCalls.push({
          url: url,
          status: status
        });
        
        if (status >= 400) {
          result.apiErrors.push({
            url: url,
            status: status
          });
        }
      }
    });
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${config.role.toUpperCase()} Dashboard`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Step 1: Navigate to login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    // Step 2: Fill login form
    await page.fill('input[name="email"]', config.email);
    await page.fill('input[name="password"]', config.password);
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    const loginUrl = page.url();
    result.loginSuccess = !loginUrl.includes('/login');
    
    console.log(`  Login: ${result.loginSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`  Current URL: ${loginUrl}`);
    
    if (!result.loginSuccess) {
      result.status = 'failed';
      result.errors.push('Login failed - remained on login page');
      return result;
    }
    
    // Step 3: Check if redirected to correct dashboard
    result.correctRedirect = loginUrl.includes(config.expectedDashboard);
    console.log(`  Redirect: ${result.correctRedirect ? '✅ Correct' : '⚠️  Wrong'}`);
    console.log(`    Expected: ${config.expectedDashboard}`);
    console.log(`    Actual: ${loginUrl}`);
    
    // Step 4: Check page title
    const pageTitle = await page.title();
    const titleMatch = pageTitle.includes(config.expectedTitle.split(' ')[0]);
    console.log(`  Page Title: ${titleMatch ? '✅ Match' : '⚠️  Mismatch'}`);
    console.log(`    Expected: ${config.expectedTitle}`);
    console.log(`    Actual: ${pageTitle}`);
    
    // Step 5: Check if dashboard page exists
    if (!result.correctRedirect) {
      // Try to access expected dashboard directly
      const dashboardResponse = await page.goto(`http://localhost:3000${config.expectedDashboard}`, { 
        waitUntil: 'networkidle',
        timeout: 10000
      }).catch(err => null);
      
      if (dashboardResponse) {
        result.dashboardAccess = dashboardResponse.status() === 200;
        console.log(`  Dashboard Access: ${result.dashboardAccess ? '✅ OK (200)' : `❌ Failed (${dashboardResponse.status()})`}`);
      } else {
        result.dashboardAccess = false;
        result.errors.push(`Dashboard route ${config.expectedDashboard} does not exist or timed out`);
        console.log(`  Dashboard Access: ❌ Route does not exist`);
      }
    } else {
      result.dashboardAccess = true;
    }
    
    // Step 6: Check for token storage
    const tokenInfo = await page.evaluate(() => {
      return {
        localStorage_session_token: localStorage.getItem('session_token'),
        sessionStorage_session_token: sessionStorage.getItem('session_token')
      };
    });
    
    const hasToken = tokenInfo.localStorage_session_token || tokenInfo.sessionStorage_session_token;
    console.log(`  Token Stored: ${hasToken ? '✅ Yes' : '❌ No'}`);
    
    if (!hasToken) {
      result.errors.push('Session token not stored in localStorage or sessionStorage');
    }
    
    // Step 7: Check API calls
    console.log(`  API Calls: ${result.apiCalls.length} total`);
    if (result.apiErrors.length > 0) {
      console.log(`  API Errors: ❌ ${result.apiErrors.length} failed`);
      result.apiErrors.forEach(err => {
        console.log(`    - ${err.status} ${err.url}`);
      });
    } else {
      console.log(`  API Errors: ✅ None`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: `/home/user/webapp/dashboard-${config.role}.png`, 
      fullPage: true 
    });
    console.log(`  Screenshot: dashboard-${config.role}.png`);
    
    // Determine overall status
    if (result.loginSuccess && result.correctRedirect && result.dashboardAccess && hasToken && result.apiErrors.length === 0) {
      result.status = 'passed';
    } else if (result.loginSuccess && result.dashboardAccess) {
      result.status = 'warning';
    } else {
      result.status = 'failed';
    }
    
  } catch (error) {
    result.status = 'error';
    result.errors.push(`Test error: ${error.message}`);
    console.log(`  ❌ ERROR: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  return result;
}

async function runAllTests() {
  console.log('\n🔍 COMPREHENSIVE DASHBOARD TESTING');
  console.log('Testing all user roles and dashboards...\n');
  
  for (const config of DASHBOARD_CONFIGS) {
    const result = await testDashboard(config);
    
    if (result.status === 'passed') {
      testResults.passed.push(result);
    } else if (result.status === 'warning') {
      testResults.failed.push(result);
    } else {
      testResults.failed.push(result);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ PASSED: ${testResults.passed.length}/${DASHBOARD_CONFIGS.length}`);
  testResults.passed.forEach(r => {
    console.log(`  - ${r.role}`);
  });
  
  console.log(`\n❌ FAILED: ${testResults.failed.length}/${DASHBOARD_CONFIGS.length}`);
  testResults.failed.forEach(r => {
    console.log(`  - ${r.role}`);
    r.errors.forEach(err => {
      console.log(`    • ${err}`);
    });
  });
  
  // Detailed error analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔧 ERROR ANALYSIS');
  console.log('='.repeat(60));
  
  const missingRoutes = testResults.failed.filter(r => 
    !r.dashboardAccess && r.errors.some(e => e.includes('does not exist'))
  );
  
  const redirectErrors = testResults.failed.filter(r => 
    !r.correctRedirect && r.loginSuccess
  );
  
  const authErrors = testResults.failed.filter(r => 
    !r.loginSuccess
  );
  
  const apiErrors = testResults.failed.filter(r => 
    r.apiErrors.length > 0
  );
  
  if (missingRoutes.length > 0) {
    console.log(`\n❌ Missing Routes: ${missingRoutes.length}`);
    missingRoutes.forEach(r => {
      console.log(`  - ${r.role}: ${r.email} → Expected route not found`);
    });
  }
  
  if (redirectErrors.length > 0) {
    console.log(`\n⚠️  Redirect Issues: ${redirectErrors.length}`);
    redirectErrors.forEach(r => {
      console.log(`  - ${r.role}: Wrong redirect target`);
    });
  }
  
  if (authErrors.length > 0) {
    console.log(`\n🔐 Authentication Failures: ${authErrors.length}`);
    authErrors.forEach(r => {
      console.log(`  - ${r.role}: ${r.email} - Login failed`);
    });
  }
  
  if (apiErrors.length > 0) {
    console.log(`\n🌐 API Errors: ${apiErrors.length} dashboards with API failures`);
    apiErrors.forEach(r => {
      console.log(`  - ${r.role}: ${r.apiErrors.length} failed API calls`);
    });
  }
  
  // Write results to JSON
  const fs = await import('fs');
  fs.writeFileSync(
    '/home/user/webapp/dashboard-test-results.json',
    JSON.stringify({ testResults, summary: {
      total: DASHBOARD_CONFIGS.length,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      missingRoutes: missingRoutes.map(r => r.role),
      redirectErrors: redirectErrors.map(r => r.role),
      authErrors: authErrors.map(r => r.role),
      apiErrors: apiErrors.map(r => r.role)
    }}, null, 2)
  );
  
  console.log('\n📄 Full results saved to: dashboard-test-results.json\n');
  
  return testResults;
}

runAllTests().catch(console.error);
