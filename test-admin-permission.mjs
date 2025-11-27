import { chromium } from 'playwright';

async function testAdminPermission() {
  console.log('🔍 Testing Admin Permission Issue...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Track API calls
    const apiCalls = [];
    const alerts = [];
    
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log(`[ALERT] ${message}`);
      alerts.push(message);
      await dialog.accept();
    });
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        const headers = request.headers();
        apiCalls.push({
          type: 'request',
          method: request.method(),
          url: url,
          headers: headers,
          timestamp: Date.now()
        });
        console.log(`📤 API Request: ${request.method()} ${url}`);
        if (headers.authorization) {
          console.log(`   🔑 Authorization: ${headers.authorization.substring(0, 30)}...`);
        } else {
          console.log(`   ⚠️  No Authorization header!`);
        }
      }
    });
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const status = response.status();
        let body = null;
        try {
          body = await response.text();
        } catch (e) {
          body = '[Unable to read]';
        }
        
        apiCalls.push({
          type: 'response',
          status: status,
          url: url,
          body: body,
          timestamp: Date.now()
        });
        
        console.log(`📥 API Response: ${status} ${url}`);
        
        if (status === 403 || status === 401) {
          console.log(`   ⚠️  Auth Error! Body: ${body.substring(0, 200)}`);
        }
      }
    });
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('권한') || text.includes('permission') || text.includes('auth') || text.includes('403') || text.includes('401')) {
        console.log(`[Browser] ${text}`);
      }
    });
    
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...\n');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    await page.fill('input[name="email"]', 'admin@gallerypia.com');
    await page.fill('input[name="password"]', 'Test1234!@#');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const loginUrl = page.url();
    console.log(`After login URL: ${loginUrl}\n`);
    
    // Check if token was stored
    const tokenInfo = await page.evaluate(() => {
      return {
        localStorage_session_token: localStorage.getItem('session_token'),
        localStorage_token: localStorage.getItem('token'),
        sessionStorage_session_token: sessionStorage.getItem('session_token'),
        sessionStorage_token: sessionStorage.getItem('token')
      };
    });
    console.log('📋 Token Storage:', JSON.stringify(tokenInfo, null, 2));
    
    // Step 2: Navigate to admin dashboard
    console.log('\nStep 2: Navigating to admin dashboard...\n');
    const dashboardResponse = await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
    
    const dashboardStatus = dashboardResponse.status();
    const dashboardHeaders = dashboardResponse.headers();
    console.log(`Dashboard Response Status: ${dashboardStatus}`);
    if (dashboardHeaders.location) {
      console.log(`Dashboard Redirect Location: ${dashboardHeaders.location}`);
    }
    
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    const pageTitle = await page.title();
    console.log(`Dashboard URL: ${dashboardUrl}`);
    console.log(`Page Title: ${pageTitle}\n`);
    
    // Check if redirected
    if (dashboardUrl.includes('/login')) {
      console.log('❌ REDIRECTED TO LOGIN - Admin session not working!\n');
    } else if (dashboardUrl.includes('/admin/dashboard')) {
      console.log('✅ Successfully accessed admin dashboard\n');
    } else {
      console.log(`⚠️  Redirected to: ${dashboardUrl}\n`);
      console.log(`   Expected: http://localhost:3000/admin/dashboard`);
      console.log(`   This means the admin dashboard redirected to home page\n`);
    }
    
    // Take screenshot
    await page.screenshot({ path: '/home/user/webapp/admin-dashboard-test.png', fullPage: true });
    console.log('📸 Screenshot saved: admin-dashboard-test.png\n');
    
    // Wait for any delayed alerts
    await page.waitForTimeout(2000);
    
    // Summary
    console.log('=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    
    console.log(`\nAlerts shown: ${alerts.length}`);
    alerts.forEach((alert, i) => {
      console.log(`  ${i + 1}. "${alert}"`);
    });
    
    console.log(`\nAPI calls made: ${apiCalls.filter(c => c.type === 'request').length}`);
    
    const authErrors = apiCalls.filter(c => c.type === 'response' && (c.status === 401 || c.status === 403));
    if (authErrors.length > 0) {
      console.log(`\n❌ Auth Errors Found: ${authErrors.length}`);
      authErrors.forEach(err => {
        console.log(`  - ${err.status} ${err.url}`);
        if (err.body && err.body.length < 500) {
          console.log(`    Body: ${err.body}`);
        }
      });
    }
    
    // Check if permission message appears
    const pageContent = await page.content();
    if (pageContent.includes('관리자 권한이 필요합니다')) {
      console.log('\n❌ FOUND: "관리자 권한이 필요합니다" message on page!');
    } else {
      console.log('\n✅ No permission error message found on page');
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminPermission().catch(console.error);
