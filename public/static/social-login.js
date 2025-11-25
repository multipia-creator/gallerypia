// ====================================
// Social Login & MetaMask Integration
// ====================================

// Google OAuth 2.0 Configuration
const GOOGLE_CLIENT_ID = ''; // Will be set from backend or environment

// Google Login
async function loginWithGoogle() {
  try {
    // Check if Google Client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
      console.warn('Google Client ID not configured, using demo mode');
      showGoogleSetupGuide();
      return;
    }
    
    // Load Google Identity Services library if not already loaded
    if (!window.google) {
      await loadGoogleIdentityServices();
    }
    
    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    // Show One Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to popup if One Tap is not available
        showGooglePopupLogin();
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    showFallbackGoogleLogin();
  }
}

// Load Google Identity Services library
function loadGoogleIdentityServices() {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Show Google popup login
function showGooglePopupLogin() {
  if (!window.google) {
    showFallbackGoogleLogin();
    return;
  }
  
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID || 'demo-mode',
    scope: 'email profile',
    callback: async (response) => {
      if (response.access_token) {
        await processGoogleLogin(response.access_token);
      }
    }
  });
  
  client.requestAccessToken();
}

// Handle Google callback
async function handleGoogleCallback(response) {
  try {
    if (response.credential) {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      await processGoogleUser(payload);
    }
  } catch (error) {
    console.error('Google callback error:', error);
    showError('Google 로그인 처리 중 오류가 발생했습니다.');
  }
}

// Process Google user login
async function processGoogleUser(googleUser) {
  try {
    console.log('[GOOGLE LOGIN] User:', googleUser);
    
    const response = await axios.post('/api/auth/google-login', {
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      email_verified: googleUser.email_verified
    });
    
    if (response.data.success) {
      // Store session
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.full_name);
      
      showSuccess('Google 로그인 성공!');
      
      // Redirect based on role
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'artist') {
          window.location.href = '/dashboard/artist';
        } else if (role === 'expert') {
          window.location.href = '/dashboard/expert';
        } else if (role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/mypage';
        }
      }, 1000);
    } else {
      showError(response.data.error || 'Google 로그인에 실패했습니다.');
    }
  } catch (error) {
    console.error('Google login processing error:', error);
    showError(error.response?.data?.error || 'Google 로그인 중 오류가 발생했습니다.');
  }
}

// Process Google login with access token
async function processGoogleLogin(accessToken) {
  try {
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });
    
    const googleUser = await userInfoResponse.json();
    await processGoogleUser(googleUser);
  } catch (error) {
    console.error('Google user info error:', error);
    showError('Google 사용자 정보를 가져올 수 없습니다.');
  }
}

// Show setup guide when Google Client ID is not configured
function showGoogleSetupGuide() {
  showFallbackGoogleLogin(); // Reuse the same modal
}

// Fallback Google login (show info modal)
function showFallbackGoogleLogin() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="card-nft rounded-3xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <div class="inline-block p-4 rounded-full bg-red-500 bg-opacity-20 mb-4">
          <i class="fab fa-google text-4xl text-red-400"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Google 로그인</h2>
        <p class="text-gray-400">Google 계정으로 빠르게 로그인하세요.</p>
      </div>
      
      <div class="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-300 mb-3">
          <i class="fas fa-info-circle text-blue-400 mr-2"></i>
          Google 로그인은 다음과 같은 장점이 있습니다:
        </p>
        <ul class="text-sm text-gray-400 space-y-2">
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>빠른 회원가입 및 로그인</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>안전한 Google 인증</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>비밀번호 관리 불필요</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4 mb-6">
        <p class="text-sm text-amber-400 font-semibold mb-2">
          <i class="fas fa-wrench mr-2"></i>Google OAuth 설정 필요
        </p>
        <p class="text-sm text-gray-300 mb-3">
          Google 로그인을 사용하려면 Google Cloud Console에서 OAuth Client ID를 발급받아야 합니다.
        </p>
        <details class="text-xs text-gray-400">
          <summary class="cursor-pointer hover:text-gray-300 mb-2">설정 방법 보기</summary>
          <ol class="list-decimal list-inside space-y-1 ml-2">
            <li>Google Cloud Console 접속 (console.cloud.google.com)</li>
            <li>프로젝트 생성 또는 선택</li>
            <li>API 및 서비스 → 사용자 인증 정보</li>
            <li>OAuth 2.0 클라이언트 ID 만들기</li>
            <li>승인된 JavaScript 원본: ${window.location.origin}</li>
            <li>Client ID를 코드에 추가</li>
          </ol>
        </details>
      </div>
      
      <div class="space-y-3">
        <a href="/signup" class="block w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition text-center">
          <i class="fas fa-user-plus mr-2"></i>이메일로 회원가입
        </a>
        <button onclick="this.closest('.fixed').remove()" class="w-full bg-white bg-opacity-5 text-white py-3 rounded-lg font-semibold hover:bg-opacity-10 transition">
          <i class="fas fa-times mr-2"></i>닫기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Show Facebook login info (still in development)
function showSocialLoginInfo(provider) {
  if (provider === 'Google') {
    loginWithGoogle();
    return;
  }
  
  // Facebook still shows info modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="card-nft rounded-3xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <div class="inline-block p-4 rounded-full bg-blue-500 bg-opacity-20 mb-4">
          <i class="fab fa-facebook text-4xl text-blue-400"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Facebook 로그인</h2>
        <p class="text-gray-400">Facebook 계정으로 빠르게 로그인하세요.</p>
      </div>
      
      <div class="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4 mb-6">
        <p class="text-sm text-amber-400 font-semibold mb-2">
          <i class="fas fa-clock mr-2"></i>준비 중
        </p>
        <p class="text-sm text-gray-300">
          Facebook Login SDK 연동이 곧 제공될 예정입니다. 현재는 이메일 회원가입을 이용해주세요.
        </p>
      </div>
      
      <div class="space-y-3">
        <a href="/signup" class="block w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition text-center">
          <i class="fas fa-user-plus mr-2"></i>이메일로 회원가입
        </a>
        <button onclick="this.closest('.fixed').remove()" class="w-full bg-white bg-opacity-5 text-white py-3 rounded-lg font-semibold hover:bg-opacity-10 transition">
          <i class="fas fa-times mr-2"></i>닫기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// MetaMask Login
async function loginWithMetaMask() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    showMetaMaskInstallModal();
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      showError('MetaMask 계정을 선택해주세요.');
      return;
    }
    
    const walletAddress = accounts[0];
    
    // Get signature for authentication
    const message = `갤러리피아 로그인\n\n지갑 주소: ${walletAddress}\n시간: ${new Date().toISOString()}`;
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress]
    });
    
    // Authenticate with backend
    const response = await axios.post('/api/auth/metamask-login', {
      wallet_address: walletAddress,
      signature: signature,
      message: message
    });
    
    if (response.data.success) {
      // Store session
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.full_name);
      localStorage.setItem('wallet_address', walletAddress);
      
      showSuccess('MetaMask 로그인 성공!');
      
      // Redirect based on role
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'artist') {
          window.location.href = '/dashboard/artist';
        } else if (role === 'expert') {
          window.location.href = '/dashboard/expert';
        } else if (role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/mypage';
        }
      }, 1000);
    } else {
      showError(response.data.error || 'MetaMask 로그인에 실패했습니다.');
    }
  } catch (error) {
    console.error('MetaMask login error:', error);
    
    if (error.code === 4001) {
      // User rejected request
      showError('MetaMask 연결이 거부되었습니다.');
    } else if (error.code === -32002) {
      // Request already pending
      showError('이미 MetaMask 연결 요청이 진행 중입니다.');
    } else {
      showError(error.response?.data?.error || 'MetaMask 로그인 중 오류가 발생했습니다.');
    }
  }
}

// Show MetaMask install modal
function showMetaMaskInstallModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="card-nft rounded-3xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <div class="inline-block p-4 rounded-full bg-orange-500 bg-opacity-20 mb-4">
          <i class="fas fa-wallet text-4xl text-orange-400"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">MetaMask 지갑 필요</h2>
        <p class="text-gray-400">MetaMask 지갑으로 안전하게 로그인하세요</p>
      </div>
      
      <div class="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-300 mb-3">
          <i class="fas fa-info-circle text-blue-400 mr-2"></i>
          MetaMask는 Ethereum 기반 디지털 지갑입니다. NFT 거래와 인증에 사용됩니다.
        </p>
        <ul class="text-sm text-gray-400 space-y-2">
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>안전한 블록체인 인증</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>NFT 작품 거래 및 소유권 관리</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
            <span>크롬, 파이어폭스, 브레이브 브라우저 지원</span>
          </li>
        </ul>
      </div>
      
      <div class="space-y-3">
        <a href="https://metamask.io/download/" target="_blank" class="block w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition text-center">
          <i class="fas fa-download mr-2"></i>MetaMask 설치하기
        </a>
        <button onclick="this.closest('.fixed').remove()" class="w-full bg-white bg-opacity-5 text-white py-3 rounded-lg font-semibold hover:bg-opacity-10 transition">
          <i class="fas fa-times mr-2"></i>닫기
        </button>
      </div>
      
      <p class="text-xs text-gray-500 text-center mt-4">
        설치 후 페이지를 새로고침해주세요
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Show success message
function showSuccess(message) {
  const alertDiv = document.getElementById('alertMessage');
  if (alertDiv) {
    alertDiv.className = 'mb-4 p-4 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30';
    alertDiv.innerHTML = `<p class="text-green-400 text-sm"><i class="fas fa-check-circle mr-2"></i>${message}</p>`;
    alertDiv.classList.remove('hidden');
  } else {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-green-500 bg-opacity-90 text-white px-6 py-4 rounded-lg shadow-lg';
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// Show error message
function showError(message) {
  const alertDiv = document.getElementById('alertMessage');
  if (alertDiv) {
    alertDiv.className = 'mb-4 p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30';
    alertDiv.innerHTML = `<p class="text-red-400 text-sm"><i class="fas fa-exclamation-circle mr-2"></i>${message}</p>`;
    alertDiv.classList.remove('hidden');
  } else {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-red-500 bg-opacity-90 text-white px-6 py-4 rounded-lg shadow-lg';
    notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// ====================================
// Kakao Login
// ====================================
const KAKAO_APP_KEY = ''; // Will be set from environment

async function loginWithKakao() {
  if (!KAKAO_APP_KEY || KAKAO_APP_KEY === '') {
    showKakaoSetupModal();
    return;
  }
  
  // Load Kakao SDK if not loaded
  if (!window.Kakao) {
    await loadKakaoSDK();
  }
  
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
  }
  
  // Kakao Login
  window.Kakao.Auth.login({
    success: function(authObj) {
      console.log('[KAKAO] Auth success:', authObj);
      
      // Get user info
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: function(res) {
          console.log('[KAKAO] User info:', res);
          processKakaoUser(res);
        },
        fail: function(err) {
          console.error('[KAKAO] User info error:', err);
          showError('카카오 사용자 정보를 가져올 수 없습니다.');
        }
      });
    },
    fail: function(err) {
      console.error('[KAKAO] Login error:', err);
      showError('카카오 로그인에 실패했습니다.');
    }
  });
}

function loadKakaoSDK() {
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function processKakaoUser(kakaoUser) {
  try {
    const response = await axios.post('/api/auth/kakao-login', {
      kakao_id: kakaoUser.id,
      email: kakaoUser.kakao_account?.email,
      name: kakaoUser.kakao_account?.profile?.nickname,
      picture: kakaoUser.kakao_account?.profile?.profile_image_url
    });
    
    if (response.data.success) {
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.full_name);
      
      showSuccess('카카오 로그인 성공!');
      
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'artist') window.location.href = '/dashboard/artist';
        else if (role === 'expert') window.location.href = '/dashboard/expert';
        else if (role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/mypage';
      }, 1000);
    }
  } catch (error) {
    console.error('Kakao login error:', error);
    showError(error.response?.data?.error || '카카오 로그인 중 오류가 발생했습니다.');
  }
}

function showKakaoSetupModal() {
  showSocialComingSoon('카카오톡', 'fab fa-comment', '#FEE500', '#000000');
}

// ====================================
// Naver Login
// ====================================
const NAVER_CLIENT_ID = ''; // Will be set from environment

function loginWithNaver() {
  if (!NAVER_CLIENT_ID || NAVER_CLIENT_ID === '') {
    showNaverSetupModal();
    return;
  }
  
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/naver/callback');
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('naver_state', state);
  
  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
  
  window.location.href = naverAuthUrl;
}

function showNaverSetupModal() {
  showSocialComingSoon('네이버', 'fas fa-n', '#03C75A', '#ffffff');
}

// ====================================
// Instagram Login (Facebook Login for Instagram)
// ====================================
function loginWithInstagram() {
  // Instagram uses Facebook Login
  showSocialComingSoon('Instagram', 'fab fa-instagram', 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', '#ffffff');
}

// ====================================
// Apple Login
// ====================================
const APPLE_CLIENT_ID = ''; // Will be set from environment

async function loginWithApple() {
  if (!APPLE_CLIENT_ID || APPLE_CLIENT_ID === '') {
    showAppleSetupModal();
    return;
  }
  
  // Load Apple ID SDK if not loaded
  if (!window.AppleID) {
    await loadAppleIDSDK();
  }
  
  try {
    const data = await window.AppleID.auth.signIn();
    console.log('[APPLE] Sign-in success:', data);
    
    // Process Apple user data
    await processAppleUser(data);
  } catch (error) {
    console.error('[APPLE] Login error:', error);
    if (error.error !== 'popup_closed_by_user') {
      showError('Apple 로그인에 실패했습니다.');
    }
  }
}

function loadAppleIDSDK() {
  return new Promise((resolve, reject) => {
    if (window.AppleID) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      // Initialize Apple ID
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: window.location.origin + '/auth/apple/callback',
        usePopup: true
      });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function processAppleUser(appleData) {
  try {
    const response = await axios.post('/api/auth/apple-login', {
      apple_id: appleData.authorization.id_token, // Use id_token as apple_id
      email: appleData.user?.email,
      name: appleData.user?.name ? `${appleData.user.name.firstName} ${appleData.user.name.lastName}` : null
    });
    
    if (response.data.success) {
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.full_name);
      
      showSuccess('Apple 로그인 성공!');
      
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'artist') window.location.href = '/dashboard/artist';
        else if (role === 'expert') window.location.href = '/dashboard/expert';
        else if (role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/mypage';
      }, 1000);
    }
  } catch (error) {
    console.error('Apple login error:', error);
    showError(error.response?.data?.error || 'Apple 로그인 중 오류가 발생했습니다.');
  }
}

function showAppleSetupModal() {
  showSocialComingSoon('Apple', 'fab fa-apple', '#000000', '#ffffff');
}

// ====================================
// Facebook Login
// ====================================
const FACEBOOK_APP_ID = ''; // Will be set from environment

async function loginWithFacebook() {
  if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === '') {
    showFacebookSetupModal();
    return;
  }
  
  // Load Facebook SDK if not loaded
  if (!window.FB) {
    await loadFacebookSDK();
  }
  
  window.FB.login(function(response) {
    if (response.authResponse) {
      console.log('[FACEBOOK] Login success:', response);
      
      // Get user info
      window.FB.api('/me', { fields: 'id,name,email,picture' }, function(userInfo) {
        console.log('[FACEBOOK] User info:', userInfo);
        processFacebookUser(userInfo);
      });
    } else {
      console.log('[FACEBOOK] User cancelled login or did not fully authorize.');
    }
  }, { scope: 'public_profile,email' });
}

function loadFacebookSDK() {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }
    
    // Load Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      resolve();
    };
    
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/ko_KR/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function processFacebookUser(fbUser) {
  try {
    const response = await axios.post('/api/auth/facebook-login', {
      facebook_id: fbUser.id,
      email: fbUser.email,
      name: fbUser.name,
      picture: fbUser.picture
    });
    
    if (response.data.success) {
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.full_name);
      
      showSuccess('Facebook 로그인 성공!');
      
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'artist') window.location.href = '/dashboard/artist';
        else if (role === 'expert') window.location.href = '/dashboard/expert';
        else if (role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/mypage';
      }, 1000);
    }
  } catch (error) {
    console.error('Facebook login error:', error);
    showError(error.response?.data?.error || 'Facebook 로그인 중 오류가 발생했습니다.');
  }
}

function showFacebookSetupModal() {
  showSocialComingSoon('Facebook', 'fab fa-facebook-f', '#1877F2', '#ffffff');
}

// Show coming soon modal for social logins
function showSocialComingSoon(provider, icon, bgColor, textColor) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="card-nft rounded-3xl p-8 max-w-md w-full">
      <div class="text-center mb-6">
        <div class="inline-block p-4 rounded-full mb-4" style="background: ${bgColor}; color: ${textColor};">
          <i class="${icon} text-4xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">${provider} 로그인</h2>
        <p class="text-gray-400">${provider} 계정으로 빠르게 로그인하세요.</p>
      </div>
      
      <div class="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4 mb-6">
        <p class="text-sm text-amber-400 font-semibold mb-2">
          <i class="fas fa-wrench mr-2"></i>OAuth 설정 필요
        </p>
        <p class="text-sm text-gray-300">
          ${provider} 로그인을 사용하려면 ${provider} Developer 계정에서 OAuth App을 설정해야 합니다. 현재는 Google 로그인 또는 이메일 회원가입을 이용해주세요.
        </p>
      </div>
      
      <div class="space-y-3">
        <button onclick="loginWithGoogle()" class="block w-full bg-white text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center">
          <i class="fab fa-google mr-2"></i>Google로 계속하기
        </button>
        <a href="/signup" class="block w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition text-center">
          <i class="fas fa-user-plus mr-2"></i>이메일로 회원가입
        </a>
        <button onclick="this.closest('.fixed').remove()" class="w-full bg-white bg-opacity-5 text-white py-3 rounded-lg font-semibold hover:bg-opacity-10 transition">
          <i class="fas fa-times mr-2"></i>닫기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}
