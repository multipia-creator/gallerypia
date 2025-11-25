/**
 * ============================================
 * 🎯 P1: 회원가입 페이지 전수 개선
 * ============================================
 * 1. 이메일 중복확인 버튼 기능 구현
 * 2. 비밀번호 보이기/감추기 버튼
 * 3. 비밀번호 유효성 실시간 검증
 * 4. 뮤지엄/갤러리 주소 검색 및 자동입력 (Kakao Address API)
 * 5. 웹사이트 https:// 자동 추가
 * 6. 기관 이메일 중복 확인
 */

document.addEventListener('DOMContentLoaded', () => {
  initSignupEnhancements();
});

function initSignupEnhancements() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;
  
  console.log('✅ Signup enhancements initializing...');
  
  // 1. 이메일 중복확인 버튼 추가
  addEmailDuplicateCheck();
  
  // 2. 비밀번호 보이기/감추기 버튼
  addPasswordToggle();
  
  // 3. 비밀번호 유효성 실시간 검증
  addPasswordValidation();
  
  // 4. 웹사이트 https:// 자동 추가
  addWebsiteAutoProtocol();
  
  // 5. 조직 정보 필드 개선 (주소 검색, 기관 이메일 중복 확인)
  enhanceOrganizationFields();
  
  console.log('✅ Signup enhancements initialized');
}

// ============================================
// 1. 이메일 중복확인
// ============================================
function addEmailDuplicateCheck() {
  const emailInput = document.querySelector('input[name="email"]');
  if (!emailInput) return;
  
  const container = emailInput.parentElement;
  
  // 중복확인 버튼 추가
  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.className = 'absolute right-2 top-9 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors';
  checkButton.innerHTML = '<i class="fas fa-check mr-1"></i>중복확인';
  checkButton.onclick = async () => await checkEmailDuplicate(emailInput, checkButton);
  
  // Container를 relative로 설정
  container.style.position = 'relative';
  emailInput.style.paddingRight = '110px';
  container.appendChild(checkButton);
  
  // 상태 메시지 표시 영역
  const statusDiv = document.createElement('div');
  statusDiv.id = 'email-status';
  statusDiv.className = 'text-sm mt-1';
  container.appendChild(statusDiv);
  
  // 이메일 입력 시 상태 초기화
  emailInput.addEventListener('input', () => {
    emailInput.dataset.checked = 'false';
    statusDiv.textContent = '';
    statusDiv.className = 'text-sm mt-1';
  });
}

async function checkEmailDuplicate(input, button) {
  const email = input.value.trim();
  const statusDiv = document.getElementById('email-status');
  
  if (!email) {
    statusDiv.textContent = '⚠️ 이메일을 입력해주세요';
    statusDiv.className = 'text-sm mt-1 text-yellow-400';
    return;
  }
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    statusDiv.textContent = '❌ 올바른 이메일 형식이 아닙니다';
    statusDiv.className = 'text-sm mt-1 text-red-400';
    return;
  }
  
  try {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>확인 중...';
    
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (data.success) {
      if (data.available) {
        statusDiv.textContent = '✅ 사용 가능한 이메일입니다';
        statusDiv.className = 'text-sm mt-1 text-green-400';
        input.dataset.checked = 'true';
      } else {
        statusDiv.textContent = '❌ 이미 사용 중인 이메일입니다';
        statusDiv.className = 'text-sm mt-1 text-red-400';
        input.dataset.checked = 'false';
      }
    } else {
      throw new Error(data.error || '확인 실패');
    }
  } catch (error) {
    console.error('Email check error:', error);
    statusDiv.textContent = '⚠️ 확인 중 오류가 발생했습니다';
    statusDiv.className = 'text-sm mt-1 text-yellow-400';
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-check mr-1"></i>중복확인';
  }
}

// ============================================
// 2. 비밀번호 보이기/감추기
// ============================================
function addPasswordToggle() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach(input => {
    const container = input.parentElement;
    container.style.position = 'relative';
    
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'absolute right-3 top-10 text-gray-400 hover:text-white transition-colors';
    toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    
    toggleButton.onclick = () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleButton.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    };
    
    container.appendChild(toggleButton);
    input.style.paddingRight = '3rem';
  });
}

// ============================================
// 3. 비밀번호 유효성 실시간 검증
// ============================================
function addPasswordValidation() {
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmInput = document.querySelector('input[name="confirm_password"]');
  
  if (!passwordInput) return;
  
  // 비밀번호 요구사항 표시
  const requirements = document.createElement('div');
  requirements.className = 'mt-2 space-y-1 text-xs';
  requirements.innerHTML = `
    <div class="flex items-center gap-2">
      <i id="pw-length" class="fas fa-circle text-gray-600"></i>
      <span class="text-gray-400">8자 이상</span>
    </div>
    <div class="flex items-center gap-2">
      <i id="pw-upper" class="fas fa-circle text-gray-600"></i>
      <span class="text-gray-400">대문자 1개 이상</span>
    </div>
    <div class="flex items-center gap-2">
      <i id="pw-lower" class="fas fa-circle text-gray-600"></i>
      <span class="text-gray-400">소문자 1개 이상</span>
    </div>
    <div class="flex items-center gap-2">
      <i id="pw-number" class="fas fa-circle text-gray-600"></i>
      <span class="text-gray-400">숫자 1개 이상</span>
    </div>
    <div class="flex items-center gap-2">
      <i id="pw-special" class="fas fa-circle text-gray-600"></i>
      <span class="text-gray-400">특수문자 1개 이상</span>
    </div>
  `;
  passwordInput.parentElement.appendChild(requirements);
  
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    // 길이
    const hasLength = password.length >= 8;
    updateRequirement('pw-length', hasLength);
    
    // 대문자
    const hasUpper = /[A-Z]/.test(password);
    updateRequirement('pw-upper', hasUpper);
    
    // 소문자
    const hasLower = /[a-z]/.test(password);
    updateRequirement('pw-lower', hasLower);
    
    // 숫자
    const hasNumber = /\d/.test(password);
    updateRequirement('pw-number', hasNumber);
    
    // 특수문자
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    updateRequirement('pw-special', hasSpecial);
    
    // 비밀번호 확인 검증
    if (confirmInput && confirmInput.value) {
      validatePasswordMatch();
    }
  });
  
  if (confirmInput) {
    const matchStatus = document.createElement('div');
    matchStatus.id = 'password-match-status';
    matchStatus.className = 'text-sm mt-1';
    confirmInput.parentElement.appendChild(matchStatus);
    
    confirmInput.addEventListener('input', validatePasswordMatch);
  }
  
  function updateRequirement(id, valid) {
    const icon = document.getElementById(id);
    if (!icon) return;
    
    if (valid) {
      icon.className = 'fas fa-check-circle text-green-400';
    } else {
      icon.className = 'fas fa-circle text-gray-600';
    }
  }
  
  function validatePasswordMatch() {
    const matchStatus = document.getElementById('password-match-status');
    if (!matchStatus) return;
    
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    if (!confirm) {
      matchStatus.textContent = '';
      return;
    }
    
    if (password === confirm) {
      matchStatus.textContent = '✅ 비밀번호가 일치합니다';
      matchStatus.className = 'text-sm mt-1 text-green-400';
    } else {
      matchStatus.textContent = '❌ 비밀번호가 일치하지 않습니다';
      matchStatus.className = 'text-sm mt-1 text-red-400';
    }
  }
}

// ============================================
// 4. 웹사이트 https:// 자동 추가
// ============================================
function addWebsiteAutoProtocol() {
  // 초기 렌더링 시에는 organization_website가 없을 수 있으므로
  // MutationObserver를 사용하여 필드가 추가될 때 리스너 연결
  const observer = new MutationObserver(() => {
    const websiteInput = document.getElementById('organization_website');
    if (websiteInput && !websiteInput.dataset.protocolAdded) {
      websiteInput.dataset.protocolAdded = 'true';
      
      websiteInput.addEventListener('blur', () => {
        let value = websiteInput.value.trim();
        if (value && !value.match(/^https?:\/\//i)) {
          websiteInput.value = 'https://' + value;
        }
      });
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// ============================================
// 5. 조직 정보 필드 개선
// ============================================
function enhanceOrganizationFields() {
  // MutationObserver로 조직 정보 필드 감지
  const observer = new MutationObserver(() => {
    const orgFields = document.getElementById('museum-gallery-fields');
    if (orgFields && !orgFields.dataset.enhanced) {
      orgFields.dataset.enhanced = 'true';
      
      // 주소 검색 버튼 추가
      addAddressSearch();
      
      // 기관 이메일 중복확인 버튼 추가
      addOrganizationEmailCheck();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 페이지 로드 시에도 즉시 확인
  setTimeout(() => {
    const orgFields = document.getElementById('museum-gallery-fields');
    if (orgFields && !orgFields.dataset.enhanced) {
      orgFields.dataset.enhanced = 'true';
      addAddressSearch();
      addOrganizationEmailCheck();
    }
  }, 500);
}

function addAddressSearch() {
  const addressInput = document.getElementById('organization_address');
  if (!addressInput) return;
  
  const container = addressInput.parentElement;
  container.style.position = 'relative';
  
  // 주소 검색 버튼
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'absolute right-2 top-8 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors';
  searchButton.innerHTML = '<i class="fas fa-search mr-1"></i>주소 검색';
  searchButton.onclick = () => openAddressSearch(addressInput);
  
  addressInput.style.paddingRight = '110px';
  container.appendChild(searchButton);
  
  // 상세주소 입력란 추가
  const detailAddressDiv = document.createElement('div');
  detailAddressDiv.className = 'mt-2';
  detailAddressDiv.innerHTML = `
    <input type="text" id="organization_address_detail" 
           placeholder="상세주소 (동/호수 등)"
           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
  `;
  container.appendChild(detailAddressDiv);
}

function openAddressSearch(addressInput) {
  // Kakao 주소 API가 로드되어 있지 않으면 간단한 입력 방식 제공
  if (typeof daum === 'undefined' || !daum.Postcode) {
    // Kakao Address API 스크립트 동적 로드
    if (!document.getElementById('kakao-postcode-script')) {
      const script = document.createElement('script');
      script.id = 'kakao-postcode-script';
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        openAddressSearch(addressInput);
      };
      document.head.appendChild(script);
      return;
    }
    
    // 로딩 중인 경우
    if (typeof showInfoToast === 'function') {
      showInfoToast('주소 검색 API를 로드하는 중입니다...');
    }
    return;
  }
  
  new daum.Postcode({
    oncomplete: function(data) {
      // 도로명 주소 또는 지번 주소 사용
      const fullAddress = data.roadAddress || data.jibunAddress;
      addressInput.value = fullAddress;
      
      // 상세주소 입력란으로 포커스 이동
      const detailInput = document.getElementById('organization_address_detail');
      if (detailInput) {
        detailInput.focus();
      }
      
      if (typeof showSuccessToast === 'function') {
        showSuccessToast('주소가 입력되었습니다');
      }
    }
  }).open();
}

function addOrganizationEmailCheck() {
  const emailInput = document.getElementById('organization_contact_email');
  if (!emailInput) return;
  
  const container = emailInput.parentElement;
  
  // 이미 버튼이 있으면 중복 추가하지 않음
  if (emailInput.dataset.checkButtonAdded === 'true') return;
  emailInput.dataset.checkButtonAdded = 'true';
  
  // 중복확인 버튼 추가
  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.id = 'org-email-check-btn';
  checkButton.className = 'absolute right-2 top-9 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors';
  checkButton.innerHTML = '<i class="fas fa-check mr-1"></i>중복확인';
  checkButton.onclick = async () => await checkOrganizationEmail(emailInput, checkButton);
  
  // Container를 relative로 설정
  container.style.position = 'relative';
  emailInput.style.paddingRight = '110px';
  container.appendChild(checkButton);
  
  // 상태 메시지 표시 영역
  const statusDiv = document.createElement('div');
  statusDiv.id = 'org-email-status';
  statusDiv.className = 'text-sm mt-1';
  container.appendChild(statusDiv);
  
  // 이메일 입력 시 상태 초기화
  emailInput.addEventListener('input', () => {
    emailInput.dataset.checked = 'false';
    statusDiv.textContent = '';
    statusDiv.className = 'text-sm mt-1';
  });
}

async function checkOrganizationEmail(input, button) {
  const email = input.value.trim();
  const statusDiv = document.getElementById('org-email-status');
  
  if (!statusDiv) return;
  
  if (!email) {
    statusDiv.textContent = '⚠️ 기관 이메일을 입력해주세요';
    statusDiv.className = 'text-sm mt-1 text-yellow-400';
    return;
  }
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    statusDiv.textContent = '❌ 올바른 이메일 형식이 아닙니다';
    statusDiv.className = 'text-sm mt-1 text-red-400';
    return;
  }
  
  try {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>확인 중...';
    
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (data.success) {
      if (data.available) {
        statusDiv.textContent = '✅ 사용 가능한 이메일입니다';
        statusDiv.className = 'text-sm mt-1 text-green-400';
        input.dataset.checked = 'true';
      } else {
        statusDiv.textContent = '❌ 이미 사용 중인 이메일입니다';
        statusDiv.className = 'text-sm mt-1 text-red-400';
        input.dataset.checked = 'false';
      }
    } else {
      throw new Error(data.error || '확인 실패');
    }
  } catch (error) {
    console.error('Organization email check error:', error);
    statusDiv.textContent = '⚠️ 확인 중 오류가 발생했습니다';
    statusDiv.className = 'text-sm mt-1 text-yellow-400';
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-check mr-1"></i>중복확인';
  }
}

// ============================================
// Form Submission Validation
// ============================================
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.id !== 'signupForm') return;
  
  // 이메일 중복확인 검증
  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput && emailInput.dataset.checked !== 'true') {
    e.preventDefault();
    if (typeof showErrorToast === 'function') {
      showErrorToast('이메일 중복확인을 해주세요');
    } else {
      alert('이메일 중복확인을 해주세요');
    }
    emailInput.focus();
    return;
  }
  
  // 비밀번호 일치 검증
  const password = form.querySelector('input[name="password"]')?.value;
  const confirmPassword = form.querySelector('input[name="confirm_password"]')?.value;
  
  if (password !== confirmPassword) {
    e.preventDefault();
    if (typeof showErrorToast === 'function') {
      showErrorToast('비밀번호가 일치하지 않습니다');
    } else {
      alert('비밀번호가 일치하지 않습니다');
    }
    return;
  }
  
  // Museum/Gallery의 경우 기관 이메일 중복확인 검증
  const role = form.querySelector('input[name="role"]:checked')?.value;
  if (role === 'museum' || role === 'gallery') {
    const orgEmail = document.getElementById('organization_contact_email');
    if (orgEmail && orgEmail.dataset.checked !== 'true') {
      e.preventDefault();
      if (typeof showErrorToast === 'function') {
        showErrorToast('기관 이메일 중복확인을 해주세요');
      } else {
        alert('기관 이메일 중복확인을 해주세요');
      }
      orgEmail.focus();
      return;
    }
  }
});

console.log('✅ Signup enhancements script loaded');
