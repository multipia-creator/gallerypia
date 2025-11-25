/**
 * Validation Utilities
 * 
 * Provides reusable validation functions for GalleryPia platform
 * Addresses UX-H-002: Inconsistent Form Validation Feedback
 * 
 * Features:
 * - Common validation rules (email, password, phone, etc.)
 * - Real-time validation on blur
 * - Form-level error summary
 * - Accessible error messages (ARIA)
 * - Korean/English error messages
 * 
 * @module validation-utils
 */

// ====================================
// Validation Rules
// ====================================

/**
 * Validation rule functions
 * Each returns null if valid, or error message if invalid
 */
const ValidationRules = {
  /**
   * Required field validation
   */
  required: (value, fieldName = '필드') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName}은(는) 필수 항목입니다.`;
    }
    return null;
  },

  /**
   * Email validation
   */
  email: (value) => {
    if (!value) return null; // Skip if empty (use required separately)
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다. (예: user@example.com)';
    }
    return null;
  },

  /**
   * Password validation
   */
  password: (value, minLength = 8) => {
    if (!value) return null;
    
    if (value.length < minLength) {
      return `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`;
    }
    
    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
    }
    
    return null;
  },

  /**
   * Strong password validation
   */
  strongPassword: (value) => {
    if (!value) return null;
    
    if (value.length < 10) {
      return '비밀번호는 최소 10자 이상이어야 합니다.';
    }
    
    const checks = {
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    if (passedChecks < 3) {
      return '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
    }
    
    return null;
  },

  /**
   * Password confirmation validation
   */
  passwordMatch: (value, originalPassword) => {
    if (!value) return null;
    
    if (value !== originalPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  },

  /**
   * Phone number validation (Korean format)
   */
  phone: (value) => {
    if (!value) return null;
    
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Check for valid Korean phone number patterns
    const patterns = [
      /^010\d{8}$/,  // 010-XXXX-XXXX
      /^02\d{7,8}$/,  // 02-XXX(X)-XXXX
      /^0[3-9]\d{8,9}$/  // Other area codes
    ];
    
    if (!patterns.some(pattern => pattern.test(cleaned))) {
      return '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
    }
    
    return null;
  },

  /**
   * URL validation
   */
  url: (value) => {
    if (!value) return null;
    
    try {
      new URL(value);
      return null;
    } catch (e) {
      return '올바른 URL 형식이 아닙니다. (예: https://example.com)';
    }
  },

  /**
   * Number validation
   */
  number: (value, min = null, max = null) => {
    if (!value) return null;
    
    const num = Number(value);
    
    if (isNaN(num)) {
      return '숫자를 입력해주세요.';
    }
    
    if (min !== null && num < min) {
      return `${min} 이상의 숫자를 입력해주세요.`;
    }
    
    if (max !== null && num > max) {
      return `${max} 이하의 숫자를 입력해주세요.`;
    }
    
    return null;
  },

  /**
   * Integer validation
   */
  integer: (value) => {
    if (!value) return null;
    
    if (!Number.isInteger(Number(value))) {
      return '정수를 입력해주세요.';
    }
    
    return null;
  },

  /**
   * Min length validation
   */
  minLength: (value, length, fieldName = '입력값') => {
    if (!value) return null;
    
    if (value.length < length) {
      return `${fieldName}은(는) 최소 ${length}자 이상이어야 합니다.`;
    }
    
    return null;
  },

  /**
   * Max length validation
   */
  maxLength: (value, length, fieldName = '입력값') => {
    if (!value) return null;
    
    if (value.length > length) {
      return `${fieldName}은(는) 최대 ${length}자까지 입력 가능합니다.`;
    }
    
    return null;
  },

  /**
   * Pattern validation
   */
  pattern: (value, pattern, message = '올바른 형식이 아닙니다.') => {
    if (!value) return null;
    
    if (!pattern.test(value)) {
      return message;
    }
    
    return null;
  },

  /**
   * Date validation
   */
  date: (value) => {
    if (!value) return null;
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '올바른 날짜 형식이 아닙니다.';
    }
    
    return null;
  },

  /**
   * Future date validation
   */
  futureDate: (value) => {
    if (!value) return null;
    
    const date = new Date(value);
    const now = new Date();
    
    if (date <= now) {
      return '미래 날짜를 선택해주세요.';
    }
    
    return null;
  },

  /**
   * Past date validation
   */
  pastDate: (value) => {
    if (!value) return null;
    
    const date = new Date(value);
    const now = new Date();
    
    if (date >= now) {
      return '과거 날짜를 선택해주세요.';
    }
    
    return null;
  },

  /**
   * File size validation (in bytes)
   */
  fileSize: (file, maxSize) => {
    if (!file) return null;
    
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `파일 크기는 최대 ${maxMB}MB까지 업로드 가능합니다.`;
    }
    
    return null;
  },

  /**
   * File type validation
   */
  fileType: (file, allowedTypes) => {
    if (!file) return null;
    
    const fileType = file.type;
    
    if (!allowedTypes.includes(fileType)) {
      return `허용되지 않는 파일 형식입니다. (허용: ${allowedTypes.join(', ')})`;
    }
    
    return null;
  }
};

// ====================================
// Field Validation
// ====================================

/**
 * Validate a single field
 * @param {string|HTMLElement} fieldSelector - Field selector or element
 * @param {Array} rules - Array of validation rules
 * @returns {boolean} - True if valid, false if invalid
 * 
 * @example
 * validateField('#email', [
 *   { rule: 'required', params: ['이메일'] },
 *   { rule: 'email' }
 * ])
 */
function validateField(fieldSelector, rules = []) {
  const field = typeof fieldSelector === 'string' 
    ? document.querySelector(fieldSelector) 
    : fieldSelector;
    
  if (!field) {
    console.warn('validateField: field not found', fieldSelector);
    return false;
  }

  const value = field.value;
  
  // Clear previous errors
  if (window.ErrorUtils && window.ErrorUtils.hideFieldError) {
    window.ErrorUtils.hideFieldError(field);
  }

  // Run validation rules
  for (const ruleConfig of rules) {
    const ruleName = ruleConfig.rule;
    const ruleParams = ruleConfig.params || [];
    const rule = ValidationRules[ruleName];
    
    if (!rule) {
      console.warn(`validateField: unknown rule "${ruleName}"`);
      continue;
    }

    const error = rule(value, ...ruleParams);
    
    if (error) {
      // Show error using ErrorUtils if available
      if (window.ErrorUtils && window.ErrorUtils.showFieldError) {
        window.ErrorUtils.showFieldError(field, error);
      } else {
        // Fallback: console log
        console.error(`Validation error for ${field.id || field.name}: ${error}`);
      }
      return false;
    }
  }

  return true;
}

/**
 * Validate multiple fields
 * @param {Object} fieldRules - Object mapping field selectors to validation rules
 * @returns {Object} - { valid: boolean, errors: Object }
 * 
 * @example
 * const result = validateFields({
 *   '#email': [{ rule: 'required' }, { rule: 'email' }],
 *   '#password': [{ rule: 'required' }, { rule: 'password', params: [8] }]
 * })
 */
function validateFields(fieldRules) {
  const errors = {};
  let allValid = true;

  for (const [fieldSelector, rules] of Object.entries(fieldRules)) {
    const isValid = validateField(fieldSelector, rules);
    
    if (!isValid) {
      allValid = false;
      errors[fieldSelector] = true;
    }
  }

  return {
    valid: allValid,
    errors
  };
}

// ====================================
// Form Validation
// ====================================

/**
 * Validate entire form
 * @param {string|HTMLFormElement} formSelector - Form selector or element
 * @param {Object} fieldRules - Object mapping field selectors to validation rules
 * @returns {Object} - { valid: boolean, errors: Object, summary: string }
 */
function validateForm(formSelector, fieldRules) {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;
    
  if (!form) {
    console.warn('validateForm: form not found', formSelector);
    return { valid: false, errors: {}, summary: '' };
  }

  const result = validateFields(fieldRules);
  
  // Create error summary
  if (!result.valid) {
    const errorCount = Object.keys(result.errors).length;
    result.summary = `${errorCount}개의 입력 오류가 있습니다. 오류를 수정해주세요.`;
    
    // Show summary at top of form if ErrorUtils available
    if (window.ErrorUtils && window.ErrorUtils.showInlineError) {
      window.ErrorUtils.showInlineError(form, result.summary, 'error');
      
      // Scroll to first error
      const firstErrorField = form.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
    }
  } else {
    // Hide summary on success
    if (window.ErrorUtils && window.ErrorUtils.hideInlineError) {
      window.ErrorUtils.hideInlineError(form);
    }
  }

  return result;
}

// ====================================
// Real-time Validation
// ====================================

/**
 * Enable real-time validation on blur
 * @param {string|HTMLElement} fieldSelector - Field selector or element
 * @param {Array} rules - Validation rules
 */
function enableRealtimeValidation(fieldSelector, rules) {
  const field = typeof fieldSelector === 'string' 
    ? document.querySelector(fieldSelector) 
    : fieldSelector;
    
  if (!field) {
    console.warn('enableRealtimeValidation: field not found', fieldSelector);
    return;
  }

  // Validate on blur
  field.addEventListener('blur', () => {
    validateField(field, rules);
  });

  // Clear error on input (but don't validate yet)
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') {
      if (window.ErrorUtils && window.ErrorUtils.hideFieldError) {
        window.ErrorUtils.hideFieldError(field);
      }
    }
  });
}

/**
 * Enable real-time validation for entire form
 * @param {string|HTMLFormElement} formSelector - Form selector or element
 * @param {Object} fieldRules - Object mapping field selectors to validation rules
 */
function enableFormRealtimeValidation(formSelector, fieldRules) {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;
    
  if (!form) {
    console.warn('enableFormRealtimeValidation: form not found', formSelector);
    return;
  }

  for (const [fieldSelector, rules] of Object.entries(fieldRules)) {
    // Try to find field within form first
    let field = form.querySelector(fieldSelector);
    
    // If not found, try global selector
    if (!field) {
      field = document.querySelector(fieldSelector);
    }
    
    if (field) {
      enableRealtimeValidation(field, rules);
    }
  }
}

// ====================================
// Common Validation Presets
// ====================================

/**
 * Common validation rule sets for reuse
 */
const ValidationPresets = {
  email: [
    { rule: 'required', params: ['이메일'] },
    { rule: 'email' }
  ],
  
  password: [
    { rule: 'required', params: ['비밀번호'] },
    { rule: 'password', params: [8] }
  ],
  
  strongPassword: [
    { rule: 'required', params: ['비밀번호'] },
    { rule: 'strongPassword' }
  ],
  
  passwordConfirm: (originalPasswordSelector) => [
    { rule: 'required', params: ['비밀번호 확인'] },
    { 
      rule: 'custom', 
      validator: (value) => {
        const originalPassword = document.querySelector(originalPasswordSelector)?.value;
        return ValidationRules.passwordMatch(value, originalPassword);
      }
    }
  ],
  
  phone: [
    { rule: 'required', params: ['전화번호'] },
    { rule: 'phone' }
  ],
  
  username: [
    { rule: 'required', params: ['사용자 이름'] },
    { rule: 'minLength', params: [3, '사용자 이름'] },
    { rule: 'maxLength', params: [20, '사용자 이름'] }
  ],
  
  title: [
    { rule: 'required', params: ['제목'] },
    { rule: 'minLength', params: [2, '제목'] },
    { rule: 'maxLength', params: [200, '제목'] }
  ],
  
  description: [
    { rule: 'maxLength', params: [2000, '설명'] }
  ],
  
  url: [
    { rule: 'url' }
  ],
  
  price: [
    { rule: 'required', params: ['가격'] },
    { rule: 'number', params: [0, null] }
  ]
};

// ====================================
// Export for use in other scripts
// ====================================

if (typeof window !== 'undefined') {
  window.ValidationUtils = {
    // Rules
    ValidationRules,
    
    // Validation functions
    validateField,
    validateFields,
    validateForm,
    
    // Real-time validation
    enableRealtimeValidation,
    enableFormRealtimeValidation,
    
    // Presets
    ValidationPresets
  };
}

console.log('✅ Validation Utils initialized');
