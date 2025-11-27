import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://c97f703a.gallerypia.pages.dev';

const results = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: []
};

async function testProductionAdmin() {
  console.log('🚀 Testing Production Admin Features\n');
  console.log(`URL: ${PRODUCTION_URL}\n`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login Test
    console.log('🔐 Testing Admin Login...');
    results.totalTests++;
    
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="email"]', 'admin@gallerypia.com');
    await page.fill('input[name="password"]', 'admin123!@#');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const title = await page.title();
    
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
    
    if (url.includes('/admin/dashboard')) {
      console.log('   ✅ Login successful\n');
      results.passed++;
    } else {
      console.log('   ❌ Login failed\n');
      results.failed++;
      results.errors.push({ test: 'Login', error: 'Not redirected to admin dashboard' });
      await browser.close();
      return;
    }
    
    // 2. Dashboard Stats API
    console.log('📊 Testing Dashboard Stats API...');
    results.totalTests++;
    
    const statsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      return { status: res.status, data: await res.json() };
    });
    
    console.log(`   Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log('   ✅ Dashboard stats OK\n');
      results.passed++;
    } else {
      console.log('   ❌ Dashboard stats failed\n');
      results.failed++;
      results.errors.push({ test: 'Dashboard Stats', error: `Status ${statsResponse.status}` });
    }
    
    // 3. Artworks API
    console.log('🖼️  Testing Artworks API...');
    results.totalTests++;
    
    const artworksResponse = await page.evaluate(async () => {
      const res = await fetch('/api/admin/artworks?page=1&limit=10', { credentials: 'include' });
      return { status: res.status, body: await res.text() };
    });
    
    console.log(`   Status: ${artworksResponse.status}`);
    if (artworksResponse.status === 200) {
      console.log('   ✅ Artworks API OK\n');
      results.passed++;
    } else {
      console.log(`   ❌ Artworks API failed: ${artworksResponse.body.substring(0, 100)}\n`);
      results.failed++;
      results.errors.push({ test: 'Artworks API', error: `Status ${artworksResponse.status}` });
    }
    
    // 4. Artists API
    console.log('👨‍🎨 Testing Artists API...');
    results.totalTests++;
    
    const artistsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/admin/artists', { credentials: 'include' });
      return { status: res.status };
    });
    
    console.log(`   Status: ${artistsResponse.status}`);
    if (artistsResponse.status === 200) {
      console.log('   ✅ Artists API OK\n');
      results.passed++;
    } else {
      console.log('   ❌ Artists API failed\n');
      results.failed++;
      results.errors.push({ test: 'Artists API', error: `Status ${artistsResponse.status}` });
    }
    
    // 5. Transactions API
    console.log('💰 Testing Transactions API...');
    results.totalTests++;
    
    const transactionsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/admin/transactions', { credentials: 'include' });
      return { status: res.status };
    });
    
    console.log(`   Status: ${transactionsResponse.status}`);
    if (transactionsResponse.status === 200) {
      console.log('   ✅ Transactions API OK\n');
      results.passed++;
    } else {
      console.log('   ❌ Transactions API failed\n');
      results.failed++;
      results.errors.push({ test: 'Transactions API', error: `Status ${transactionsResponse.status}` });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'production-admin-test.png', fullPage: true });
    console.log('📸 Screenshot saved: production-admin-test.png\n');
    
  } catch (error) {
    console.log(`\n❌ Test error: ${error.message}\n`);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 PRODUCTION TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🐛 ERRORS:');
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

testProductionAdmin().catch(console.error);
