/**
 * GalleryPia - Clipboard Utilities
 * 
 * Client-side JavaScript for clipboard operations
 * Modern Clipboard API with fallbacks
 * 
 * Features:
 * - Copy text to clipboard
 * - Copy HTML content
 * - Copy images
 * - Read from clipboard
 * - Visual feedback
 * - Keyboard shortcuts (Ctrl+C)
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class ClipboardManager {
  constructor() {
    this.isSupported = this.checkSupport();
  }
  
  checkSupport() {
    return navigator.clipboard !== undefined;
  }
  
  // Copy text to clipboard
  async copyText(text, successMessage = '복사되었습니다.') {
    if (!text) {
      console.warn('No text to copy');
      return false;
    }
    
    try {
      if (this.isSupported) {
        await navigator.clipboard.writeText(text);
        this.showFeedback(successMessage, 'success');
        return true;
      } else {
        return this.fallbackCopy(text, successMessage);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      return this.fallbackCopy(text, successMessage);
    }
  }
  
  // Fallback copy method for older browsers
  fallbackCopy(text, successMessage) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // For iOS
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, 999999);
    } else {
      textarea.select();
    }
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        this.showFeedback(successMessage, 'success');
        return true;
      } else {
        this.showFeedback('복사에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      document.body.removeChild(textarea);
      this.showFeedback('복사에 실패했습니다.', 'error');
      return false;
    }
  }
  
  // Copy HTML content
  async copyHTML(html, plainText, successMessage = 'HTML이 복사되었습니다.') {
    if (!this.isSupported) {
      // Fallback to plain text
      return this.copyText(plainText || html, successMessage);
    }
    
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([plainText || html], { type: 'text/plain' })
      })];
      
      await navigator.clipboard.write(data);
      this.showFeedback(successMessage, 'success');
      return true;
    } catch (error) {
      console.error('Copy HTML failed:', error);
      return this.copyText(plainText || html, successMessage);
    }
  }
  
  // Copy image to clipboard
  async copyImage(imageUrl, successMessage = '이미지가 복사되었습니다.') {
    if (!this.isSupported) {
      this.showFeedback('이미지 복사는 지원되지 않습니다.', 'error');
      return false;
    }
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      this.showFeedback(successMessage, 'success');
      return true;
    } catch (error) {
      console.error('Copy image failed:', error);
      this.showFeedback('이미지 복사에 실패했습니다.', 'error');
      return false;
    }
  }
  
  // Read text from clipboard
  async readText() {
    if (!this.isSupported) {
      this.showFeedback('클립보드 읽기는 지원되지 않습니다.', 'error');
      return null;
    }
    
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('Read clipboard failed:', error);
      this.showFeedback('클립보드 읽기에 실패했습니다.', 'error');
      return null;
    }
  }
  
  // Show visual feedback
  showFeedback(message, type = 'success') {
    // Check if notification already exists
    const existing = document.querySelector('.clipboard-notification');
    if (existing) {
      existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `clipboard-notification fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-[102] flex items-center gap-3 transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global clipboard manager instance
window.clipboardManager = new ClipboardManager();

// Global helper functions
window.copyToClipboard = function(text, message) {
  return window.clipboardManager.copyText(text, message);
};

window.copyHTMLToClipboard = function(html, plainText, message) {
  return window.clipboardManager.copyHTML(html, plainText, message);
};

window.copyImageToClipboard = function(imageUrl, message) {
  return window.clipboardManager.copyImage(imageUrl, message);
};

window.readClipboard = function() {
  return window.clipboardManager.readText();
};

// Copy button handler
window.handleCopyButton = function(button, text, successMessage) {
  const originalHTML = button.innerHTML;
  
  window.copyToClipboard(text, successMessage).then(success => {
    if (success) {
      // Change button icon temporarily
      button.innerHTML = '<i class="fas fa-check"></i>';
      button.classList.add('bg-green-600');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('bg-green-600');
      }, 2000);
    }
  });
};

// Auto-initialize copy buttons
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data-copy buttons
  const copyButtons = document.querySelectorAll('[data-copy]');
  
  copyButtons.forEach(button => {
    const textToCopy = button.dataset.copy;
    const message = button.dataset.copyMessage || '복사되었습니다.';
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      handleCopyButton(button, textToCopy, message);
    });
  });
  
  // Initialize data-copy-target buttons
  const copyTargetButtons = document.querySelectorAll('[data-copy-target]');
  
  copyTargetButtons.forEach(button => {
    const targetSelector = button.dataset.copyTarget;
    const message = button.dataset.copyMessage || '복사되었습니다.';
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(targetSelector);
      
      if (target) {
        const text = target.value || target.textContent || target.innerText;
        handleCopyButton(button, text, message);
      }
    });
  });
  
  // Add copy buttons to code blocks
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(code => {
    const pre = code.parentElement;
    
    // Skip if already has copy button
    if (pre.querySelector('.copy-code-button')) return;
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors';
    copyButton.innerHTML = '<i class="fas fa-copy mr-1"></i>복사';
    
    copyButton.addEventListener('click', function() {
      handleCopyButton(copyButton, code.textContent, '코드가 복사되었습니다.');
    });
    
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
  });
  
  console.log(`Initialized ${copyButtons.length + copyTargetButtons.length + codeBlocks.length} copy elements`);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl+Shift+C: Copy current URL
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    window.copyToClipboard(window.location.href, '페이지 URL이 복사되었습니다.');
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClipboardManager };
}
