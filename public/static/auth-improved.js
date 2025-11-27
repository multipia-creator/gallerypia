/**
 * Improved Authentication System
 * 
 * Features:
 * - Real-time validation
 * - Password strength meter
 * - Show/hide password toggle
 * - Loading states
 * - Better error handling
 * - Accessibility improvements
 * - Security enhancements
 */

// ====================================
// Password Strength Calculator
// ====================================

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '', feedback: [] }
  
  let score = 0
  const feedback = []
  
  // Length check
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  else if (password.length < 8) feedback.push('최소 8자 이상 필요')
  
  // Character variety
  if (/[a-z]/.test(password)) score += 10
  else feedback.push('소문자 필요')
  
  if (/[A-Z]/.test(password)) score += 10
  else feedback.push('대문자 필요')
  
  if (/[0-9]/.test(password)) score += 10
  else feedback.push('숫자 필요')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
  else feedback.push('특수문자 필요')
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
    feedback.push('반복 문자 피하기')
  }
  
  if (/^(password|12345678|qwerty)/i.test(password)) {
    score -= 20
    feedback.push('일반적인 비밀번호 피하기')
  }
  
  // Bonus for mixed case and symbols
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
    score += 15
  }
  
  // Normalize score
  score = Math.max(0, Math.min(100, score))
  
  // Determine strength
  let label, color
  if (score < 40) {
    label = '약함'
    color = 'red'
  } else if (score < 70) {
    label = '보통'
    color = 'yellow'
  } else {
    label = '강함'
    color = 'green'
  }
  
  return { score, label, color, feedback }
}

function updatePasswordStrength(password, strengthElementId) {
  const strengthEl = document.getElementById(strengthElementId)
  if (!strengthEl) return
  
  const { score, label, color, feedback } = calculatePasswordStrength(password)
  
  const colors = {
    red: { bg: 'bg-red-500', text: 'text-red-700' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-700' },
    green: { bg: 'bg-green-500', text: 'text-green-700' }
  }
  
  const colorClasses = colors[color] || colors.red
  
  strengthEl.innerHTML = `
    <div class="mt-2">
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium ${colorClasses.text}">비밀번호 강도: ${label}</span>
        <span class="text-xs text-gray-500">${score}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="${colorClasses.bg} h-2 rounded-full transition-all duration-300" 
             style="width: ${score}%"
             role="progressbar" 
             aria-valuenow="${score}" 
             aria-valuemin="0" 
             aria-valuemax="100"></div>
      </div>
      ${feedback.length > 0 ? `
        <div class="mt-1 text-xs text-gray-600">
          <ul class="list-disc list-inside">
            ${feedback.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `
}

// ====================================
// Password Toggle Visibility
// ====================================

function createPasswordToggle(inputId) {
  const input = document.getElementById(inputId)
  if (!input) return
  
  const wrapper = input.parentElement
  if (!wrapper) return
  
  // Remove existing toggle if present
  const existingToggle = wrapper.querySelector('.password-toggle')
  if (existingToggle) existingToggle.remove()
  
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
  toggle.setAttribute('aria-label', '비밀번호 표시/숨김')
  toggle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  `
  
  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password'
    input.type = isPassword ? 'text' : 'password'
    
    const eyeOpen = toggle.querySelector('.eye-open')
    const eyeClosed = toggle.querySelector('.eye-closed')
    
    if (eyeOpen && eyeClosed) {
      eyeOpen.classList.toggle('hidden')
      eyeClosed.classList.toggle('hidden')
    }
    
    toggle.setAttribute('aria-label', isPassword ? '비밀번호 숨기기' : '비밀번호 표시')
  })
  
  wrapper.style.position = 'relative'
  wrapper.appendChild(toggle)
}

// ====================================
// Real-time Email Validation
// ====================================

async function validateEmailRealtime(email, feedbackElementId) {
  const feedbackEl = document.getElementById(feedbackElementId)
  if (!feedbackEl) return
  
  // Clear previous feedback
  feedbackEl.innerHTML = ''
  
  if (!email) return
  
  // Basic format check
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!emailRegex.test(email)) {
    feedbackEl.innerHTML = `
      <p class="text-sm text-red-600 mt-1">
        <i class="fas fa-exclamation-circle mr-1"></i>
        올바른 이메일 형식이 아닙니다
      </p>
    `
    return
  }
  
  // Check for duplicate email
  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
    const data = await response.json()
    
    if (data.exists) {
      feedbackEl.innerHTML = `
        <p class="text-sm text-red-600 mt-1">
          <i class="fas fa-exclamation-circle mr-1"></i>
          이미 사용 중인 이메일입니다
        </p>
      `
    } else {
      feedbackEl.innerHTML = `
        <p class="text-sm text-green-600 mt-1">
          <i class="fas fa-check-circle mr-1"></i>
          사용 가능한 이메일입니다
        </p>
      `
    }
  } catch (error) {
    console.error('Email validation error:', error)
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ====================================
// Form Validation
// ====================================

function validateForm(formId) {
  const form = document.getElementById(formId)
  if (!form) return false
  
  const inputs = form.querySelectorAll('input[required], select[required]')
  let isValid = true
  
  inputs.forEach(input => {
    const value = input.value.trim()
    const feedbackEl = input.parentElement.querySelector('.validation-feedback')
    
    if (!value) {
      isValid = false
      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <p class="text-sm text-red-600 mt-1">
            <i class="fas fa-exclamation-circle mr-1"></i>
            필수 입력 항목입니다
          </p>
        `
      }
      input.classList.add('border-red-500')
    } else {
      if (feedbackEl) feedbackEl.innerHTML = ''
      input.classList.remove('border-red-500')
    }
  })
  
  return isValid
}

// ====================================
// Enhanced Signup Handler
// ====================================

async function handleSignupImproved(event) {
  console.log('🔍 handleSignupImproved called')
  event.preventDefault()
  
  const form = event.target
  const submitButton = form.querySelector('button[type="submit"]')
  
  // Get form data using name attributes (not id)
  const formData = new FormData(form)
  const email = formData.get('email')?.trim().toLowerCase()
  const password = formData.get('password')
  const confirmPassword = formData.get('confirm_password')
  const fullName = formData.get('full_name')?.trim()
  const role = formData.get('role')
  const phone = formData.get('phone')?.replace(/-/g, '')
  
  console.log('📝 Form data:', { email, fullName, role, hasPassword: !!password })
  
  // Basic validation
  if (!email || !password || !fullName || !role) {
    console.log('❌ Validation failed: missing required fields')
    showError('모든 필수 항목을 입력해주세요')
    return
  }
  
  // Password match check
  if (password !== confirmPassword) {
    console.log('❌ Password mismatch')
    showError('비밀번호가 일치하지 않습니다')
    return
  }
  
  console.log('✅ Validation passed, checking password strength...')
  
  // Password strength check
  const { score } = calculatePasswordStrength(password)
  console.log(`🔒 Password strength score: ${score}`)
  if (score < 40) {
    console.log('❌ Password too weak')
    showError('비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요')
    return
  }
  
  console.log('🚀 Starting signup API request...')
  
  try {
    setFormLoading(form, submitButton, true, '가입 처리중...')
    
    const requestData = {
      email,
      password, // Send plain password to backend for proper bcrypt hashing
      full_name: fullName,
      role,
      phone
    }
    
    console.log('📤 Sending request to /api/auth/register')
    
    // Add organization fields if museum/gallery
    if (role === 'museum' || role === 'gallery') {
      requestData.organization_name = formData.get('organization_name')
      requestData.organization_type = formData.get('organization_type')
      requestData.organization_address = formData.get('organization_address')
      requestData.organization_website = formData.get('organization_website') || ''
      requestData.organization_contact_email = formData.get('organization_contact_email')
      requestData.organization_phone = formData.get('organization_phone')?.replace(/-/g, '')
      requestData.organization_description = formData.get('organization_description')
    }
    
    // W1-C1: Use new register endpoint
    const response = await axios.post('/api/auth/register', requestData)
    
    if (response.data.success) {
      showSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } else {
      showError(response.data.error || '회원가입에 실패했습니다')
    }
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error.response?.status === 429) {
      showError(error.response.data.error || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요')
    } else if (error.response?.data?.error) {
      showError(error.response.data.error)
    } else {
      showError('회원가입 중 오류가 발생했습니다')
    }
  } finally {
    setFormLoading(form, submitButton, false)
  }
}

// ====================================
// Enhanced Login Handler
// ====================================

async function handleLoginImproved(event) {
  event.preventDefault()
  
  const form = event.target
  const submitButton = form.querySelector('button[type="submit"]')
  
  const email = document.getElementById('email').value.trim().toLowerCase()
  const password = document.getElementById('password').value
  const rememberMe = document.getElementById('remember_me')?.checked || false
  
  if (!email || !password) {
    showError('이메일과 비밀번호를 모두 입력해주세요')
    return
  }
  
  try {
    setFormLoading(form, submitButton, true, '로그인 중...')
    
    const response = await axios.post('/api/auth/login', {
      email,
      password,
      remember_me: rememberMe
    })
    
    if (response.data.success && response.data.session_token) {
      // Store session token
      if (rememberMe) {
        localStorage.setItem('session_token', response.data.session_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        sessionStorage.setItem('session_token', response.data.session_token)
        sessionStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      showSuccess('로그인 성공!')
      
      // Role-based redirect
      const role = response.data.user?.role
      let redirectUrl = '/'
      
      if (role === 'artist') redirectUrl = '/dashboard/artist'
      else if (role === 'expert') redirectUrl = '/dashboard/expert'
      else if (role === 'museum' || role === 'gallery') redirectUrl = '/dashboard/museum'
      else if (role === 'admin') redirectUrl = '/admin/dashboard'
      
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1000)
    } else {
      showError(response.data.error || '로그인에 실패했습니다')
    }
  } catch (error) {
    console.error('Login error:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    
    if (error.response?.status === 429) {
      const retryAfter = error.response.data.retry_after || 900
      showError(`로그인 시도 횟수가 초과되었습니다. ${Math.ceil(retryAfter / 60)}분 후에 다시 시도해주세요`)
    } else if (error.response?.status === 401) {
      showError('이메일 또는 비밀번호가 올바르지 않습니다')
    } else if (error.response?.status === 423) {
      showError('계정이 일시적으로 잠겼습니다. 15분 후에 다시 시도해주세요')
    } else if (error.response?.data?.error) {
      showError(error.response.data.error)
    } else if (error.message) {
      showError(`로그인 중 오류가 발생했습니다: ${error.message}`)
    } else {
      showError('로그인 중 오류가 발생했습니다. Console을 확인해주세요.')
    }
  } finally {
    setFormLoading(form, submitButton, false)
  }
}

// ====================================
// Initialize Authentication Pages
// ====================================

function initAuthenticationSystem() {
  // Get form elements at the beginning
  const loginForm = document.getElementById('loginForm')
  const signupForm = document.getElementById('signupForm')
  const emailInput = document.getElementById('email')
  
  // Initialize password toggles
  const passwordFields = document.querySelectorAll('input[type="password"]')
  passwordFields.forEach(field => {
    if (field.id) createPasswordToggle(field.id)
  })
  
  // Initialize password strength meter
  const passwordInput = document.getElementById('password')
  if (passwordInput) {
    // Create strength meter element
    const strengthMeter = document.createElement('div')
    strengthMeter.id = 'password-strength'
    strengthMeter.setAttribute('aria-live', 'polite')
    passwordInput.parentElement.appendChild(strengthMeter)
    
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value, 'password-strength')
    })
  }
  
  // Initialize email validation (ONLY FOR SIGNUP PAGE)
  if (signupForm && emailInput) {
    // Create feedback element
    const feedbackEl = document.createElement('div')
    feedbackEl.id = 'email-feedback'
    feedbackEl.className = 'validation-feedback'
    feedbackEl.setAttribute('aria-live', 'polite')
    emailInput.parentElement.appendChild(feedbackEl)
    
    const debouncedValidation = debounce((email) => {
      validateEmailRealtime(email, 'email-feedback')
    }, 500)
    
    emailInput.addEventListener('input', (e) => {
      debouncedValidation(e.target.value.trim())
    })
    console.log('✅ Email validation enabled for signup page')
  }
  
  // Auto-format phone numbers
  const phoneInputs = document.querySelectorAll('input[type="tel"]')
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, '')
      if (value.length > 11) value = value.substring(0, 11)
      
      if (value.length > 6) {
        e.target.value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7)
      } else if (value.length > 3) {
        e.target.value = value.substring(0, 3) + '-' + value.substring(3)
      } else {
        e.target.value = value
      }
    })
  })
  
  // Connect login form - CRITICAL FIX
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginImproved)
    console.log('✅ Login form connected')
  }
  
  // Connect signup form - CRITICAL FIX
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      console.log('🎯 SUBMIT EVENT RECEIVED!')
      handleSignupImproved(e)
    })
    console.log('✅ Signup form connected')
  }
  
  console.log('✅ Enhanced Authentication System Initialized')
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthenticationSystem)
} else {
  initAuthenticationSystem()
}
