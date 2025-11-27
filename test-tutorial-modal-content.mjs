import { chromium } from 'playwright';

async function checkTutorialModal() {
  console.log('🔍 Checking Tutorial Modal Content...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find tutorialModal
    const tutorialModal = await page.$('#tutorialModal');
    
    if (tutorialModal) {
      console.log('✅ Tutorial Modal Found\n');
      
      const isVisible = await tutorialModal.isVisible();
      console.log(`Visible: ${isVisible}`);
      
      const html = await tutorialModal.innerHTML();
      console.log(`\nHTML Content (first 500 chars):`);
      console.log(html.substring(0, 500));
      console.log('...\n');
      
      const text = await tutorialModal.textContent();
      console.log(`Text Content (first 300 chars):`);
      console.log(text.substring(0, 300));
      console.log('...\n');
      
      // Check if it has any child elements
      const children = await page.$$('#tutorialModal > *');
      console.log(`Child elements: ${children.length}`);
      
      // Check computed style
      const display = await tutorialModal.evaluate(el => window.getComputedStyle(el).display);
      const opacity = await tutorialModal.evaluate(el => window.getComputedStyle(el).opacity);
      const zIndex = await tutorialModal.evaluate(el => window.getComputedStyle(el).zIndex);
      
      console.log(`\nComputed Styles:`);
      console.log(`  display: ${display}`);
      console.log(`  opacity: ${opacity}`);
      console.log(`  z-index: ${zIndex}`);
      
    } else {
      console.log('❌ Tutorial Modal NOT Found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkTutorialModal().catch(console.error);
