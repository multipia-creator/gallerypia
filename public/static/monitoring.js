/**
 * Lightweight Frontend Monitoring
 * Tracks errors and performance without external dependencies
 * Note: Sentry removed to reduce bundle size
 */

// Centralized error logging
class ErrorLogger {
  static send(type, data) {
    // Send to backend for logging
    fetch('/api/logs/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(err => console.error('Failed to send error log:', err))
  }
}

console.log('📊 Lightweight monitoring initialized')

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }
  
  init() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      this.observeCLS()
      this.observeLCP()
      this.observeFID()
    }
    
    // Monitor API calls
    this.monitorFetch()
  }
  
  observeCLS() {
    let cls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value
          this.reportMetric('CLS', cls)
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  }
  
  observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }
  
  observeFID() {
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0]
      const fid = firstInput.processingStart - firstInput.startTime
      this.reportMetric('FID', fid)
    }).observe({ type: 'first-input', buffered: true })
  }
  
  monitorFetch() {
    if (!window._originalFetch) {
      window._originalFetch = window.fetch;
    }
    window.fetch = async (...args) => {
      const start = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      
      try {
        const response = await window._originalFetch(...args)
        const duration = performance.now() - start
        
        this.reportAPICall(url, response.status, duration)
        return response
      } catch (error) {
        const duration = performance.now() - start
        this.reportAPICall(url, 0, duration, error)
        throw error
      }
    }
  }
  
  reportMetric(name, value) {
    this.metrics[name] = value
    console.debug(`📊 ${name}: ${value.toFixed(2)}ms`)
    
    // Send to backend analytics if value exceeds threshold
    if (value > 2500) {
      ErrorLogger.send('performance', { metric: name, value })
    }
  }
  
  reportAPICall(url, status, duration, error = null) {
    const metric = {
      url,
      status,
      duration,
      timestamp: new Date().toISOString()
    }
    
    if (error) {
      metric.error = error.message
    }
    
    // Log slow API calls
    if (duration > 1000) {
      console.warn('🐌 Slow API call:', metric)
      ErrorLogger.send('slow-api', metric)
    }
  }
}

// Initialize monitoring
document.addEventListener('DOMContentLoaded', () => {
  const monitor = new PerformanceMonitor()
  window.performanceMonitor = monitor
})

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error)
  ErrorLogger.send('error', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason)
  ErrorLogger.send('unhandled-rejection', {
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack
  })
})
