# 갤러리피아 커스텀 도메인 설정 가이드

## 🌐 현재 상태

### ✅ 정상 작동하는 URL (즉시 사용 가능)
- **메인**: https://gallerypia.pages.dev
- **최신**: https://142b0f0c.gallerypia.pages.dev
- **안정**: https://d6b087d2.gallerypia.pages.dev

### ⚠️ 설정 필요: gallerypia.com
현재 SSL handshake failed (Error 525) 발생 중

---

## 🔧 gallerypia.com 도메인 연결 방법

### 문제 원인
- DNS에 잘못된 A 레코드가 설정되어 있음
- CNAME 레코드가 없음
- SSL/TLS 모드가 잘못 설정됨

### 해결 방법

#### 1단계: Cloudflare 대시보드 접속
1. https://dash.cloudflare.com 로그인
2. `gallerypia.com` 도메인 선택

#### 2단계: DNS 레코드 수정

**좌측 메뉴 → DNS → Records**

**기존 레코드 삭제:**
```
❌ A 레코드 (104.21.95.223) → 삭제
❌ A 레코드 (172.67.171.125) → 삭제
```

**새 레코드 추가:**

**레코드 1: 루트 도메인**
```
Type: CNAME
Name: @ (또는 gallerypia.com)
Target: gallerypia.pages.dev
Proxy status: Proxied (☁️ 주황색 구름)
TTL: Auto
```

**레코드 2: www 서브도메인**
```
Type: CNAME
Name: www
Target: gallerypia.pages.dev
Proxy status: Proxied (☁️ 주황색 구름)
TTL: Auto
```

#### 3단계: SSL/TLS 설정

**좌측 메뉴 → SSL/TLS → Overview**

**암호화 모드 변경:**
```
현재: Flexible 또는 Off
변경: Full ✅
```

#### 4단계: Universal SSL 확인

**SSL/TLS → Edge Certificates**

확인 사항:
- ✅ Universal SSL: Active
- ✅ Always Use HTTPS: ON
- ✅ Automatic HTTPS Rewrites: ON

만약 Universal SSL이 Inactive면:
1. "Disable Universal SSL" 클릭
2. 5초 대기
3. "Enable Universal SSL" 클릭

#### 5단계: Cache 제거 (선택사항)

**좌측 메뉴 → Caching → Configuration**
- "Purge Everything" 클릭

---

## ⏰ 예상 적용 시간

- DNS 전파: 5~10분
- SSL 인증서 발급: 10~30분
- 완전 활성화: 최대 1시간

---

## 🧪 테스트 방법

### DNS 확인
```bash
nslookup gallerypia.com
# 예상: CNAME gallerypia.pages.dev
```

### 접속 테스트
```bash
curl -I https://gallerypia.com
# 예상: HTTP/2 200 OK
```

---

## 📋 최종 확인 체크리스트

설정 완료 후 다음을 확인:

- [ ] DNS CNAME 레코드: gallerypia.pages.dev
- [ ] Proxy 상태: ON (주황색 구름)
- [ ] SSL 모드: Full
- [ ] Universal SSL: Active
- [ ] https://gallerypia.com 접속: 200 OK
- [ ] https://www.gallerypia.com 접속: 200 OK
- [ ] 자동 HTTPS 리다이렉트 작동
- [ ] SSL 인증서 정상 (자물쇠 아이콘)

---

## ❓ 문제 해결

### Error 525 계속 발생
- SSL/TLS 모드를 "Full"로 변경
- Universal SSL이 Active인지 확인
- Cache 제거 후 10분 대기

### DNS_PROBE_FINISHED_NXDOMAIN
- DNS 전파 대기 (최대 24시간)
- CNAME 레코드가 올바른지 확인

### 리다이렉트 루프 (ERR_TOO_MANY_REDIRECTS)
- SSL/TLS 모드를 "Full"로 변경
- "Always Use HTTPS" 끄기

---

## 💡 권장 사항

### 당장 사용해야 한다면
✅ **https://gallerypia.pages.dev** 사용 (정상 작동)

### 프로페셔널 도메인 필요
⏳ 위 설정 완료 후 **gallerypia.com** 사용 (30분~1시간 소요)

### 양쪽 모두 작동
- gallerypia.com (커스텀 도메인)
- gallerypia.pages.dev (서브도메인)

---

## 📞 지원

설정 중 문제가 발생하면:

1. Cloudflare DNS 페이지 스크린샷
2. SSL/TLS 설정 페이지 스크린샷
3. 브라우저 에러 메시지

위 정보를 제공하면 정확한 해결책을 제시할 수 있습니다.

---

**작성일**: 2025-11-15  
**프로젝트**: 갤러리피아 v8.5  
**연락처**: gallerypia@gmail.com
