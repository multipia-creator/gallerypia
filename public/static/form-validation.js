/**
 * GalleryPia - Form Validation System
 * Real-time validation with visual feedback
 */

// Prevent duplicate loading - CRITICAL FIX
if (typeof window.FormValidation !== 'undefined') {
  console.log('⚠️ FormValidation already loaded, skipping...');
  // Exit immediately to prevent duplicate class declaration
  throw new Error('FormValidation already loaded');
}

(function() {
  'use strict';

class FormValidation {
  constructor() {
    this.validators = {
      email: this.validateEmail.bind(this),
      password: this.validatePassword.bind(this),
      required: this.validateRequired.bind(this),
      username: this.validateUsername.bind(this),
      phone: this.validatePhone.bind(this),
      url: this.validateURL.bind(this)
    };
    
    this.debounceTimers = new Map();
    this.init();
  }

  init() {
    console.log('Form Validation System initialized');
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Auto-attach to all inputs with data-validate attribute
    document.addEventListener('DOMContentLoaded', () => {
      const inputs = document.querySelectorAll('[data-validate]');
      inputs.forEach(input => {
        this.setupValidation(input);
      });
    });
  }

  setupValidation(input) {
    const validationType = input.dataset.validate;
    const isRequired = input.hasAttribute('required') || input.dataset.required === 'true';

    // Real-time validation on blur
    input.addEventListener('blur', () => {
      this.validateInput(input, validationType, isRequired);
    });

    // Special handling for email (check duplicate)
    if (validationType === 'email') {
      input.addEventListener('input', () => {
        this.debounce(() => {
          this.checkEmailAvailability(input);
        }, 500, input.id);
      });
    }

    // Special handling for password (show strength)
    if (validationType === 'password') {
      input.addEventListener('input', () => {
        this.showPasswordStrength(input);
      });
    }
  }

  validateInput(input, type, required) {
    const value = input.value.trim();

    // Clear previous errors
    this.clearError(input);

    // Required check
    if (required && !value) {
      this.showError(input, '필수 입력 항목입니다');
      return false;
    }

    // Skip validation if empty and not required
    if (!value && !required) {
      return true;
    }

    // Type-specific validation
    const validator = this.validators[type];
    if (validator) {
      const result = validator(value);
      if (!result.valid) {
        this.showError(input, result.message);
        return false;
      }
    }

    this.showSuccess(input);
    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, message: '올바른 이메일 형식이 아닙니다' };
    }

    // Check for common typos
    const commonDomains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'hanmail.net'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && !commonDomains.includes(domain)) {
      // Suggest correction for typos
      const suggestion = this.suggestEmailDomain(domain, commonDomains);
      if (suggestion) {
        return { 
          valid: false, 
          message: `${suggestion}을(를) 의도하셨나요?`,
          suggestion: email.split('@')[0] + '@' + suggestion
        };
      }
    }

    return { valid: true };
  }

  validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('8자 이상');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자 1개 이상');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('소문자 1개 이상');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('숫자 1개 이상');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자 1개 이상');
    }

    if (errors.length > 0) {
      return { 
        valid: false, 
        message: `필요: ${errors.join(', ')}` 
      };
    }

    return { valid: true };
  }

  validateRequired(value) {
    if (!value || value.trim().length === 0) {
      return { valid: false, message: '필수 입력 항목입니다' };
    }
    return { valid: true };
  }

  validateUsername(username) {
    if (username.length < 3) {
      return { valid: false, message: '3자 이상이어야 합니다' };
    }

    if (username.length > 20) {
      return { valid: false, message: '20자 이하여야 합니다' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { valid: false, message: '영문, 숫자, _, - 만 사용 가능합니다' };
    }

    return { valid: true };
  }

  validatePhone(phone) {
    // Korean phone number format
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { valid: false, message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)' };
    }

    return { valid: true };
  }

  validateURL(url) {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, message: '올바른 URL 형식이 아닙니다 (예: https://example.com)' };
    }
  }

  showPasswordStrength(input) {
    const password = input.value;
    const strengthContainer = input.parentElement.querySelector('.password-strength') || this.createPasswordStrengthIndicator(input);
    
    let strength = 0;
    let label = '약함';
    let color = 'bg-red-500';

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength >= 4) {
      label = '강함';
      color = 'bg-green-500';
    } else if (strength >= 3) {
      label = '보통';
      color = 'bg-yellow-500';
    }

    const percentage = (strength / 5) * 100;
    
    strengthContainer.innerHTML = `
      <div class="flex items-center justify-between text-xs mt-1">
        <span class="text-gray-600">비밀번호 강도: <span class="font-semibold ${color.replace('bg-', 'text-')}">${label}</span></span>
        <span class="text-gray-500">${strength}/5</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div class="${color} h-1.5 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
      </div>
      <ul class="text-xs text-gray-600 mt-2 space-y-1">
        <li class="${password.length >= 8 ? 'text-green-600' : ''}">
          ${password.length >= 8 ? '✓' : '○'} 8자 이상
        </li>
        <li class="${/[A-Z]/.test(password) ? 'text-green-600' : ''}">
          ${/[A-Z]/.test(password) ? '✓' : '○'} 대문자 1개 이상
        </li>
        <li class="${/[0-9]/.test(password) ? 'text-green-600' : ''}">
          ${/[0-9]/.test(password) ? '✓' : '○'} 숫자 1개 이상
        </li>
        <li class="${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}">
          ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} 특수문자 1개 이상
        </li>
      </ul>
    `;
  }

  createPasswordStrengthIndicator(input) {
    const container = document.createElement('div');
    container.className = 'password-strength mt-2';
    input.parentElement.appendChild(container);
    return container;
  }

  async checkEmailAvailability(input) {
    const email = input.value.trim();
    
    if (!email || !this.validateEmail(email).valid) {
      return;
    }

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.available) {
        this.showError(input, '이미 사용 중인 이메일입니다');
      } else {
        this.showSuccess(input, '사용 가능한 이메일입니다');
      }
    } catch (error) {
      console.error('Email check failed:', error);
    }
  }

  showError(input, message) {
    // Remove existing feedback
    this.clearFeedback(input);

    // Add error styling
    input.classList.add('border-red-500', 'focus:ring-red-500');
    input.classList.remove('border-green-500', 'focus:ring-green-500');

    // Create error message
    const errorEl = document.createElement('p');
    errorEl.className = 'validation-error text-red-600 text-sm mt-1';
    errorEl.textContent = message;
    
    input.parentElement.appendChild(errorEl);

    // Add error icon
    const icon = document.createElement('span');
    icon.className = 'validation-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500';
    icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    
    if (input.parentElement.style.position !== 'relative') {
      input.parentElement.style.position = 'relative';
    }
    input.parentElement.appendChild(icon);
  }

  showSuccess(input, message) {
    // Remove existing feedback
    this.clearFeedback(input);

    // Add success styling
    input.classList.add('border-green-500', 'focus:ring-green-500');
    input.classList.remove('border-red-500', 'focus:ring-red-500');

    // Add success icon
    const icon = document.createElement('span');
    icon.className = 'validation-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500';
    icon.innerHTML = '<i class="fas fa-check-circle"></i>';
    
    if (input.parentElement.style.position !== 'relative') {
      input.parentElement.style.position = 'relative';
    }
    input.parentElement.appendChild(icon);

    // Optional success message
    if (message) {
      const successEl = document.createElement('p');
      successEl.className = 'validation-success text-green-600 text-sm mt-1';
      successEl.textContent = message;
      input.parentElement.appendChild(successEl);
    }
  }

  clearError(input) {
    this.clearFeedback(input);
    input.classList.remove('border-red-500', 'focus:ring-red-500', 'border-green-500', 'focus:ring-green-500');
  }

  clearFeedback(input) {
    const errorEl = input.parentElement.querySelector('.validation-error');
    const successEl = input.parentElement.querySelector('.validation-success');
    const icon = input.parentElement.querySelector('.validation-icon');

    if (errorEl) errorEl.remove();
    if (successEl) successEl.remove();
    if (icon) icon.remove();
  }

  suggestEmailDomain(domain, commonDomains) {
    // Simple Levenshtein distance for typo suggestion
    let minDistance = Infinity;
    let suggestion = null;

    for (const common of commonDomains) {
      const distance = this.levenshteinDistance(domain, common);
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        suggestion = common;
      }
    }

    return suggestion;
  }

  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  debounce(func, delay, id) {
    if (this.debounceTimers.has(id)) {
      clearTimeout(this.debounceTimers.get(id));
    }

    const timer = setTimeout(func, delay);
    this.debounceTimers.set(id, timer);
  }

  // Validate entire form
  validateForm(formElement) {
    const inputs = formElement.querySelectorAll('[data-validate]');
    let isValid = true;

    inputs.forEach(input => {
      const type = input.dataset.validate;
      const required = input.hasAttribute('required') || input.dataset.required === 'true';
      
      if (!this.validateInput(input, type, required)) {
        isValid = false;
      }
    });

    return isValid;
  }
}

// Initialize - only if not already initialized
if (!window.formValidation) {
  window.formValidation = new FormValidation();
  console.log('✅ FormValidation initialized');
}

// Store class globally for future reference
window.FormValidation = FormValidation;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidation;
}

})(); // End of IIFE to prevent duplicate loading
