/**
 * ============================================
 * 🚨 W2-H1: Global Error Handler
 * ============================================
 * Catches all unhandled errors and provides user-friendly error messages
 */

// Error tracking
const errorLog = [];
const MAX_ERROR_LOG = 50;

// Error reporting endpoint (can be configured)
const ERROR_REPORT_ENDPOINT = '/api/error-report';

/**
 * Global unhandled error handler
 */
window.addEventListener('error', (event) => {
  const error = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  console.error('🔴 Global Error:', error);
  
  // Add to error log
  errorLog.push(error);
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog.shift(); // Remove oldest
  }
  
  // Show user-friendly error message
  if (typeof showErrorToast === 'function') {
    showErrorToast('예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.');
  } else {
    console.error('Toast system not available');
  }
  
  // Report error to backend (optional, non-blocking)
  reportErrorToBackend(error);
  
  // Prevent default error handling
  event.preventDefault();
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
  const error = {
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    type: 'unhandledRejection'
  };
  
  console.error('🔴 Unhandled Promise Rejection:', error);
  
  // Add to error log
  errorLog.push(error);
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog.shift();
  }
  
  // Show user-friendly error message
  if (typeof showErrorToast === 'function') {
    showErrorToast('비동기 작업 중 오류가 발생했습니다.');
  }
  
  // Report error to backend
  reportErrorToBackend(error);
  
  // Prevent default handling
  event.preventDefault();
});

/**
 * Network error handler (fetch failures)
 */
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Handle HTTP error status codes
    if (!response.ok) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      const error = {
        type: 'httpError',
        status: response.status,
        statusText: response.statusText,
        url: url,
        timestamp: new Date().toISOString()
      };
      
      console.warn('⚠️ HTTP Error:', error);
      
      // User-friendly error messages by status code
      const statusMessages = {
        400: '잘못된 요청입니다.',
        401: '로그인이 필요합니다.',
        403: '권한이 없습니다.',
        404: '요청한 리소스를 찾을 수 없습니다.',
        429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        500: '서버 오류가 발생했습니다.',
        502: '게이트웨이 오류가 발생했습니다.',
        503: '서비스를 일시적으로 사용할 수 없습니다.'
      };
      
      const userMessage = statusMessages[response.status] || `오류가 발생했습니다 (${response.status})`;
      
      // Only show toast for non-auth endpoints to avoid spam
      if (!url?.includes('/api/auth/') && typeof showWarningToast === 'function') {
        showWarningToast(userMessage, 4000);
      }
      
      // Log error
      errorLog.push(error);
      if (errorLog.length > MAX_ERROR_LOG) {
        errorLog.shift();
      }
    }
    
    return response;
  } catch (err) {
    // Network failure (no response)
    const error = {
      type: 'networkError',
      message: err.message,
      url: typeof args[0] === 'string' ? args[0] : args[0]?.url,
      timestamp: new Date().toISOString()
    };
    
    console.error('🔴 Network Error:', error);
    
    // Show network error toast
    if (typeof showErrorToast === 'function') {
      showErrorToast('네트워크 연결을 확인해주세요.');
    }
    
    // Log error
    errorLog.push(error);
    if (errorLog.length > MAX_ERROR_LOG) {
      errorLog.shift();
    }
    
    // Re-throw for caller to handle
    throw err;
  }
};

/**
 * Report error to backend (non-blocking)
 */
async function reportErrorToBackend(error) {
  try {
    // Only report in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }
    
    // Send error report (non-blocking, no await)
    fetch(ERROR_REPORT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(() => {
      // Silently fail - error reporting should not break the app
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Get error log (for debugging)
 */
window.getErrorLog = function() {
  return [...errorLog];
};

/**
 * Clear error log
 */
window.clearErrorLog = function() {
  errorLog.length = 0;
  console.log('✅ Error log cleared');
};

/**
 * Manually report an error
 */
window.reportError = function(message, context = {}) {
  const error = {
    type: 'manual',
    message,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  console.error('🔴 Manual Error Report:', error);
  
  errorLog.push(error);
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog.shift();
  }
  
  reportErrorToBackend(error);
  
  if (typeof showErrorToast === 'function') {
    showErrorToast(message);
  }
};

/**
 * Enhanced console.error with automatic toast
 */
const originalConsoleError = console.error;
console.error = function(...args) {
  // Call original console.error
  originalConsoleError.apply(console, args);
  
  // Auto-show toast for critical errors (only if not already handling)
  const errorMessage = args[0];
  if (typeof errorMessage === 'string' && errorMessage.includes('🔴')) {
    // Already handled by global error handler
    return;
  }
  
  // Log to error log
  const error = {
    type: 'consoleError',
    message: String(errorMessage),
    args: args,
    timestamp: new Date().toISOString()
  };
  
  errorLog.push(error);
  if (errorLog.length > MAX_ERROR_LOG) {
    errorLog.shift();
  }
};

// Initialize
console.log('✅ Global Error Handler initialized (W2-H1)');
console.log('📊 Use window.getErrorLog() to view error history');
console.log('🗑️ Use window.clearErrorLog() to clear error history');
