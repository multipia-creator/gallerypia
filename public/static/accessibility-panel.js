/**
 * Accessibility Settings Panel (Phase 6.4 + 6.9)
 * WCAG AAA compliance features
 * Version: 1.0.0
 */

class AccessibilityPanel {
  constructor() {
    this.settings = this.loadSettings();
    this.init();
  }
  
  init() {
    this.applySettings();
    this.bindControls();
    this.checkSystemPreferences();
  }
  
  bindControls() {
    // High contrast mode
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
      highContrastToggle.addEventListener('change', (e) => {
        this.setHighContrast(e.target.checked);
      });
    }
    
    // Reduced motion
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    if (reducedMotionToggle) {
      reducedMotionToggle.addEventListener('change', (e) => {
        this.setReducedMotion(e.target.checked);
      });
    }
    
    // Screen reader mode
    const screenReaderToggle = document.getElementById('screen-reader-toggle');
    if (screenReaderToggle) {
      screenReaderToggle.addEventListener('change', (e) => {
        this.setScreenReaderMode(e.target.checked);
      });
    }
    
    // Font adjustments
    const fontSizeIncrease = document.getElementById('font-size-increase');
    const fontSizeDecrease = document.getElementById('font-size-decrease');
    
    if (fontSizeIncrease) {
      fontSizeIncrease.addEventListener('click', () => this.adjustFontSize(2));
    }
    if (fontSizeDecrease) {
      fontSizeDecrease.addEventListener('click', () => this.adjustFontSize(-2));
    }
  }
  
  checkSystemPreferences() {
    // Detect system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !this.settings.reducedMotion) {
      this.setReducedMotion(true);
    }
    
    if (window.matchMedia('(prefers-contrast: high)').matches && !this.settings.highContrast) {
      this.setHighContrast(true);
    }
  }
  
  setHighContrast(enabled) {
    this.settings.highContrast = enabled;
    
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    this.saveSettings();
  }
  
  setReducedMotion(enabled) {
    this.settings.reducedMotion = enabled;
    
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    this.saveSettings();
  }
  
  setScreenReaderMode(enabled) {
    this.settings.screenReaderMode = enabled;
    
    if (enabled) {
      document.documentElement.classList.add('screen-reader-mode');
      // Enhance focus indicators
      document.documentElement.style.setProperty('--focus-outline-width', '4px');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
      document.documentElement.style.setProperty('--focus-outline-width', '2px');
    }
    
    this.saveSettings();
  }
  
  adjustFontSize(delta) {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.max(12, Math.min(24, currentSize + delta));
    
    document.documentElement.style.fontSize = `${newSize}px`;
    this.settings.fontSize = newSize;
    this.saveSettings();
  }
  
  applySettings() {
    if (this.settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (this.settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
    if (this.settings.screenReaderMode) {
      document.documentElement.classList.add('screen-reader-mode');
    }
    if (this.settings.fontSize) {
      document.documentElement.style.fontSize = `${this.settings.fontSize}px`;
    }
  }
  
  loadSettings() {
    const saved = localStorage.getItem('gallerypia_accessibility_settings');
    return saved ? JSON.parse(saved) : {};
  }
  
  saveSettings() {
    localStorage.setItem('gallerypia_accessibility_settings', JSON.stringify(this.settings));
  }
}

window.accessibilityPanel = new AccessibilityPanel();
console.log('✅ Accessibility Panel loaded');
