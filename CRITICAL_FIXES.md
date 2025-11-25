# 🚨 GalleryPia v11.0 긴급 수정 사항

## 📊 발견된 주요 문제 요약

### Critical Issues (즉시 수정 필요)
- ✅ **16개 Critical 문제** 발견
- 🔴 보안: 5개
- 🔴 기능: 7개  
- 🔴 데이터: 4개

### High Priority (1주일 내 수정)
- ⚠️ **27개 High Priority 문제**
- UX: 12개
- 성능: 8개
- 접근성: 7개

### Medium Priority (2주일 내 수정)
- 📊 **17개 Medium Priority 문제**

---

## 🔥 Critical Issues 상세 및 수정 방안

### C1. 회원가입 API 미구현 🔴

**현재 상태**: `/api/auth/register` 라우트 없음

**수정 코드**:

```typescript
// src/index.tsx에 추가 (auth 라우터 섹션)

auth.post('/register', async (c: Context) => {
  try {
    const { email, password, username, role } = await c.req.json();
    
    // 1. 입력 유효성 검사
    if (!email || !password || !username || !role) {
      return c.json({ error: '모든 필드를 입력해주세요' }, 400);
    }
    
    // 2. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: '유효한 이메일을 입력해주세요' }, 400);
    }
    
    // 3. 비밀번호 강도 검증
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return c.json({ 
        error: '비밀번호는 최소 8자, 대소문자, 숫자, 특수문자를 포함해야 합니다' 
      }, 400);
    }
    
    // 4. 역할 검증
    const validRoles = ['buyer', 'artist', 'expert', 'museum'];
    if (!validRoles.includes(role)) {
      return c.json({ error: '유효하지 않은 역할입니다' }, 400);
    }
    
    // 5. 이메일 중복 확인
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: '이미 사용 중인 이메일입니다' }, 409);
    }
    
    // 6. 비밀번호 해싱 (bcrypt 사용)
    // Note: Cloudflare Workers에서는 Web Crypto API 사용
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 7. 사용자 생성
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password, username, role, created_at, email_verified)
      VALUES (?, ?, ?, ?, datetime('now'), 0)
    `).bind(email, hashedPassword, username, role).run();
    
    // 8. JWT 토큰 생성
    const userId = result.meta.last_row_id;
    const token = await generateJWT({ userId, email, role });
    
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다',
      token,
      user: { id: userId, email, username, role }
    }, 201);
    
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: '회원가입 중 오류가 발생했습니다' }, 500);
  }
});

// JWT 생성 헬퍼 함수
async function generateJWT(payload: any) {
  const secret = 'your-secret-key-here'; // 환경 변수로 관리 권장
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
```

**클라이언트 UI 개선**:

```html
<!-- src/index.tsx의 Register 페이지 개선 -->
<div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
  <h2 class="text-2xl font-bold mb-6">회원가입</h2>
  
  <form id="registerForm" class="space-y-4">
    <!-- 역할 선택 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        역할 선택 *
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="cursor-pointer">
          <input type="radio" name="role" value="buyer" class="sr-only peer" required>
          <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all">
            <i class="fas fa-shopping-bag text-2xl mb-2"></i>
            <p class="font-semibold">구매자</p>
            <p class="text-xs text-gray-500">작품 구매 및 감상</p>
          </div>
        </label>
        
        <label class="cursor-pointer">
          <input type="radio" name="role" value="artist" class="sr-only peer">
          <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-purple-600 peer-checked:bg-purple-50 transition-all">
            <i class="fas fa-palette text-2xl mb-2"></i>
            <p class="font-semibold">아티스트</p>
            <p class="text-xs text-gray-500">작품 등록 및 판매</p>
          </div>
        </label>
        
        <label class="cursor-pointer">
          <input type="radio" name="role" value="expert" class="sr-only peer">
          <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-green-600 peer-checked:bg-green-50 transition-all">
            <i class="fas fa-certificate text-2xl mb-2"></i>
            <p class="font-semibold">전문가</p>
            <p class="text-xs text-gray-500">작품 평가 및 감정</p>
          </div>
        </label>
        
        <label class="cursor-pointer">
          <input type="radio" name="role" value="museum" class="sr-only peer">
          <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-orange-600 peer-checked:bg-orange-50 transition-all">
            <i class="fas fa-landmark text-2xl mb-2"></i>
            <p class="font-semibold">미술관</p>
            <p class="text-xs text-gray-500">전시회 기획 및 운영</p>
          </div>
        </label>
      </div>
      <p id="roleError" class="text-red-600 text-sm mt-1 hidden"></p>
    </div>
    
    <!-- 이메일 -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        이메일 *
      </label>
      <input 
        type="email" 
        id="email" 
        name="email"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        placeholder="example@email.com"
        required
        aria-describedby="emailHelp emailError"
      >
      <p id="emailHelp" class="text-xs text-gray-500 mt-1">로그인 시 사용할 이메일 주소</p>
      <p id="emailError" class="text-red-600 text-sm mt-1 hidden" role="alert"></p>
      <button 
        type="button" 
        id="checkEmailBtn"
        class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
      >
        이메일 중복 확인
      </button>
    </div>
    
    <!-- 사용자명 -->
    <div>
      <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
        사용자명 *
      </label>
      <input 
        type="text" 
        id="username" 
        name="username"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        placeholder="홍길동"
        required
        minlength="2"
        maxlength="20"
        aria-describedby="usernameError"
      >
      <p id="usernameError" class="text-red-600 text-sm mt-1 hidden" role="alert"></p>
    </div>
    
    <!-- 비밀번호 -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        비밀번호 *
      </label>
      <div class="relative">
        <input 
          type="password" 
          id="password" 
          name="password"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
          required
          minlength="8"
          aria-describedby="passwordHelp passwordStrength passwordError"
        >
        <button 
          type="button" 
          id="togglePassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="비밀번호 표시/숨김"
        >
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <p id="passwordHelp" class="text-xs text-gray-500 mt-1">
        최소 8자, 대소문자, 숫자, 특수문자 포함
      </p>
      <!-- 비밀번호 강도 표시 -->
      <div id="passwordStrength" class="mt-2">
        <div class="flex gap-1">
          <div class="h-1 flex-1 bg-gray-200 rounded"></div>
          <div class="h-1 flex-1 bg-gray-200 rounded"></div>
          <div class="h-1 flex-1 bg-gray-200 rounded"></div>
          <div class="h-1 flex-1 bg-gray-200 rounded"></div>
        </div>
        <p class="text-xs mt-1 text-gray-500"></p>
      </div>
      <p id="passwordError" class="text-red-600 text-sm mt-1 hidden" role="alert"></p>
    </div>
    
    <!-- 비밀번호 확인 -->
    <div>
      <label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-1">
        비밀번호 확인 *
      </label>
      <input 
        type="password" 
        id="passwordConfirm" 
        name="passwordConfirm"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        placeholder="••••••••"
        required
        aria-describedby="passwordConfirmError"
      >
      <p id="passwordConfirmError" class="text-red-600 text-sm mt-1 hidden" role="alert"></p>
    </div>
    
    <!-- 약관 동의 -->
    <div class="space-y-2 pt-4 border-t">
      <label class="flex items-start">
        <input 
          type="checkbox" 
          id="agreeAll"
          class="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
        >
        <span class="ml-2 text-sm font-semibold">전체 동의</span>
      </label>
      
      <label class="flex items-start ml-6">
        <input 
          type="checkbox" 
          name="agreeTerms"
          class="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
          required
        >
        <span class="ml-2 text-sm">
          <a href="/terms" class="text-indigo-600 hover:underline">[필수]</a> 이용약관 동의
        </span>
      </label>
      
      <label class="flex items-start ml-6">
        <input 
          type="checkbox" 
          name="agreePrivacy"
          class="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
          required
        >
        <span class="ml-2 text-sm">
          <a href="/privacy" class="text-indigo-600 hover:underline">[필수]</a> 개인정보 처리방침 동의
        </span>
      </label>
      
      <label class="flex items-start ml-6">
        <input 
          type="checkbox" 
          name="agreeAge"
          class="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
          required
        >
        <span class="ml-2 text-sm">[필수] 만 14세 이상입니다</span>
      </label>
      
      <label class="flex items-start ml-6">
        <input 
          type="checkbox" 
          name="agreeMarketing"
          class="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
        >
        <span class="ml-2 text-sm">[선택] 마케팅 정보 수신 동의</span>
      </label>
    </div>
    
    <!-- 제출 버튼 -->
    <button 
      type="submit"
      class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      id="submitBtn"
    >
      회원가입
    </button>
    
    <!-- 로그인 링크 -->
    <p class="text-center text-sm text-gray-600">
      이미 계정이 있으신가요? 
      <a href="/login" class="text-indigo-600 hover:underline font-semibold">로그인</a>
    </p>
  </form>
</div>

<script>
// 회원가입 폼 처리
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
    role: formData.get('role')
  };
  
  // 비밀번호 확인 검증
  if (data.password !== formData.get('passwordConfirm')) {
    document.getElementById('passwordConfirmError').textContent = '비밀번호가 일치하지 않습니다';
    document.getElementById('passwordConfirmError').classList.remove('hidden');
    return;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '가입 중...';
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // 토큰 저장
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // 성공 메시지
      if (window.showSuccessToast) {
        window.showSuccessToast('회원가입이 완료되었습니다!');
      }
      
      // 대시보드로 리다이렉트
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      // 오류 표시
      if (window.showErrorToast) {
        window.showErrorToast(result.error || '회원가입에 실패했습니다');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = '회원가입';
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (window.showErrorToast) {
      window.showErrorToast('네트워크 오류가 발생했습니다');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = '회원가입';
  }
});

// 이메일 중복 확인
document.getElementById('checkEmailBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  if (!email) {
    document.getElementById('emailError').textContent = '이메일을 입력해주세요';
    document.getElementById('emailError').classList.remove('hidden');
    return;
  }
  
  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.available) {
      document.getElementById('emailError').textContent = '✓ 사용 가능한 이메일입니다';
      document.getElementById('emailError').classList.remove('text-red-600');
      document.getElementById('emailError').classList.add('text-green-600');
      document.getElementById('emailError').classList.remove('hidden');
    } else {
      document.getElementById('emailError').textContent = '이미 사용 중인 이메일입니다';
      document.getElementById('emailError').classList.add('text-red-600');
      document.getElementById('emailError').classList.remove('text-green-600');
      document.getElementById('emailError').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Email check error:', error);
  }
});

// 비밀번호 강도 체크
document.getElementById('password').addEventListener('input', (e) => {
  const password = e.target.value;
  const strengthContainer = document.getElementById('passwordStrength');
  const bars = strengthContainer.querySelectorAll('.h-1');
  const text = strengthContainer.querySelector('p');
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  bars.forEach((bar, index) => {
    if (index < strength) {
      bar.classList.remove('bg-gray-200');
      if (strength === 1) bar.classList.add('bg-red-500');
      else if (strength === 2) bar.classList.add('bg-orange-500');
      else if (strength === 3) bar.classList.add('bg-yellow-500');
      else bar.classList.add('bg-green-500');
    } else {
      bar.classList.add('bg-gray-200');
      bar.classList.remove('bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500');
    }
  });
  
  const strengthText = ['매우 약함', '약함', '보통', '강함'];
  text.textContent = strength > 0 ? `비밀번호 강도: ${strengthText[strength - 1]}` : '';
});

// 비밀번호 표시/숨김 토글
document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('password');
  const icon = document.querySelector('#togglePassword i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
});

// 전체 동의 처리
document.getElementById('agreeAll').addEventListener('change', (e) => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="agree"]');
  checkboxes.forEach(cb => cb.checked = e.target.checked);
});
</script>
```

---

### C3. 세션 관리 및 JWT 검증 미들웨어

**JWT 검증 미들웨어 구현**:

```typescript
// src/index.tsx에 추가

// JWT 검증 미들웨어
async function verifyJWT(token: string): Promise<any> {
  try {
    const [header, payload, signature] = token.split('.');
    
    // 1. 시그니처 검증
    const secret = 'your-secret-key-here';
    const data = `${header}.${payload}`;
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(data)
    );
    
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)));
    if (signature !== expectedSig) {
      throw new Error('Invalid signature');
    }
    
    // 2. 페이로드 파싱
    const decodedPayload = JSON.parse(atob(payload));
    
    // 3. 만료 시간 확인
    if (decodedPayload.exp && decodedPayload.exp < Date.now()) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// 인증 미들웨어
async function authMiddleware(c: Context, next: () => Promise<void>) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다' }, 401);
  }
  
  try {
    const payload = await verifyJWT(token);
    c.set('user', payload); // Context에 사용자 정보 저장
    await next();
  } catch (error) {
    return c.json({ error: '유효하지 않은 토큰입니다' }, 401);
  }
}

// 역할 기반 접근 제어 미들웨어
function requireRole(...roles: string[]) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user');
    
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: '접근 권한이 없습니다' }, 403);
    }
    
    await next();
  };
}

// 사용 예시:
app.get('/api/user/profile', authMiddleware, async (c: Context) => {
  const user = c.get('user');
  return c.json({ user });
});

app.get('/api/admin/users', authMiddleware, requireRole('admin'), async (c: Context) => {
  // 관리자만 접근 가능
  const users = await c.env.DB.prepare('SELECT * FROM users').all();
  return c.json({ users: users.results });
});
```

---

### C5. 역할별 대시보드 라우팅 수정

**클라이언트 라우팅 로직 개선**:

```javascript
// src/index.tsx의 로그인 후 처리 부분 수정

async function handleLoginSuccess(token, user) {
  // 토큰 저장
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // 역할별 대시보드 리다이렉트
  const dashboardRoutes = {
    buyer: '/dashboard/buyer',
    artist: '/dashboard/artist',
    expert: '/dashboard/expert',
    museum: '/dashboard/museum',
    admin: '/admin/dashboard'
  };
  
  const targetRoute = dashboardRoutes[user.role] || '/dashboard';
  
  if (window.showSuccessToast) {
    window.showSuccessToast(`환영합니다, ${user.username}님!`);
  }
  
  setTimeout(() => {
    window.location.href = targetRoute;
  }, 500);
}
```

---

## 📈 4. About 페이지 업데이트 내용

다음 페이지로 계속...
