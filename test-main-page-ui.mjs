import { chromium } from 'playwright';

async function testMainPageUI() {
  console.log('🚀 Testing Main Page UI...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Tutorial') || text.includes('modal') || text.includes('popup')) {
        console.log(`[Browser] ${text}`);
      }
    });
    
    // Navigate to main page
    console.log('📄 Loading main page...\n');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Wait a bit for any popups to appear
    await page.waitForTimeout(2000);
    
    // Check for any visible modals/popups
    console.log('🔍 Checking for visible popups/modals...\n');
    
    const modals = await page.$$('[role="dialog"], .modal, .popup, [id*="modal"], [id*="Modal"], [class*="tutorial"]');
    console.log(`Found ${modals.length} potential modal/popup elements`);
    
    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const isVisible = await modal.isVisible();
      const boundingBox = await modal.boundingBox();
      
      if (isVisible) {
        const id = await modal.getAttribute('id');
        const className = await modal.getAttribute('class');
        console.log(`\n✅ Visible Modal ${i + 1}:`);
        console.log(`  ID: ${id || 'N/A'}`);
        console.log(`  Class: ${className || 'N/A'}`);
        if (boundingBox) {
          console.log(`  Position: x=${boundingBox.x}, y=${boundingBox.y}`);
          console.log(`  Size: ${boundingBox.width}x${boundingBox.height}`);
          
          // Check if modal is off-screen
          if (boundingBox.x < 0 || boundingBox.y < 0 || 
              boundingBox.x > 1280 || boundingBox.y > 720) {
            console.log(`  ⚠️ WARNING: Modal is off-screen!`);
          }
          
          // Check if modal is too small
          if (boundingBox.width < 100 || boundingBox.height < 100) {
            console.log(`  ⚠️ WARNING: Modal might be too small!`);
          }
        }
        
        // Try to get text content
        const text = await modal.textContent();
        if (text && text.length > 0 && text.length < 200) {
          console.log(`  Text: ${text.substring(0, 100)}...`);
        }
      }
    }
    
    // Check for tutorial welcome modal specifically
    const tutorialModal = await page.$('#tutorialWelcomeModal');
    if (tutorialModal) {
      const isVisible = await tutorialModal.isVisible();
      console.log(`\n📚 Tutorial Welcome Modal: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    } else {
      console.log(`\n📚 Tutorial Welcome Modal: NOT FOUND`);
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/home/user/webapp/main-page-screenshot.png', fullPage: true });
    console.log(`\n📸 Screenshot saved to: /home/user/webapp/main-page-screenshot.png`);
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

testMainPageUI().catch(console.error);
