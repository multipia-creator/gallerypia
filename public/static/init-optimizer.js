// Initialization Optimizer
// Manages all initialization scripts with priority-based loading

window.initOptimizer = {
  criticalTasks: [],    // Execute immediately
  highTasks: [],        // Execute on requestIdleCallback
  lowTasks: [],         // Execute on user interaction or idle

  // Direct API methods (called by user code)
  critical(fn) {
    this.criticalTasks.push(fn);
  },

  high(fn) {
    this.highTasks.push(fn);
  },

  low(fn) {
    this.lowTasks.push(fn);
  },

  // Run critical initializations immediately
  runCritical() {
    console.log(`🚀 Running ${this.criticalTasks.length} critical initializations...`);
    this.criticalTasks.forEach((fn, index) => {
      try {
        fn();
      } catch (error) {
        console.error(`❌ Critical task ${index + 1} failed:`, error);
      }
    });
  },

  // Run high priority with requestIdleCallback
  runHigh() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log(`⚡ Running ${this.highTasks.length} high-priority initializations...`);
        this.highTasks.forEach((fn, index) => {
          try {
            fn();
          } catch (error) {
            console.error(`❌ High task ${index + 1} failed:`, error);
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
      console.log(`💤 Running ${this.lowTasks.length} low-priority initializations...`);
      this.lowTasks.forEach((fn, index) => {
        try {
          fn();
        } catch (error) {
          console.error(`❌ Low task ${index + 1} failed:`, error);
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
    console.log(`   Critical: ${this.criticalTasks.length} tasks`);
    console.log(`   High: ${this.highTasks.length} tasks`);
    console.log(`   Low: ${this.lowTasks.length} tasks`);

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
