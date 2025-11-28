#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'https://f6df4d5f.gallerypia.pages.dev';

async function testNewDeployment() {
  console.log('🚀 Testing NEW deployment with completely rewritten APIs...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Login Test
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'admin@gallerypia.com',
        password: 'admin123!@#'
      }
    });
    
    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status()}`);
    console.log(`   Success: ${loginData.success}`);
    console.log(`   Role: ${loginData.user?.role}`);
    
    if (loginResponse.status() !== 200 || !loginData.success) {
      console.log('   ❌ Login FAILED');
      throw new Error('Login failed');
    }
    
    // Get session token from cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'gallerypia_session');
    console.log(`   Session token: ${sessionCookie ? '✅ Set' : '❌ Missing'}\n`);
    
    if (!sessionCookie) {
      throw new Error('Session cookie not set');
    }
    
    // 2. Test Stats API
    console.log('2️⃣ Testing Admin Stats API...');
    const statsResponse = await page.request.get(`${BASE_URL}/api/admin/stats`);
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status()}`);
    console.log(`   Success: ${statsData.success}`);
    console.log(`   Total Users: ${statsData.data?.total_users}`);
    console.log(`   Total Artworks: ${statsData.data?.total_artworks}\n`);
    
    // 3. Test Artworks API (CRITICAL - This was failing before)
    console.log('3️⃣ Testing Artworks API (NEW IMPLEMENTATION)...');
    const artworksResponse = await page.request.get(`${BASE_URL}/api/admin/artworks`);
    const artworksData = await artworksResponse.json();
    console.log(`   Status: ${artworksResponse.status()}`);
    console.log(`   Success: ${artworksData.success}`);
    
    if (artworksResponse.status() === 200 && artworksData.success) {
      console.log(`   ✅ Artworks Count: ${artworksData.data?.length || 0}`);
      if (artworksData.data && artworksData.data.length > 0) {
        console.log(`   Sample: ${artworksData.data[0].title} by ${artworksData.data[0].artist_name}`);
      }
    } else {
      console.log(`   ❌ FAILED: ${artworksData.error}`);
      console.log(`   Details: ${JSON.stringify(artworksData, null, 2)}`);
    }
    console.log('');
    
    // 4. Test Users API (CRITICAL - This was failing before)
    console.log('4️⃣ Testing Users API (NEW IMPLEMENTATION)...');
    const usersResponse = await page.request.get(`${BASE_URL}/api/admin/users`);
    const usersData = await usersResponse.json();
    console.log(`   Status: ${usersResponse.status()}`);
    console.log(`   Success: ${usersData.success}`);
    
    if (usersResponse.status() === 200 && usersData.success) {
      console.log(`   ✅ Users Count: ${usersData.data?.length || 0}`);
      if (usersData.data && usersData.data.length > 0) {
        console.log(`   Sample: ${usersData.data[0].email} (${usersData.data[0].role})`);
      }
    } else {
      console.log(`   ❌ FAILED: ${usersData.error}`);
      console.log(`   Details: ${JSON.stringify(usersData, null, 2)}`);
    }
    console.log('');
    
    // 5. Test Artists API (Should still work)
    console.log('5️⃣ Testing Artists API...');
    const artistsResponse = await page.request.get(`${BASE_URL}/api/admin/artists`);
    const artistsData = await artistsResponse.json();
    console.log(`   Status: ${artistsResponse.status()}`);
    console.log(`   Success: ${artistsData.success}`);
    console.log(`   Artists Count: ${artistsData.data?.length || 0}\n`);
    
    // Summary
    console.log('📊 FINAL RESULTS:');
    console.log('─────────────────────────────────────────');
    console.log(`✅ Login API: ${loginResponse.status() === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Stats API: ${statsResponse.status() === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`${artworksResponse.status() === 200 && artworksData.success ? '✅' : '❌'} Artworks API: ${artworksResponse.status() === 200 && artworksData.success ? 'PASS ✨' : 'FAIL'}`);
    console.log(`${usersResponse.status() === 200 && usersData.success ? '✅' : '❌'} Users API: ${usersResponse.status() === 200 && usersData.success ? 'PASS ✨' : 'FAIL'}`);
    console.log(`✅ Artists API: ${artistsResponse.status() === 200 ? 'PASS' : 'FAIL'}`);
    console.log('─────────────────────────────────────────');
    
    const allPassed = 
      loginResponse.status() === 200 && 
      statsResponse.status() === 200 && 
      artworksResponse.status() === 200 && artworksData.success &&
      usersResponse.status() === 200 && usersData.success &&
      artistsResponse.status() === 200;
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! 모든 API가 정상 작동합니다!\n');
    } else {
      console.log('\n⚠️ SOME TESTS FAILED. 일부 API에 문제가 있습니다.\n');
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testNewDeployment();
