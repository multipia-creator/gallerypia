/**
 * Theme Customization System (Phase 6.4)
 * User personalization preferences
 * Version: 1.0.0
 */

class ThemeCustomizer {
  constructor() {
    this.preferences = this.loadPreferences();
    this.init();
  }
  
  init() {
    this.applyPreferences();
    this.bindControls();
  }
  
  bindControls() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Font size
    const fontSizeSlider = document.getElementById('font-size-slider');
    if (fontSizeSlider) {
      fontSizeSlider.addEventListener('input', (e) => {
        this.setFontSize(e.target.value);
      });
    }
    
    // Accent color
    const accentColorPicker = document.getElementById('accent-color');
    if (accentColorPicker) {
      accentColorPicker.addEventListener('change', (e) => {
        this.setAccentColor(e.target.value);
      });
    }
  }
  
  toggleTheme() {
    const current = this.preferences.theme || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  setTheme(theme) {
    this.preferences.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.savePreferences();
  }
  
  setFontSize(size) {
    this.preferences.fontSize = size;
    document.documentElement.style.fontSize = `${size}px`;
    this.savePreferences();
  }
  
  setAccentColor(color) {
    this.preferences.accentColor = color;
    document.documentElement.style.setProperty('--accent-color', color);
    this.savePreferences();
  }
  
  applyPreferences() {
    if (this.preferences.theme) {
      document.documentElement.setAttribute('data-theme', this.preferences.theme);
    }
    if (this.preferences.fontSize) {
      document.documentElement.style.fontSize = `${this.preferences.fontSize}px`;
    }
    if (this.preferences.accentColor) {
      document.documentElement.style.setProperty('--accent-color', this.preferences.accentColor);
    }
  }
  
  loadPreferences() {
    const saved = localStorage.getItem('gallerypia_theme_preferences');
    return saved ? JSON.parse(saved) : { theme: 'dark', fontSize: 16 };
  }
  
  savePreferences() {
    localStorage.setItem('gallerypia_theme_preferences', JSON.stringify(this.preferences));
  }
}

window.themeCustomizer = new ThemeCustomizer();
console.log('✅ Theme Customizer loaded');
