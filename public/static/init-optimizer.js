// Initialization Optimizer
// Manages all initialization scripts with priority-based loading

window.initOptimizer = {
  critical: [],    // Execute immediately
  high: [],        // Execute on requestIdleCallback
  low: [],         // Execute on user interaction or idle

  // Add initialization function
  add(priority, name, fn) {
    this[priority].push({ name, fn });
  },

  // Run critical initializations immediately
  runCritical() {
    console.log('🚀 Running critical initializations...');
    this.critical.forEach(({ name, fn }) => {
      try {
        fn();
        console.log(`✅ ${name} initialized (critical)`);
      } catch (error) {
        console.error(`❌ ${name} failed:`, error);
      }
    });
  },

  // Run high priority with requestIdleCallback
  runHigh() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('⚡ Running high-priority initializations...');
        this.high.forEach(({ name, fn }) => {
          try {
            fn();
            console.log(`✅ ${name} initialized (high)`);
          } catch (error) {
            console.error(`❌ ${name} failed:`, error);
          }
        });
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.runHigh(), 1000);
    }
  },

  // Run low priority on user interaction
  runLow() {
    const runLowPriority = () => {
      console.log('💤 Running low-priority initializations...');
      this.low.forEach(({ name, fn }) => {
        try {
          fn();
          console.log(`✅ ${name} initialized (low)`);
        } catch (error) {
          console.error(`❌ ${name} failed:`, error);
        }
      });
    };

    // Run on first user interaction or after 5 seconds
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    const onFirstInteraction = () => {
      runLowPriority();
      events.forEach(event => document.removeEventListener(event, onFirstInteraction));
    };

    events.forEach(event => document.addEventListener(event, onFirstInteraction, { once: true, passive: true }));
    setTimeout(runLowPriority, 5000); // Fallback after 5s
  },

  // Initialize all
  init() {
    console.log('🎯 Init Optimizer: Starting optimized initialization');
    console.log(`   Critical: ${this.critical.length} tasks`);
    console.log(`   High: ${this.high.length} tasks`);
    console.log(`   Low: ${this.low.length} tasks`);

    this.runCritical();
    this.runHigh();
    this.runLow();
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initOptimizer.init());
} else {
  window.initOptimizer.init();
}
