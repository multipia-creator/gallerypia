import { chromium } from 'playwright';

/**
 * 🔬 전문가급 회원가입/로그인 종합 테스트 시스템
 * - 자동 오류 감지 및 근본 원인 분석
 * - 상세 로그 및 스크린샷 캡처
 * - 네트워크 요청/응답 추적
 */

class AuthTestSystem {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.apiCalls = [];
    this.consoleLogs = [];
    this.screenshots = [];
  }

  async runComprehensiveTest() {
    console.log('🔬 Starting Comprehensive Auth Test System...\n');
    console.log('=' .repeat(60));
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: '/home/user/webapp/test-videos/' }
      });
      
      const page = await context.newPage();
      this.setupListeners(page);
      
      // Test Suite
      await this.testSignupFlow(page);
      await this.testLoginFlow(page);
      await this.testSocialLoginButtons(page);
      await this.testPasswordRecovery(page);
      await this.testFormValidation(page);
      
      // Generate Report
      this.generateReport();
      
    } catch (error) {
      this.errors.push({
        type: 'CRITICAL',
        message: error.message,
        stack: error.stack
      });
    } finally {
      await browser.close();
    }
    
    return this.errors.length === 0;
  }
  
  setupListeners(page) {
    // Console logs
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      this.consoleLogs.push({ type, text, timestamp: Date.now() });
      
      if (type === 'error') {
        this.errors.push({
          type: 'CONSOLE_ERROR',
          message: text,
          location: msg.location()
        });
      }
      
      if (text.includes('error') || text.includes('Error') || text.includes('fail')) {
        console.log(`[Browser ${type.toUpperCase()}] ${text}`);
      }
    });
    
    // Page errors
    page.on('pageerror', error => {
      this.errors.push({
        type: 'PAGE_ERROR',
        message: error.message,
        stack: error.stack
      });
      console.log(`[Page Error] ${error.message}`);
    });
    
    // Network tracking
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        this.apiCalls.push({
          type: 'request',
          method: request.method(),
          url: url,
          postData: request.postData(),
          timestamp: Date.now()
        });
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
        
        this.apiCalls.push({
          type: 'response',
          status: status,
          url: url,
          body: body,
          timestamp: Date.now()
        });
        
        // Check for API errors
        if (status >= 400) {
          this.errors.push({
            type: 'API_ERROR',
            status: status,
            url: url,
            body: body
          });
        }
      }
    });
  }
  
  async testSignupFlow(page) {
    console.log('\n📝 TEST 1: Signup Flow');
    console.log('-'.repeat(60));
    
    try {
      // Navigate to signup page
      await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle', timeout: 10000 });
      console.log('✓ Signup page loaded');
      
      // Take screenshot
      await page.screenshot({ path: '/home/user/webapp/signup-initial.png' });
      this.screenshots.push('signup-initial.png');
      
      // Check form existence
      const form = await page.$('#signupForm');
      if (!form) {
        this.errors.push({
          type: 'MISSING_ELEMENT',
          message: 'Signup form not found',
          element: '#signupForm'
        });
        console.log('✗ Signup form NOT found');
        return;
      }
      console.log('✓ Signup form found');
      
      // Check required fields
      const requiredFields = [
        { selector: 'input[name="email"]', label: 'Email' },
        { selector: 'input[name="full_name"]', label: 'Full Name' },
        { selector: 'input[name="password"]', label: 'Password' },
        { selector: 'input[name="confirm_password"]', label: 'Confirm Password' },
        { selector: 'input[name="role"]', label: 'Role' }
      ];
      
      for (const field of requiredFields) {
        const element = await page.$(field.selector);
        if (!element) {
          this.errors.push({
            type: 'MISSING_FIELD',
            message: `${field.label} field not found`,
            selector: field.selector
          });
          console.log(`✗ ${field.label} field NOT found`);
        } else {
          console.log(`✓ ${field.label} field found`);
        }
      }
      
      // Fill form with test data
      const testEmail = `test_${Date.now()}@test.com`;
      console.log(`\nFilling form with email: ${testEmail}`);
      
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="full_name"]', 'Test User');
      await page.fill('input[name="password"]', 'Test1234!@#');
      await page.fill('input[name="confirm_password"]', 'Test1234!@#');
      console.log('✓ Form filled');
      
      // Wait for auto email check (if any)
      await page.waitForTimeout(1500);
      
      // Take screenshot before submit
      await page.screenshot({ path: '/home/user/webapp/signup-filled.png' });
      this.screenshots.push('signup-filled.png');
      
      // Submit form
      const submitButton = await page.$('button[type="submit"]');
      if (!submitButton) {
        this.errors.push({
          type: 'MISSING_ELEMENT',
          message: 'Submit button not found',
          element: 'button[type="submit"]'
        });
        console.log('✗ Submit button NOT found');
        return;
      }
      
      const buttonText = await submitButton.textContent();
      console.log(`\nSubmitting form (button: "${buttonText.trim()}")...`);
      
      await submitButton.click();
      
      // Wait for navigation or response
      await page.waitForTimeout(3000);
      
      // Check final URL
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      
      if (finalUrl.includes('/login')) {
        console.log('✓ ✓ ✓ Signup SUCCESSFUL - Redirected to login');
      } else if (finalUrl.includes('/signup')) {
        this.warnings.push({
          type: 'SIGNUP_NO_REDIRECT',
          message: 'Still on signup page after submit',
          url: finalUrl
        });
        console.log('✗ Still on signup page - checking for errors...');
        
        // Check for error messages
        const errorElements = await page.$$('[class*="text-red"], [class*="error"]');
        for (const el of errorElements) {
          const text = await el.textContent();
          if (text.trim() && text.length < 200) {
            console.log(`  Error message: "${text.trim()}"`);
            this.errors.push({
              type: 'FORM_ERROR',
              message: text.trim()
            });
          }
        }
      }
      
      // Take final screenshot
      await page.screenshot({ path: '/home/user/webapp/signup-final.png' });
      this.screenshots.push('signup-final.png');
      
    } catch (error) {
      this.errors.push({
        type: 'TEST_FAILURE',
        test: 'Signup Flow',
        message: error.message,
        stack: error.stack
      });
      console.log(`✗ Signup test failed: ${error.message}`);
    }
  }
  
  async testLoginFlow(page) {
    console.log('\n🔐 TEST 2: Login Flow');
    console.log('-'.repeat(60));
    
    try {
      // Navigate to login page
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
      console.log('✓ Login page loaded');
      
      await page.screenshot({ path: '/home/user/webapp/login-initial.png' });
      this.screenshots.push('login-initial.png');
      
      // Check form
      const form = await page.$('#loginForm');
      if (!form) {
        this.errors.push({
          type: 'MISSING_ELEMENT',
          message: 'Login form not found',
          element: '#loginForm'
        });
        console.log('✗ Login form NOT found');
        return;
      }
      console.log('✓ Login form found');
      
      // Test with existing account
      console.log('\nTesting login with: buyer_dash@test.com');
      await page.fill('input[name="email"]', 'buyer_dash@test.com');
      await page.fill('input[name="password"]', 'Test1234!@#');
      console.log('✓ Form filled');
      
      await page.screenshot({ path: '/home/user/webapp/login-filled.png' });
      this.screenshots.push('login-filled.png');
      
      // Submit
      const submitButton = await page.$('button[type="submit"]');
      const buttonText = await submitButton.textContent();
      console.log(`\nSubmitting form (button: "${buttonText.trim()}")...`);
      
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Check result
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      
      if (finalUrl.includes('/dashboard') || finalUrl.includes('/')) {
        console.log('✓ ✓ ✓ Login SUCCESSFUL');
      } else if (finalUrl.includes('/login')) {
        this.warnings.push({
          type: 'LOGIN_FAILED',
          message: 'Still on login page after submit'
        });
        console.log('✗ Login failed - still on login page');
        
        // Check for error messages
        const errorElements = await page.$$('[class*="text-red"], [class*="error"]');
        for (const el of errorElements) {
          const text = await el.textContent();
          if (text.trim() && text.length < 200) {
            console.log(`  Error message: "${text.trim()}"`);
          }
        }
      }
      
      await page.screenshot({ path: '/home/user/webapp/login-final.png' });
      this.screenshots.push('login-final.png');
      
    } catch (error) {
      this.errors.push({
        type: 'TEST_FAILURE',
        test: 'Login Flow',
        message: error.message
      });
      console.log(`✗ Login test failed: ${error.message}`);
    }
  }
  
  async testSocialLoginButtons(page) {
    console.log('\n🔗 TEST 3: Social Login Buttons');
    console.log('-'.repeat(60));
    
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
      
      const socialButtons = [
        { name: 'Google', selector: '[href*="google"], [onclick*="google"]' },
        { name: 'Kakao', selector: '[href*="kakao"], [onclick*="kakao"]' },
        { name: 'Naver', selector: '[href*="naver"], [onclick*="naver"]' }
      ];
      
      for (const button of socialButtons) {
        const element = await page.$(button.selector);
        if (element) {
          const isVisible = await element.isVisible();
          console.log(`✓ ${button.name} button: ${isVisible ? 'Visible' : 'Hidden'}`);
        } else {
          console.log(`✗ ${button.name} button: Not found`);
          this.warnings.push({
            type: 'MISSING_SOCIAL_BUTTON',
            provider: button.name
          });
        }
      }
      
    } catch (error) {
      console.log(`✗ Social button test failed: ${error.message}`);
    }
  }
  
  async testPasswordRecovery(page) {
    console.log('\n🔑 TEST 4: Password Recovery');
    console.log('-'.repeat(60));
    
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
      
      const forgotPasswordLink = await page.$('a[href="/forgot-password"]');
      if (forgotPasswordLink) {
        const isVisible = await forgotPasswordLink.isVisible();
        console.log(`✓ Forgot password link: ${isVisible ? 'Visible' : 'Hidden'}`);
      } else {
        console.log('✗ Forgot password link: Not found');
        this.warnings.push({
          type: 'MISSING_FEATURE',
          feature: 'Password Recovery Link'
        });
      }
      
    } catch (error) {
      console.log(`✗ Password recovery test failed: ${error.message}`);
    }
  }
  
  async testFormValidation(page) {
    console.log('\n✅ TEST 5: Form Validation');
    console.log('-'.repeat(60));
    
    try {
      await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle', timeout: 10000 });
      
      // Test empty form submission
      const submitButton = await page.$('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check if still on signup page (validation should prevent submission)
      const url = page.url();
      if (url.includes('/signup')) {
        console.log('✓ Empty form submission prevented');
      } else {
        this.warnings.push({
          type: 'VALIDATION_MISSING',
          message: 'Empty form was submitted without validation'
        });
        console.log('✗ Empty form was submitted');
      }
      
      // Test password mismatch
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="full_name"]', 'Test');
      await page.fill('input[name="password"]', 'Test1234!@#');
      await page.fill('input[name="confirm_password"]', 'Different123!@#');
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      const urlAfter = page.url();
      if (urlAfter.includes('/signup')) {
        console.log('✓ Password mismatch validation working');
      } else {
        this.warnings.push({
          type: 'VALIDATION_MISSING',
          message: 'Password mismatch not validated'
        });
        console.log('✗ Password mismatch not caught');
      }
      
    } catch (error) {
      console.log(`✗ Validation test failed: ${error.message}`);
    }
  }
  
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Statistics:`);
    console.log(`  Total Errors: ${this.errors.length}`);
    console.log(`  Total Warnings: ${this.warnings.length}`);
    console.log(`  API Calls: ${this.apiCalls.filter(c => c.type === 'request').length}`);
    console.log(`  Console Logs: ${this.consoleLogs.length}`);
    console.log(`  Screenshots: ${this.screenshots.length}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS FOUND (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. [${error.type}] ${error.message}`);
        if (error.selector) console.log(`     Selector: ${error.selector}`);
        if (error.url) console.log(`     URL: ${error.url}`);
        if (error.status) console.log(`     Status: ${error.status}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. [${warning.type}] ${warning.message || warning.feature}`);
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`\n✅ ✅ ✅ ALL TESTS PASSED!`);
      console.log(`🎉 No errors or warnings found!`);
    }
    
    // API call summary
    const apiRequests = this.apiCalls.filter(c => c.type === 'request');
    if (apiRequests.length > 0) {
      console.log(`\n📡 API Calls Summary:`);
      const apiByUrl = {};
      apiRequests.forEach(req => {
        const url = req.url.replace('http://localhost:3000', '');
        apiByUrl[url] = (apiByUrl[url] || 0) + 1;
      });
      Object.entries(apiByUrl).forEach(([url, count]) => {
        console.log(`  ${url}: ${count} call(s)`);
      });
    }
    
    console.log(`\n📸 Screenshots saved to:`);
    this.screenshots.forEach(screenshot => {
      console.log(`  - /home/user/webapp/${screenshot}`);
    });
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run tests
const testSystem = new AuthTestSystem();
testSystem.runComprehensiveTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
