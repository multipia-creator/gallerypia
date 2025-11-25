/**
 * ============================================
 * 🔴 C2-1, C3-1, C6-1: Frontend Auth Verification System
 * ============================================
 * Unified authentication and authorization verification
 */

// ============================================
// Session Management
// ============================================

function getUser() {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

function setUser(user, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('user', JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  // Note: HttpOnly cookie is automatically sent by browser
}

// ============================================
// C2-1: Fix Session Token Storage
// ============================================

// Override handleLoginImproved to use HttpOnly cookies only
if (typeof window.handleLoginImproved === 'function') {
  const originalHandleLogin = window.handleLoginImproved;
  
  window.handleLoginImproved = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember_me')?.checked || false;
    
    if (!email || !password) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('이메일과 비밀번호를 모두 입력해주세요');
      }
      return;
    }
    
    try {
      if (typeof setFormLoading === 'function') {
        setFormLoading(form, submitButton, true, '로그인 중...');
      }
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });
      
      if (response.data.success) {
        // ✅ FIX: Only store user data, NOT session token (C2-1)
        // Session token is in HttpOnly cookie automatically
        setUser(response.data.user, rememberMe);
        
        if (typeof showSuccessToast === 'function') {
          showSuccessToast('로그인 성공!');
        }
        
        // Role-based redirect
        const role = response.data.user?.role;
        let redirectUrl = '/';
        
        if (role === 'artist') redirectUrl = '/dashboard/artist';
        else if (role === 'expert') redirectUrl = '/dashboard/expert';
        else if (role === 'museum' || role === 'gallery') redirectUrl = '/dashboard/museum';
        else if (role === 'admin' || role === 'super_admin') redirectUrl = '/admin/dashboard';
        else redirectUrl = '/dashboard';
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        if (typeof showErrorToast === 'function') {
          showErrorToast(response.data.error || '로그인에 실패했습니다');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (typeof showErrorToast === 'function') {
        if (error.response?.status === 429) {
          const retryAfter = error.response.data.retry_after || 900;
          showErrorToast(`로그인 시도 횟수가 초과되었습니다. ${Math.ceil(retryAfter / 60)}분 후에 다시 시도해주세요`);
        } else if (error.response?.status === 401) {
          showErrorToast('이메일 또는 비밀번호가 올바르지 않습니다');
        } else if (error.response?.data?.error) {
          showErrorToast(error.response.data.error);
        } else {
          showErrorToast('로그인 중 오류가 발생했습니다');
        }
      }
    } finally {
      if (typeof setFormLoading === 'function') {
        setFormLoading(form, submitButton, false);
      }
    }
  };
}

// ============================================
// C3-1: Dashboard Access Verification
// ============================================

async function verifyDashboardAccess(requiredRole) {
  try {
    const user = getUser();
    
    if (!user) {
      const currentPath = window.location.pathname;
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      return false;
    }
    
    // Admin can access all dashboards
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }
    
    // Check role match
    if (user.role !== requiredRole) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('접근 권한이 없습니다');
      }
      
      // Redirect to correct dashboard
      setTimeout(() => {
        window.location.href = `/dashboard/${user.role}`;
      }, 1000);
      return false;
    }
    
    // Server-side verification
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'GET',
        credentials: 'include' // Include HttpOnly cookie
      });
      
      if (!response.ok) {
        throw new Error('Session invalid');
      }
      
      return true;
    } catch (error) {
      console.error('Session verification failed:', error);
      clearUser();
      window.location.href = '/login';
      return false;
    }
    
  } catch (error) {
    console.error('Dashboard access verification error:', error);
    window.location.href = '/login';
    return false;
  }
}

// ============================================
// C6-1: Admin Page Access Verification
// ============================================

async function verifyAdminAccess() {
  try {
    const user = getUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('관리자 권한이 필요합니다');
      }
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      return false;
    }
    
    // Server-side verification
    try {
      const response = await fetch('/api/admin/verify-access', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Admin access denied');
      }
      
      return true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      
      if (typeof showErrorToast === 'function') {
        showErrorToast('관리자 권한 확인에 실패했습니다');
      }
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      return false;
    }
    
  } catch (error) {
    console.error('Admin access verification error:', error);
    window.location.href = '/login';
    return false;
  }
}

// ============================================
// General Auth Check
// ============================================

async function requireAuth(redirectToLogin = true) {
  const user = getUser();
  
  if (!user) {
    if (redirectToLogin) {
      const currentPath = window.location.pathname;
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
    }
    return false;
  }
  
  // Verify session is still valid
  try {
    const response = await fetch('/api/auth/verify-session', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      clearUser();
      if (redirectToLogin) {
        window.location.href = '/login';
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    if (redirectToLogin) {
      window.location.href = '/login';
    }
    return false;
  }
}

// ============================================
// Logout
// ============================================

async function logout() {
  try {
    if (typeof showGlobalLoading === 'function') {
      showGlobalLoading('로그아웃 중...');
    }
    
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    clearUser();
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast('로그아웃되었습니다');
    }
    
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
    
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local data anyway
    clearUser();
    window.location.href = '/';
  } finally {
    if (typeof hideGlobalLoading === 'function') {
      hideGlobalLoading();
    }
  }
}

// ============================================
// Global Exposure
// ============================================

window.getUser = getUser;
window.setUser = setUser;
window.clearUser = clearUser;
window.verifyDashboardAccess = verifyDashboardAccess;
window.verifyAdminAccess = verifyAdminAccess;
window.requireAuth = requireAuth;
window.logout = logout;

// ============================================
// Auto-check auth on protected pages
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  // Dashboard pages
  if (path.startsWith('/dashboard/')) {
    const role = path.split('/')[2]; // Extract role from /dashboard/{role}
    verifyDashboardAccess(role);
  }
  
  // Admin pages
  if (path.startsWith('/admin/')) {
    verifyAdminAccess();
  }
  
  // My page
  if (path === '/mypage' || path.startsWith('/mypage/')) {
    requireAuth();
  }
});

console.log('✅ Auth verification system loaded (C2-1, C3-1, C6-1)');
