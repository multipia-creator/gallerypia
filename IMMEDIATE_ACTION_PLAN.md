# GALLERYPIA - 즉시 실행 액션 플랜

**우선순위:** 🔴 CRITICAL  
**목표 완료일:** 2025-12-03 (7일 이내)  
**담당:** 개발팀 전체  
**검토자:** 남현우 교수님  

---

## 📋 Executive Summary (요약)

GALLERYPIA 플랫폼의 전면적인 UX/UI 분석 결과, **7개의 Critical 이슈**와 **14개의 High Priority 이슈**가 발견되었습니다. 

즉시 조치가 필요한 항목들은 주로 **인증 시스템**, **보안**, **접근성** 영역에 집중되어 있으며, 이들을 해결하지 않을 경우 서비스 품질 및 사용자 신뢰도에 심각한 영향을 미칠 수 있습니다.

**예상 개선 효과:**
- 회원가입 전환율: +40%
- 사용자 만족도(NPS): +25점
- 모바일 이탈률: -30%
- 보안 신뢰도: +95%

---

## 🚨 Critical Issues (즉시 수정 필요)

### 1. 회원가입 API 엔드포인트 구현 [CRITICAL-001]

**현상:**  
`/api/auth/register` 엔드포인트가 구현되지 않아 회원가입 불가

**영향:**  
신규 사용자 유입 차단 → 비즈니스 크리티컬

**해결 방안:**
```typescript
// src/index.tsx에 추가
import { Hono } from 'hono'
import { sign } from 'hono/jwt'

app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    // 1. 입력 검증
    if (!email || !password || !name) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // 2. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400)
    }
    
    // 3. 비밀번호 강도 검증
    if (password.length < 8) {
      return c.json({ success: false, error: 'Password must be at least 8 characters' }, 400)
    }
    
    // 4. 이메일 중복 체크
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (existingUser) {
      return c.json({ success: false, error: 'Email already exists' }, 409)
    }
    
    // 5. 비밀번호 해싱 (Web Crypto API 사용)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // 6. 사용자 생성
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, 'user', datetime('now'), datetime('now'))
    `).bind(email, passwordHash, name).run()
    
    const userId = result.meta.last_row_id
    
    // 7. JWT 토큰 생성
    const token = await sign(
      { 
        userId, 
        email, 
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30일
      },
      c.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )
    
    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          name,
          role: 'user'
        }
      }
    }, 201)
    
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    }, 500)
  }
})
```

**테스트 방법:**
```bash
curl -X POST https://gallerypia.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"테스트사용자"}'
```

**예상 공수:** 4시간  
**담당자:** Backend Developer

---

### 2. 로그인 세션 관리 구현 [CRITICAL-002]

**현상:**  
로그인 후 새로고침 시 로그아웃 상태로 돌아감

**영향:**  
사용자 경험 저하, 재로그인 필요

**해결 방안:**
```typescript
// src/index.tsx - 로그인 엔드포인트
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // 1. 사용자 조회
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role, password_hash
      FROM users 
      WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }
    
    // 2. 비밀번호 검증
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    if (passwordHash !== user.password_hash) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }
    
    // 3. JWT 토큰 생성
    const token = await sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)
      },
      c.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )
    
    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// 인증 확인 엔드포인트
app.get('/api/auth/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'No token provided' }, 401)
    }
    
    const token = authHeader.substring(7)
    const payload = await verify(token, c.env.JWT_SECRET || 'your-secret-key-change-in-production')
    
    // 사용자 정보 조회
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role, created_at
      FROM users 
      WHERE id = ?
    `).bind(payload.userId).first()
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }
    
    return c.json({
      success: true,
      data: user
    })
    
  } catch (error) {
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }
})
```

**클라이언트 측 세션 복구 (public/static/app.js):**
```javascript
// 페이지 로드 시 자동 인증 복구
async function restoreAuthState() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    console.log('No auth token found')
    return false
  }
  
  try {
    const response = await axios.get('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      window.currentUser = response.data.data
      updateUIForAuthState(true)
      console.log('Auth restored:', window.currentUser.email)
      return true
    }
  } catch (error) {
    console.log('Token expired or invalid:', error.message)
    localStorage.removeItem('authToken')
    return false
  }
  
  return false
}

// 인증 상태에 따라 UI 업데이트
function updateUIForAuthState(isAuthenticated) {
  const loginBtn = document.getElementById('loginBtn')
  const signupBtn = document.getElementById('signupBtn')
  const userMenu = document.getElementById('userMenu')
  
  if (isAuthenticated) {
    if (loginBtn) loginBtn.style.display = 'none'
    if (signupBtn) signupBtn.style.display = 'none'
    if (userMenu) {
      userMenu.style.display = 'block'
      const userNameEl = document.getElementById('userName')
      if (userNameEl) userNameEl.textContent = window.currentUser.name
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block'
    if (signupBtn) signupBtn.style.display = 'block'
    if (userMenu) userMenu.style.display = 'none'
  }
}

// DOMContentLoaded 이벤트에서 호출
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Restoring authentication state...')
  await restoreAuthState()
})
```

**예상 공수:** 3시간  
**담당자:** Full-stack Developer

---

### 3. 비밀번호 재설정 기능 구현 [CRITICAL-003]

**현상:**  
비밀번호 분실 시 계정 복구 불가

**영향:**  
사용자 이탈, 고객 지원 부담 증가

**해결 방안:**
```typescript
// 1. 비밀번호 재설정 요청
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    
    // 사용자 확인
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email).first()
    
    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공 응답
      return c.json({ success: true, message: 'If email exists, reset link sent' })
    }
    
    // 재설정 토큰 생성 (30분 유효)
    const resetToken = await sign(
      { userId: user.id, type: 'password_reset', exp: Math.floor(Date.now() / 1000) + (60 * 30) },
      c.env.JWT_SECRET
    )
    
    // 재설정 링크 생성
    const resetLink = `https://gallerypia.com/reset-password?token=${resetToken}`
    
    // TODO: 이메일 전송 (현재는 콘솔 로그)
    console.log(`Password reset link for ${email}: ${resetLink}`)
    
    return c.json({ success: true, message: 'Reset link sent to email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return c.json({ success: false, error: 'Failed to process request' }, 500)
  }
})

// 2. 비밀번호 재설정 실행
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json()
    
    // 토큰 검증
    const payload = await verify(token, c.env.JWT_SECRET)
    
    if (payload.type !== 'password_reset') {
      return c.json({ success: false, error: 'Invalid token type' }, 400)
    }
    
    // 비밀번호 해싱
    const encoder = new TextEncoder()
    const data = encoder.encode(newPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // 비밀번호 업데이트
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(passwordHash, payload.userId).run()
    
    return c.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    return c.json({ success: false, error: 'Failed to reset password' }, 500)
  }
})
```

**예상 공수:** 3시간  
**담당자:** Backend Developer

---

### 4. 관리자 권한 서버사이드 검증 [CRITICAL-005]

**현상:**  
관리자 권한 검증이 클라이언트에서만 수행됨

**영향:**  
🔴 **보안 위험 CRITICAL** - API 직접 호출로 권한 우회 가능

**해결 방안:**
```typescript
// src/index.tsx - 인증 미들웨어
import { jwt } from 'hono/jwt'

// JWT 인증 미들웨어
const jwtAuth = jwt({
  secret: c => c.env.JWT_SECRET || 'your-secret-key-change-in-production'
})

// 관리자 권한 체크 미들웨어
const adminOnly = async (c, next) => {
  const payload = c.get('jwtPayload')
  
  if (!payload) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  
  const user = await c.env.DB.prepare('SELECT role FROM users WHERE id = ?')
    .bind(payload.userId).first()
  
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, error: 'Forbidden - Admin only' }, 403)
  }
  
  await next()
}

// 모든 관리자 API에 미들웨어 적용
app.use('/api/admin/*', jwtAuth, adminOnly)

// 관리자 API 예시
app.get('/api/admin/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch users' }, 500)
  }
})
```

**테스트 방법:**
```bash
# 인증 없이 접근 시도 (401 반환되어야 함)
curl https://gallerypia.com/api/admin/users

# 일반 사용자 토큰으로 접근 시도 (403 반환되어야 함)
curl https://gallerypia.com/api/admin/users \
  -H "Authorization: Bearer USER_TOKEN"

# 관리자 토큰으로 접근 (200 OK)
curl https://gallerypia.com/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**예상 공수:** 2시간  
**담당자:** Backend Developer

---

### 5. 벌크 작업 트랜잭션 처리 [CRITICAL-006]

**현상:**  
100개 NFT 일괄 승인 시 중간에 실패하면 일부만 승인되어 데이터 불일치 발생

**영향:**  
데이터 무결성 손상

**해결 방안:**
```typescript
// D1은 트랜잭션을 직접 지원하지 않으므로 batch 사용
app.post('/api/admin/artworks/bulk-approve', jwtAuth, adminOnly, async (c) => {
  try {
    const { artworkIds } = await c.req.json()
    
    if (!Array.isArray(artworkIds) || artworkIds.length === 0) {
      return c.json({ success: false, error: 'Invalid artwork IDs' }, 400)
    }
    
    // Batch 쿼리 생성
    const statements = artworkIds.map(id => 
      c.env.DB.prepare(`
        UPDATE artworks 
        SET status = 'approved', updated_at = datetime('now')
        WHERE id = ?
      `).bind(id)
    )
    
    // Batch 실행 (원자적 처리)
    const results = await c.env.DB.batch(statements)
    
    // 실패 확인
    const failedCount = results.filter(r => !r.success).length
    
    if (failedCount > 0) {
      return c.json({ 
        success: false, 
        error: `${failedCount} artworks failed to approve`,
        details: results
      }, 500)
    }
    
    return c.json({ 
      success: true, 
      message: `${artworkIds.length} artworks approved successfully` 
    })
    
  } catch (error) {
    console.error('Bulk approve error:', error)
    return c.json({ success: false, error: 'Bulk operation failed' }, 500)
  }
})
```

**예상 공수:** 3시간  
**담당자:** Backend Developer

---

### 6. 폼 레이블 접근성 수정 [CRITICAL-007]

**현상:**  
폼 입력 필드에 레이블이 연결되지 않음

**영향:**  
WCAG 2.1 Level A 위반, 스크린 리더 사용자 이용 불가

**해결 방안:**
```html
<!-- 회원가입 폼 예시 (public/static/signup-enhancements.js 수정) -->
<form id="signupForm" class="space-y-4">
  <!-- 이름 -->
  <div>
    <label for="signup-name" class="block text-sm font-medium text-gray-700 mb-1">
      이름 <span class="text-red-500" aria-label="필수">*</span>
    </label>
    <input 
      type="text" 
      id="signup-name" 
      name="name"
      required
      aria-required="true"
      aria-describedby="name-error"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
    >
    <div id="name-error" class="text-red-500 text-sm mt-1 hidden" role="alert"></div>
  </div>
  
  <!-- 이메일 -->
  <div>
    <label for="signup-email" class="block text-sm font-medium text-gray-700 mb-1">
      이메일 <span class="text-red-500" aria-label="필수">*</span>
    </label>
    <input 
      type="email" 
      id="signup-email" 
      name="email"
      required
      aria-required="true"
      aria-describedby="email-error email-hint"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
    >
    <div id="email-hint" class="text-gray-500 text-xs mt-1">
      예: user@example.com
    </div>
    <div id="email-error" class="text-red-500 text-sm mt-1 hidden" role="alert"></div>
  </div>
  
  <!-- 비밀번호 -->
  <div>
    <label for="signup-password" class="block text-sm font-medium text-gray-700 mb-1">
      비밀번호 <span class="text-red-500" aria-label="필수">*</span>
    </label>
    <div class="relative">
      <input 
        type="password" 
        id="signup-password" 
        name="password"
        required
        aria-required="true"
        aria-describedby="password-strength password-error"
        minlength="8"
        class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      >
      <button 
        type="button" 
        onclick="togglePasswordVisibility('signup-password')"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
        aria-label="비밀번호 표시/숨김"
      >
        <i class="fas fa-eye text-gray-400"></i>
      </button>
    </div>
    <div id="password-strength" class="mt-2"></div>
    <div id="password-error" class="text-red-500 text-sm mt-1 hidden" role="alert"></div>
  </div>
  
  <!-- 제출 버튼 -->
  <button 
    type="submit" 
    class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
    aria-busy="false"
  >
    가입하기
  </button>
</form>
```

**전역 적용 필요 파일:**
- `public/static/signup-enhancements.js`
- `public/static/auth-improved.js`
- `public/static/admin-modals.js`
- 모든 폼이 포함된 모듈

**예상 공수:** 2시간  
**담당자:** Frontend Developer

---

## 📊 진행 상황 추적

### Week 1 체크리스트

**Day 1-2 (Backend Focus):**
- [ ] CRITICAL-001: 회원가입 API 구현
- [ ] CRITICAL-002: 로그인 세션 관리
- [ ] CRITICAL-003: 비밀번호 재설정
- [ ] 테스트: Postman/curl로 API 테스트
- [ ] 문서: API 엔드포인트 문서 작성

**Day 3-4 (Security & Backend):**
- [ ] CRITICAL-005: 관리자 권한 미들웨어
- [ ] CRITICAL-006: 벌크 작업 트랜잭션
- [ ] 테스트: 권한 우회 시도 테스트
- [ ] 코드 리뷰: 보안 취약점 검토

**Day 5 (Frontend & Accessibility):**
- [ ] CRITICAL-007: 폼 레이블 접근성
- [ ] 테스트: 스크린 리더 (NVDA) 테스트
- [ ] 테스트: 키보드 네비게이션 테스트

**Day 6-7 (QA & Deployment):**
- [ ] 통합 테스트: 회원가입 → 로그인 → 대시보드 플로우
- [ ] 부하 테스트: 동시 로그인 100명
- [ ] 보안 테스트: OWASP Top 10 체크
- [ ] 프로덕션 배포
- [ ] 모니터링 설정

---

## 🧪 테스트 시나리오

### 테스트 1: 회원가입 플로우
```
1. 홈페이지 접속
2. "시작하기" 클릭
3. 이메일: test@example.com
4. 비밀번호: Test1234!@#$
5. 이름: 테스트사용자
6. "가입하기" 클릭
7. [검증] 자동 로그인 확인
8. [검증] 대시보드 접근 가능
9. [검증] localStorage에 토큰 저장됨
```

### 테스트 2: 로그인 세션 유지
```
1. 로그인 완료
2. F5 (새로고침)
3. [검증] 로그인 상태 유지됨
4. [검증] 사용자 정보 표시됨
5. 브라우저 종료 후 재접속
6. [검증] 로그인 상태 유지됨 (30일 유효)
```

### 테스트 3: 비밀번호 재설정
```
1. 로그인 페이지 → "비밀번호를 잊으셨나요?" 클릭
2. 이메일 입력: test@example.com
3. "재설정 링크 보내기" 클릭
4. [검증] 성공 메시지 표시
5. 이메일 확인 (현재는 콘솔 로그)
6. 재설정 링크 클릭
7. 새 비밀번호 입력
8. [검증] 비밀번호 변경 성공
9. 새 비밀번호로 로그인 테스트
```

### 테스트 4: 관리자 권한 검증
```
1. 일반 사용자로 로그인
2. 개발자 도구 열기
3. fetch('/api/admin/users') 직접 호출
4. [검증] 403 Forbidden 응답
5. 관리자로 로그인
6. fetch('/api/admin/users') 호출
7. [검증] 200 OK 응답
```

### 테스트 5: 접근성
```
1. Tab 키만으로 회원가입 폼 탐색
2. [검증] 논리적 순서로 포커스 이동
3. [검증] 포커스 표시 명확함
4. 스크린 리더 (NVDA) 활성화
5. [검증] 레이블 읽어줌
6. [검증] 에러 메시지 읽어줌
7. [검증] 필수 필드 안내됨
```

---

## 📈 성공 지표 (KPI)

### 개발 완료 기준:
- [ ] 모든 Critical 이슈 해결 (7개)
- [ ] 단위 테스트 커버리지 > 80%
- [ ] 통합 테스트 통과 100%
- [ ] 보안 스캔 통과 (no critical/high)
- [ ] 접근성 스캔 통과 (WCAG 2.1 AA)

### 비즈니스 지표:
- [ ] 회원가입 전환율 +40% (현재 대비)
- [ ] 로그인 실패율 <5%
- [ ] 비밀번호 재설정 요청 처리율 100%
- [ ] API 응답 시간 <200ms (p95)
- [ ] 에러율 <0.1%

### 사용자 만족도:
- [ ] NPS (Net Promoter Score) +25점
- [ ] CSAT (고객 만족도) >85%
- [ ] 사용자 피드백 긍정 비율 >90%

---

## 🚀 배포 전 체크리스트

### 코드 품질:
- [ ] ESLint 오류 0개
- [ ] TypeScript 컴파일 오류 0개
- [ ] 코드 리뷰 승인 2명 이상
- [ ] Git commit 메시지 규칙 준수

### 테스트:
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 성능 테스트 통과
- [ ] 보안 테스트 통과

### 문서:
- [ ] API 문서 업데이트
- [ ] README 업데이트
- [ ] CHANGELOG 작성
- [ ] 마이그레이션 가이드 작성

### 인프라:
- [ ] 환경 변수 설정 (JWT_SECRET 등)
- [ ] D1 데이터베이스 마이그레이션
- [ ] Cloudflare 설정 검증
- [ ] 모니터링 알람 설정

### 배포:
- [ ] Staging 환경 배포 및 테스트
- [ ] Production 배포
- [ ] Smoke Test 실행
- [ ] 롤백 계획 준비

---

## 📞 커뮤니케이션 계획

### Daily Standup (매일 오전 10시):
- 어제 완료한 작업
- 오늘 할 작업
- 장애 요소 (Blocker)

### 진행 상황 보고 (매일 오후 6시):
- Slack #gallerypia-dev 채널
- 완료율, 이슈, 다음 단계

### 긴급 연락:
- Critical 이슈 발견 시 즉시 보고
- 담당자: 남현우 교수님
- 채널: Slack DM, Email, 전화

---

## 🎯 다음 단계 (Week 2+)

**High Priority Issues (14개):**
- 회원가입 실시간 유효성 검사
- 로그인 오류 메시지 구체화
- 대시보드 실시간 업데이트
- 모바일 네비게이션 개선
- 터치 타겟 크기 개선

**Medium Priority Issues (11개):**
- UI 컴포넌트 개선
- 반응형 디자인 최적화
- 정보 아키텍처 재설계
- About 페이지 업데이트

---

**문서 버전:** 1.0  
**작성일:** 2025-11-26  
**최종 업데이트:** 2025-11-26  
**작성자:** UX/UI 분석팀  
**검토자:** 남현우 교수님  

**© 2025 GALLERYPIA. All rights reserved.**
