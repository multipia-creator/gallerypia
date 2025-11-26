# GALLERYPIA Custom Domain Setup Guide
## gallerypia.com 도메인 연결 방법

**Project**: GALLERYPIA  
**Domain**: gallerypia.com  
**Current URL**: https://997be590.gallerypia.pages.dev

---

## 🎯 설정 방법

### **Option A: Cloudflare Dashboard (추천)**

#### 1. Cloudflare Pages Dashboard 접속
https://dash.cloudflare.com/ → Pages → gallerypia

#### 2. Custom Domains 탭 클릭
- 왼쪽 메뉴에서 "Custom domains" 선택

#### 3. Add a custom domain 클릭
- 입력: `gallerypia.com`
- "Continue" 클릭

#### 4. DNS 레코드 자동 설정
Cloudflare가 자동으로 DNS 레코드를 추가합니다:

```
Type: CNAME
Name: gallerypia.com (또는 @)
Target: 997be590.gallerypia.pages.dev
Proxy: Enabled (주황색 구름)
```

#### 5. www 서브도메인 추가 (선택사항)
- `www.gallerypia.com` 도 추가
- 자동으로 gallerypia.com으로 리다이렉트

---

### **Option B: Cloudflare API (고급)**

```bash
# 1. Zone ID 확인
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_CLOUDFLARE_API_TOKEN" \
  | grep -A 5 "gallerypia.com"

# 2. DNS 레코드 추가
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer YOUR_CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "gallerypia.com",
    "content": "997be590.gallerypia.pages.dev",
    "proxied": true
  }'

# 3. Pages 프로젝트에 도메인 연결
curl -X POST "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/gallerypia/domains" \
  -H "Authorization: Bearer YOUR_CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "gallerypia.com"
  }'
```

---

### **Option C: 다른 DNS 제공자 사용 시**

도메인이 Cloudflare에 등록되지 않은 경우:

#### 1. DNS 제공자 (Namecheap, GoDaddy 등)에서 설정

```
Type: CNAME
Host: @ (또는 gallerypia.com)
Value: 997be590.gallerypia.pages.dev
TTL: Auto 또는 3600
```

#### 2. www 서브도메인도 추가
```
Type: CNAME
Host: www
Value: 997be590.gallerypia.pages.dev
TTL: Auto 또는 3600
```

#### 3. Cloudflare Pages Dashboard에서 도메인 추가
- Custom domains → Add domain
- `gallerypia.com` 입력
- DNS 검증 대기 (최대 24시간)

---

## 🔍 설정 확인

### DNS 전파 확인
```bash
# 1. DNS 조회
dig gallerypia.com CNAME

# 2. 또는 nslookup
nslookup gallerypia.com

# 3. 온라인 도구
# https://dnschecker.org/
```

### HTTPS 인증서 확인
- Cloudflare는 자동으로 SSL/TLS 인증서 발급
- 보통 5-10분 소요
- 최대 24시간 (드물게)

---

## ⚙️ 고급 설정

### 1. Redirect Rules (www → non-www)
```javascript
// _redirects 파일에 추가
https://www.gallerypia.com/* https://gallerypia.com/:splat 301
```

### 2. Custom Headers
```
# _headers 파일 (이미 존재)
https://gallerypia.com/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 3. Page Rules
Cloudflare Dashboard → Page Rules:
- Always Use HTTPS
- Browser Cache TTL: 4 hours
- Security Level: Medium

---

## 🎯 예상 결과

설정 완료 후:

### **Primary Domain**
🌐 https://gallerypia.com
- Production 최신 버전
- 자동 HTTPS
- 글로벌 CDN

### **www Subdomain**
🌐 https://www.gallerypia.com
- gallerypia.com으로 리다이렉트

### **Pages.dev (유지)**
🌐 https://997be590.gallerypia.pages.dev
- 백업 URL
- 테스트 목적
- 직접 접근 가능

---

## 📊 DNS 전파 시간

| 레코드 타입 | 예상 시간 |
|------------|-----------|
| CNAME | 5-30분 |
| A | 5-30분 |
| SSL 인증서 | 5-15분 |
| 전체 전파 | 최대 24시간 |

---

## ✅ 체크리스트

### 설정 전
- [ ] gallerypia.com 도메인 소유 확인
- [ ] Cloudflare 계정 로그인
- [ ] gallerypia Pages 프로젝트 존재 확인

### 설정 중
- [ ] Custom domain 추가 (gallerypia.com)
- [ ] www 서브도메인 추가 (선택)
- [ ] DNS 레코드 확인
- [ ] SSL 인증서 활성화 대기

### 설정 후
- [ ] https://gallerypia.com 접속 테스트
- [ ] HTTPS 작동 확인
- [ ] www 리다이렉트 확인
- [ ] 모든 페이지 정상 작동 확인

---

## 🆘 문제 해결

### 1. "This site can't be reached"
- **원인**: DNS 전파 미완료
- **해결**: 30분 후 재시도

### 2. "Your connection is not private"
- **원인**: SSL 인증서 발급 중
- **해결**: 10-15분 대기 후 재시도

### 3. "404 Not Found"
- **원인**: Pages 프로젝트에 도메인 미연결
- **해결**: Cloudflare Pages Dashboard에서 도메인 추가

### 4. "Too many redirects"
- **원인**: Redirect rules 충돌
- **해결**: Page Rules 및 _redirects 파일 확인

---

## 📞 Support

### Cloudflare Support
- Dashboard: https://dash.cloudflare.com/
- Docs: https://developers.cloudflare.com/pages/
- Community: https://community.cloudflare.com/

### GALLERYPIA Support
- GitHub: https://github.com/multipia-creator/gallerypia
- Production: https://997be590.gallerypia.pages.dev

---

## 🎉 완료 후

Custom domain 설정이 완료되면:

1. **README.md 업데이트**
   ```markdown
   ## 🌐 Live Demo
   https://gallerypia.com
   ```

2. **소셜 미디어 공유**
   - "GALLERYPIA is now live at https://gallerypia.com!"

3. **SEO 최적화**
   - Google Search Console 등록
   - Sitemap 제출

4. **Analytics 설정**
   - Google Analytics
   - Cloudflare Web Analytics

---

**현재 상태**: ⏳ Custom Domain 설정 대기 중

**다음 단계**: 
1. Cloudflare Dashboard에서 gallerypia.com 추가
2. DNS 전파 대기 (5-30분)
3. https://gallerypia.com 접속 확인
4. 베타 테스트 시작

---

*Guide created: 2025-11-26*  
*GALLERYPIA - The Ultimate NFT Art Platform*
