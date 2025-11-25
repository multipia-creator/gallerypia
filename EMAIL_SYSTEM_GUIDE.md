# Email System Integration Guide

## 📧 개요

Mailchannels API를 사용한 이메일 시스템 (Cloudflare Workers 최적화)

## 🔧 구현 내용

### 1. Email Utility (src/utils/email.ts)

**4개의 이메일 템플릿:**
- ✅ Welcome Email (회원가입 환영)
- 🔐 Password Reset Email (비밀번호 재설정)
- ✅ Artwork Approved Email (작품 승인)
- ❌ Artwork Rejected Email (작품 거부)

### 2. 사용 방법

```typescript
import { sendEmail, getWelcomeEmailHTML } from './utils/email'

// 회원가입 시
await sendEmail({
  to: user.email,
  subject: '갤러리피아에 오신 것을 환영합니다!',
  html: getWelcomeEmailHTML(user.name, user.email)
})

// 비밀번호 재설정 시
await sendEmail({
  to: user.email,
  subject: '비밀번호 재설정 요청',
  html: getPasswordResetEmailHTML(user.name, resetToken)
})

// 작품 승인 시
await sendEmail({
  to: artist.email,
  subject: '작품이 승인되었습니다',
  html: getArtworkApprovedEmailHTML(artist.name, artwork.title)
})
```

## 📨 Mailchannels 설정

### Cloudflare Workers와 통합
Mailchannels는 Cloudflare Workers에서 무료로 사용 가능합니다.

**특징:**
- ✅ 무료 (Cloudflare Workers 전용)
- ✅ 설정 불필요 (API Key 불필요)
- ✅ HTML/Text 이메일 지원
- ⚠️ SPF/DKIM 설정 권장 (deliverability 향상)

### SPF 레코드 설정 (선택사항)

도메인 DNS에 다음 TXT 레코드 추가:

```
v=spf1 include:relay.mailchannels.net ~all
```

## 🎨 이메일 템플릿 디자인

### Welcome Email
- Gradient 헤더 (보라색)
- 플랫폼 기능 소개
- CTA 버튼
- 반응형 디자인

### Password Reset Email
- 안전성 강조 (빨간색 gradient)
- 1시간 유효 링크
- 보안 주의사항
- 간단한 재설정 프로세스

### Artwork Approved/Rejected Email
- 승인: 축하 디자인 (초록색)
- 거부: 피드백 제공 (빨간색)
- 다음 단계 안내
- 개선 제안

## 📊 통합 포인트

### 1. 회원가입 (src/index.tsx)
```typescript
app.post('/api/auth/signup', async (c) => {
  // ... user creation ...
  
  // Send welcome email
  await sendEmail({
    to: email,
    subject: '갤러리피아에 오신 것을 환영합니다!',
    html: getWelcomeEmailHTML(name, email)
  })
})
```

### 2. 비밀번호 재설정
```typescript
app.post('/api/auth/forgot-password', async (c) => {
  const resetToken = generateResetToken()
  
  await sendEmail({
    to: user.email,
    subject: '비밀번호 재설정 요청',
    html: getPasswordResetEmailHTML(user.name, resetToken)
  })
})
```

### 3. 작품 승인 (src/routes/admin.tsx)
```typescript
admin.post('/artworks/:id/approve', async (c) => {
  // ... approval logic ...
  
  await sendEmail({
    to: artist.email,
    subject: '작품이 승인되었습니다',
    html: getArtworkApprovedEmailHTML(artist.name, artwork.title)
  })
})
```

### 4. 작품 거부 (src/routes/admin.tsx)
```typescript
admin.post('/artworks/:id/reject', async (c) => {
  const { reason } = await c.req.json()
  
  await sendEmail({
    to: artist.email,
    subject: '작품 심사 결과',
    html: getArtworkRejectedEmailHTML(artist.name, artwork.title, reason)
  })
})
```

## 🔍 테스트

### 로컬 테스트
```bash
# Mailchannels는 production에서만 작동
# 로컬에서는 console.log로 확인

# Test signup email
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"테스터","password":"Test123!"}'
```

### 프로덕션 테스트
실제 이메일이 발송됩니다.

## ⚠️ 주의사항

1. **Rate Limiting**: 이메일 발송에도 rate limit 적용
2. **에러 핸들링**: 이메일 발송 실패는 로그만 남기고 계속 진행
3. **스팸 방지**: From 주소 고정 (noreply@gallerypia.com)
4. **Deliverability**: SPF/DKIM 설정으로 스팸 방지

## 📈 향후 개선사항

- [ ] 이메일 발송 이력 저장
- [ ] 이메일 template 다국어 지원
- [ ] 사용자 이메일 설정 (수신 거부)
- [ ] 이메일 통계 (발송/오픈/클릭률)
- [ ] 추가 템플릿 (거래 완료, 평가 요청 등)

## 📚 참고 자료

- [Mailchannels Documentation](https://mailchannels.zendesk.com/hc/en-us)
- [Cloudflare Workers Email](https://developers.cloudflare.com/workers/examples/email/)
