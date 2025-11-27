import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://cd1c93d3.gallerypia.pages.dev';

const results = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: []
};

async function testProductionComprehensive() {
  console.log('🚀 Comprehensive Production Admin Test\n');
  console.log(`URL: ${PRODUCTION_URL}\n`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login
    console.log('🔐 Testing Login...');
    results.totalTests++;
    
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="email"]', 'admin@gallerypia.com');
    await page.fill('input[name="password"]', 'admin123!@#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const url = page.url();
    if (url.includes('/admin/dashboard')) {
      console.log('   ✅ Login successful\n');
      results.passed++;
    } else {
      console.log('   ❌ Login failed\n');
      results.failed++;
      results.errors.push({ test: 'Login', error: 'Not redirected' });
      await browser.close();
      return;
    }
    
    // 2. Test All APIs
    const apis = [
      { name: 'Dashboard Stats', url: '/api/admin/stats' },
      { name: 'Artworks', url: '/api/admin/artworks?page=1&limit=10' },
      { name: 'Artists', url: '/api/admin/artists' },
      { name: 'Users', url: '/api/admin/users?page=1&limit=10' },
      { name: 'Transactions', url: '/api/admin/transactions' },
      { name: 'Logs', url: '/api/admin/logs?page=1&limit=10' },
    ];
    
    for (const api of apis) {
      results.totalTests++;
      console.log(`Testing ${api.name}...`);
      
      const response = await page.evaluate(async (url) => {
        const res = await fetch(url, { credentials: 'include' });
        return {
          status: res.status,
          ok: res.ok,
          body: await res.text()
        };
      }, api.url);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`   ✅ ${api.name} OK\n`);
        results.passed++;
      } else {
        console.log(`   ❌ ${api.name} failed`);
        console.log(`   Response: ${response.body.substring(0, 150)}\n`);
        results.failed++;
        results.errors.push({ 
          test: api.name, 
          error: `Status ${response.status}`,
          body: response.body.substring(0, 200)
        });
      }
    }
    
    await page.screenshot({ path: 'production-comprehensive-test.png', fullPage: true });
    console.log('📸 Screenshot: production-comprehensive-test.png\n');
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}\n`);
  } finally {
    await browser.close();
  }
  
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
      if (err.body) {
        console.log(`   ${err.body.substring(0, 100)}`);
      }
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

testProductionComprehensive().catch(console.error);
