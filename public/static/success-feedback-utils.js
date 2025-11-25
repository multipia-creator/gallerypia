
// ========================================
// Phase 6.1.5: Success/Error Animation Polish
// ========================================

/**
 * Confetti Animation for Major Achievements
 */
class ConfettiManager {
  constructor() {
    this.colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
  }
  
  celebrate(options = {}) {
    const count = options.count || 50;
    const duration = options.duration || 3000;
    const container = options.container || document.body;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createConfetti(container, duration);
      }, i * 30);
    }
  }
  
  createConfetti(container, duration) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${this.colors[Math.floor(Math.random() * this.colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: ${0.5 + Math.random() * 0.5};
      transform: rotate(${Math.random() * 360}deg);
      pointer-events: none;
      z-index: 99999;
    `;
    
    container.appendChild(confetti);
    
    // Animate
    const fallDistance = window.innerHeight + 100;
    const fallDuration = duration + Math.random() * 1000;
    const swing = Math.random() * 200 - 100;
    
    confetti.animate([
      { 
        transform: `translateY(0) translateX(0) rotate(0deg)`,
        opacity: 1
      },
      { 
        transform: `translateY(${fallDistance}px) translateX(${swing}px) rotate(${Math.random() * 720}deg)`,
        opacity: 0
      }
    ], {
      duration: fallDuration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    // Remove after animation
    setTimeout(() => {
      confetti.remove();
    }, fallDuration);
  }
}

/**
 * Animated Checkmark for Success
 */
window.showAnimatedCheckmark = function(message, options = {}) {
  const duration = options.duration || 2000;
  
  const overlay = document.createElement('div');
  overlay.className = 'animated-checkmark-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 99999;
    animation: fadeIn 0.3s ease;
  `;
  
  const checkmark = document.createElement('div');
  checkmark.innerHTML = `
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" stroke-width="4" 
        style="stroke-dasharray: 283; stroke-dashoffset: 283; animation: checkmarkCircle 0.6s ease forwards;" />
      <path d="M30 50 L45 65 L70 35" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"
        style="stroke-dasharray: 50; stroke-dashoffset: 50; animation: checkmarkCheck 0.4s 0.4s ease forwards;" />
    </svg>
    <p style="color: white; font-size: 24px; margin-top: 20px; animation: fadeIn 0.5s 0.6s ease forwards; opacity: 0;">
      ${message}
    </p>
  `;
  
  overlay.appendChild(checkmark);
  document.body.appendChild(overlay);
  
  // Add CSS animations
  if (!document.getElementById('checkmark-animations')) {
    const style = document.createElement('style');
    style.id = 'checkmark-animations';
    style.textContent = `
      @keyframes checkmarkCircle {
        to { stroke-dashoffset: 0; }
      }
      @keyframes checkmarkCheck {
        to { stroke-dashoffset: 0; }
      }
      @keyframes fadeIn {
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Remove after duration
  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => overlay.remove(), 300);
  }, duration);
};

/**
 * Shake Animation for Errors
 */
window.shakeElement = function(elementId, options = {}) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const intensity = options.intensity || 10;
  const duration = options.duration || 500;
  
  element.style.animation = `shake ${duration}ms ease`;
  
  // Add shake keyframes if not exists
  if (!document.getElementById('shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-${intensity}px); }
        20%, 40%, 60%, 80% { transform: translateX(${intensity}px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

/**
 * Success with Confetti
 */
window.showSuccessWithConfetti = function(message, options = {}) {
  // Show animated checkmark
  window.showAnimatedCheckmark(message, options);
  
  // Launch confetti
  const confettiManager = new ConfettiManager();
  confettiManager.celebrate({
    count: options.confettiCount || 100,
    duration: options.duration || 3000
  });
};

/**
 * Error with Shake
 */
window.showErrorWithShake = function(message, elementId, options = {}) {
  // Shake the element
  if (elementId) {
    window.shakeElement(elementId, options);
  }
  
  // Show error message
  window.showError(message, options);
};

console.log('✅ Success/Error Animation Polish loaded');
