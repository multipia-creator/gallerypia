/**
 * ============================================
 * 🔴 C1-1: Registration Role Selection UI
 * ============================================
 * Adds role selection to registration form with dynamic additional fields
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
});

function initRegistrationForm() {
  // ✅ FIX: Use correct form ID from actual HTML
  const registerForm = document.getElementById('signupForm');
  if (!registerForm) {
    console.warn('Signup form not found');
    return;
  }
  
  // ✅ FIX: Role selection already exists in HTML, just add listener
  const roleInputs = registerForm.querySelectorAll('input[name="role"]');
  if (roleInputs.length === 0) {
    console.warn('Role selection not found');
    return;
  }
  
  // Create container for organization fields
  const additionalFields = document.createElement('div');
  additionalFields.id = 'additional-fields';
  additionalFields.className = 'mt-6';
  
  // Insert after role selection section
  const roleSection = registerForm.querySelector('input[name="role"]')?.closest('div')?.closest('div');
  if (roleSection) {
    roleSection.after(additionalFields);
  }
  
  // Add change event listeners to all role radio buttons
  roleInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      handleRoleChange({ target: { value: e.target.value } });
    });
  });
  
  // Add terms and conditions before submit button
  const termsField = createTermsField();
  const submitButton = registerForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.before(termsField);
  }
  
  console.log('✅ Registration form initialized with dynamic organization fields');
}

function createRoleSelectionField() {
  const div = document.createElement('div');
  div.className = 'mb-4';
  div.innerHTML = `
    <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
      계정 유형 <span class="text-red-500">*</span>
      <button type="button" onclick="showRoleInfo()" class="ml-1 text-gray-400 hover:text-gray-600">
        <i class="fas fa-question-circle"></i>
      </button>
    </label>
    <select id="role" name="role" required 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
      <option value="">계정 유형을 선택하세요</option>
      <option value="buyer">🛒 구매자 (Buyer) - NFT 작품을 구매하고 컬렉션을 만듭니다</option>
      <option value="artist">🎨 아티스트 (Artist) - 작품을 업로드하고 NFT로 판매합니다</option>
      <option value="expert">📋 감정 전문가 (Expert) - 작품을 감정하고 가치를 평가합니다</option>
      <option value="museum">🏛️ 미술관/갤러리 (Museum) - 전시를 기획하고 작품을 큐레이션합니다</option>
    </select>
    <p class="text-xs text-gray-500 mt-1">
      <i class="fas fa-info-circle text-purple-500"></i> 
      역할은 가입 후 변경할 수 없습니다. 신중히 선택해주세요.
    </p>
  `;
  
  // Add change event listener
  const select = div.querySelector('#role');
  select.addEventListener('change', handleRoleChange);
  
  return div;
}

function handleRoleChange(e) {
  const role = e.target.value;
  const additionalFieldsContainer = document.getElementById('additional-fields');
  
  if (role === 'museum' || role === 'gallery') {
    additionalFieldsContainer.innerHTML = `
      <div class="space-y-4 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 class="font-semibold text-purple-900 flex items-center gap-2">
          <i class="fas fa-building"></i>
          조직 정보
        </h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            조직명 <span class="text-red-500">*</span>
          </label>
          <input type="text" id="organization_name" name="organization_name" required
                 placeholder="예: 서울 현대미술관"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">조직 유형</label>
          <select id="organization_type" name="organization_type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option value="museum">미술관 (Museum)</option>
            <option value="gallery">갤러리 (Gallery)</option>
            <option value="exhibition_space">전시 공간 (Exhibition Space)</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input type="text" id="organization_address" name="organization_address"
                 placeholder="예: 서울시 강남구 테헤란로 123"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">웹사이트</label>
          <input type="url" id="organization_website" name="organization_website"
                 placeholder="https://example.com"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">담당자 연락처</label>
          <input type="tel" id="organization_phone" name="organization_phone"
                 placeholder="010-1234-5678"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">소개</label>
          <textarea id="organization_description" name="organization_description" rows="3"
                    placeholder="조직에 대한 간단한 소개를 작성해주세요"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"></textarea>
        </div>
      </div>
    `;
  } else {
    additionalFieldsContainer.innerHTML = '';
  }
}

function createTermsField() {
  const div = document.createElement('div');
  div.className = 'mt-6 space-y-2 border-t border-gray-200 pt-4';
  div.innerHTML = `
    <label class="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" id="agree_terms" name="agree_terms" required class="mt-1 w-4 h-4 text-purple-600">
      <span class="text-sm text-gray-700">
        <a href="/terms" target="_blank" class="text-purple-600 underline hover:text-purple-700">서비스 이용약관</a> 및 
        <a href="/privacy" target="_blank" class="text-purple-600 underline hover:text-purple-700">개인정보 처리방침</a>에 동의합니다 (필수)
      </span>
    </label>
    <label class="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" id="agree_marketing" name="agree_marketing" class="mt-1 w-4 h-4 text-purple-600">
      <span class="text-sm text-gray-700">마케팅 정보 수신에 동의합니다 (선택)</span>
    </label>
  `;
  return div;
}

function showRoleInfo() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">계정 유형 안내</h2>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="border rounded-lg p-4 hover:border-purple-500 transition-colors">
          <h3 class="font-bold text-lg mb-2">🛒 구매자 (Buyer)</h3>
          <p class="text-gray-600 mb-2">NFT 작품을 탐색하고 구매하며 컬렉션을 관리합니다.</p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>✅ 작품 구매 및 소유</li>
            <li>✅ 컬렉션 관리</li>
            <li>✅ 작품 감상 및 평가</li>
            <li>✅ 관심 아티스트 팔로우</li>
          </ul>
        </div>
        
        <div class="border rounded-lg p-4 hover:border-purple-500 transition-colors">
          <h3 class="font-bold text-lg mb-2">🎨 아티스트 (Artist)</h3>
          <p class="text-gray-600 mb-2">작품을 업로드하고 NFT로 발행하여 판매합니다.</p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>✅ 작품 업로드 (무제한)</li>
            <li>✅ NFT 발행 및 판매</li>
            <li>✅ 수익금 관리</li>
            <li>✅ 팬 커뮤니티 구축</li>
          </ul>
        </div>
        
        <div class="border rounded-lg p-4 hover:border-purple-500 transition-colors">
          <h3 class="font-bold text-lg mb-2">📋 감정 전문가 (Expert)</h3>
          <p class="text-gray-600 mb-2">작품을 감정하고 가치를 평가합니다.</p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>✅ 작품 감정 요청 수락</li>
            <li>✅ 전문적인 평가 제공</li>
            <li>✅ 감정 수수료 수익</li>
            <li>✅ 평판 관리</li>
          </ul>
        </div>
        
        <div class="border rounded-lg p-4 hover:border-purple-500 transition-colors">
          <h3 class="font-bold text-lg mb-2">🏛️ 미술관/갤러리 (Museum)</h3>
          <p class="text-gray-600 mb-2">전시를 기획하고 작품을 큐레이션합니다.</p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>✅ 가상 전시 기획</li>
            <li>✅ 작품 큐레이션</li>
            <li>✅ 소장품 관리</li>
            <li>✅ 방문자 통계 분석</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-sm text-yellow-800">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <strong>중요:</strong> 계정 유형은 가입 후 변경할 수 없습니다. 
          본인의 목적에 가장 적합한 유형을 선택해주세요.
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Email real-time validation
let emailCheckTimeout;
const emailInput = document.getElementById('email');

if (emailInput) {
  const feedbackEl = document.createElement('div');
  feedbackEl.id = 'email-feedback';
  emailInput.parentElement.appendChild(feedbackEl);
  
  emailInput.addEventListener('input', (e) => {
    clearTimeout(emailCheckTimeout);
    emailCheckTimeout = setTimeout(async () => {
      const email = e.target.value.trim();
      
      if (!email || !email.includes('@')) {
        feedbackEl.innerHTML = '';
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        if (data.exists) {
          feedbackEl.innerHTML = '<p class="text-red-500 text-sm mt-1"><i class="fas fa-times-circle"></i> 이미 사용 중인 이메일입니다</p>';
          e.target.classList.add('border-red-500');
          e.target.classList.remove('border-green-500');
        } else {
          feedbackEl.innerHTML = '<p class="text-green-500 text-sm mt-1"><i class="fas fa-check-circle"></i> 사용 가능한 이메일입니다</p>';
          e.target.classList.remove('border-red-500');
          e.target.classList.add('border-green-500');
        }
      } catch (error) {
        console.error('Email check error:', error);
      }
    }, 500);
  });
}

console.log('✅ Registration improvements loaded (C1-1)');
