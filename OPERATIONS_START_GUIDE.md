# GALLERYPIA Operations Start Guide
## 운영 시작 및 모니터링 가이드

**Project**: GALLERYPIA NFT Art Platform  
**Status**: Production Ready  
**Start Date**: TBD  
**Production URL**: https://gallerypia.com (또는 https://997be590.gallerypia.pages.dev)

---

## 🎯 운영 시작 체크리스트

### **Pre-Launch (론칭 전)**

#### **인프라**
- [x] Cloudflare Pages 배포 완료
- [ ] Custom Domain 설정 (gallerypia.com)
- [ ] SSL/TLS 인증서 활성화
- [ ] DNS 전파 확인
- [ ] CDN 캐싱 설정

#### **모니터링 도구**
- [ ] Google Analytics 4 설정
- [ ] Cloudflare Web Analytics 활성화
- [ ] Sentry 에러 트래킹 설정
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Lighthouse CI)

#### **백업 & 보안**
- [x] GitHub 리포지토리 백업
- [x] 프로젝트 tar.gz 백업
- [ ] 자동 백업 스케줄 설정
- [ ] Cloudflare Firewall 규칙
- [ ] Rate Limiting 설정
- [ ] DDoS Protection 활성화

#### **문서화**
- [x] README.md 최신화
- [x] OPERATIONS_GUIDE.md
- [x] USER_MANUAL.md
- [x] BETA_TEST_PLAN.md
- [x] MARKETING_STRATEGY.md
- [x] Custom Domain 가이드

#### **Support**
- [ ] Support 이메일 설정 (support@gallerypia.com)
- [ ] Discord 서버 개설
- [ ] FAQ 페이지 작성
- [ ] Ticket 시스템 (선택)

---

## 📊 모니터링 대시보드

### **1. Cloudflare Analytics**

#### **주요 지표**
- **Requests**: 총 요청 수
- **Bandwidth**: 데이터 전송량
- **Unique Visitors**: 순 방문자
- **Page Views**: 페이지 뷰
- **Cache Ratio**: 캐시 적중률 (>80% 목표)

#### **Security**
- **Threats Mitigated**: 차단된 위협
- **WAF Events**: 방화벽 이벤트
- **Rate Limiting**: 제한된 요청

#### **Performance**
- **Origin Response Time**: 서버 응답 시간 (<200ms)
- **Edge Response Time**: CDN 응답 시간 (<50ms)
- **Error Rate**: 에러율 (<1%)

**Dashboard 접속**: https://dash.cloudflare.com/

---

### **2. Google Analytics 4**

#### **설정 방법**
```html
<!-- public/index.html에 추가 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### **주요 지표**
- **Users**: 총 사용자 수 (DAU, MAU)
- **Sessions**: 세션 수
- **Engagement Rate**: 참여율
- **Average Session Duration**: 평균 세션 시간
- **Bounce Rate**: 이탈률

#### **Custom Events 설정**
```javascript
// NFT 조회
gtag('event', 'nft_view', {
  'nft_id': '123',
  'nft_price': '0.5',
  'category': 'Digital Art'
});

// NFT 구매
gtag('event', 'nft_purchase', {
  'transaction_id': 'TX-123',
  'value': 0.5,
  'currency': 'ETH'
});

// 지갑 연결
gtag('event', 'wallet_connect', {
  'wallet_type': 'MetaMask',
  'chain': 'Ethereum'
});
```

**Dashboard 접속**: https://analytics.google.com/

---

### **3. Sentry 에러 트래킹**

#### **설정 방법**
```bash
# 설치
npm install @sentry/browser

# src/index.tsx에 추가
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

#### **모니터링 항목**
- **JavaScript Errors**: 프론트엔드 에러
- **Network Errors**: API 호출 실패
- **Performance Issues**: 느린 트랜잭션
- **User Feedback**: 사용자 피드백

#### **알림 설정**
- **Critical Errors**: 즉시 알림 (Slack, Email)
- **High Errors**: 30분 내 알림
- **Medium Errors**: 일일 요약

**Dashboard 접속**: https://sentry.io/

---

### **4. Uptime Monitoring**

#### **UptimeRobot 설정**
- **Monitoring Type**: HTTPS
- **URL**: https://gallerypia.com
- **Interval**: 5분
- **Alert**: Email, SMS, Slack

#### **Health Check Endpoints**
```javascript
// src/index.tsx에 추가
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/status', (c) => {
  // 상세 상태 확인
  return c.json({
    status: 'operational',
    services: {
      database: 'ok',
      storage: 'ok',
      blockchain: 'ok'
    }
  });
});
```

---

## 🚨 알림 설정

### **Level 1: Critical (즉시 대응)**
- 서비스 다운 (Uptime < 99%)
- Critical 에러 (결제 실패, 데이터 손실)
- 보안 침해 시도
- DDoS 공격

**알림 채널**: SMS, Slack (24/7)

### **Level 2: High (24시간 내)**
- High Errors (주요 기능 오류)
- 성능 저하 (응답 시간 >1초)
- 비정상 트래픽 증가
- API Rate Limit 초과

**알림 채널**: Email, Slack

### **Level 3: Medium (3일 내)**
- Medium Errors (일부 기능 오류)
- UX 개선 필요
- 사용자 피드백

**알림 채널**: Email (일일 요약)

---

## 📈 일일 운영 루틴

### **Morning Check (09:00)**
- [ ] Uptime 확인 (99.9%+)
- [ ] Cloudflare Analytics 확인 (트래픽, 에러)
- [ ] Sentry 에러 리뷰 (Critical/High)
- [ ] SNS 멘션 확인 (Twitter, Discord)
- [ ] Support 이메일 확인

### **Midday Check (14:00)**
- [ ] GA4 실시간 사용자 확인
- [ ] 거래량 & 매출 확인
- [ ] Performance 모니터링 (Lighthouse)
- [ ] 베타 테스터 피드백 확인

### **Evening Check (18:00)**
- [ ] 일일 KPI 리뷰
- [ ] 에러 로그 분석
- [ ] 사용자 문의 응답
- [ ] 다음날 계획

### **Weekly Review (매주 월요일)**
- [ ] 주간 Analytics 리포트
- [ ] 주요 지표 트렌드 분석
- [ ] 버그 우선순위 재조정
- [ ] 마케팅 캠페인 성과 리뷰
- [ ] 팀 미팅 & 회고

---

## 🛠️ 유지보수 작업

### **Daily**
- [ ] 백업 확인
- [ ] 에러 로그 리뷰
- [ ] Support 티켓 응답

### **Weekly**
- [ ] 성능 최적화
- [ ] 보안 패치 확인
- [ ] 콘텐츠 업데이트
- [ ] 데이터베이스 정리

### **Monthly**
- [ ] 종합 Analytics 리포트
- [ ] 인프라 비용 리뷰
- [ ] 기능 업데이트 배포
- [ ] 사용자 설문조사

### **Quarterly**
- [ ] 대규모 기능 추가
- [ ] 플랫폼 아키텍처 리뷰
- [ ] 보안 감사
- [ ] 로드맵 업데이트

---

## 🚀 배포 프로세스

### **Hotfix (긴급 수정)**
```bash
# 1. 로컬에서 수정
cd /home/user/webapp
# 코드 수정...

# 2. 테스트
npm run build

# 3. Commit & Push
git add .
git commit -m "HOTFIX: Critical bug fix"
git push origin main

# 4. 배포
npx wrangler pages deploy dist --project-name gallerypia

# 5. 확인
curl https://gallerypia.com/health
```

### **Regular Update (정기 업데이트)**
```bash
# 1. Feature branch에서 개발
git checkout -b feature/new-feature
# 개발...

# 2. 테스트
npm run build
npm test

# 3. Main에 merge
git checkout main
git merge feature/new-feature

# 4. 배포
git push origin main
npx wrangler pages deploy dist --project-name gallerypia

# 5. 모니터링 (24시간)
# Sentry, GA4, Cloudflare 확인
```

---

## 📞 Support 운영

### **Support 채널**

#### **1. Discord (1차)**
- **응답 시간**: 1-4시간
- **채널**: #support, #technical-help
- **FAQ Bot**: 자주 묻는 질문 자동 응답

#### **2. Email (2차)**
- **support@gallerypia.com**
- **응답 시간**: 24시간 내
- **자동 응답**: "티켓 번호 #XXXX 발급"

#### **3. Twitter DM (비공식)**
- **응답 시간**: Best effort
- **심각한 문제**: Discord/Email로 유도

### **Support 티켓 우선순위**

| Priority | 응답 시간 | 예시 |
|----------|----------|------|
| **P0 (Critical)** | 1시간 | 결제 실패, 자산 손실, 보안 |
| **P1 (High)** | 4시간 | 로그인 불가, NFT 표시 안됨 |
| **P2 (Medium)** | 24시간 | 기능 오류, 느린 속도 |
| **P3 (Low)** | 3일 | 일반 문의, 기능 요청 |

### **FAQ 작성**
```markdown
## Frequently Asked Questions

### General
Q: GALLERYPIA는 무엇인가요?
A: AI 기반 NFT 아트 플랫폼입니다...

### Wallet
Q: 어떤 지갑을 지원하나요?
A: MetaMask, WalletConnect, Coinbase Wallet, Ledger, Trezor...

### Fees
Q: 수수료가 어떻게 되나요?
A: 판매 수수료 2.5%, 구매자 무료...

### Security
Q: 내 NFT는 안전한가요?
A: 블록체인에 저장되며, 하드웨어 지갑 지원...
```

---

## 🔐 보안 운영

### **Daily Security Check**
- [ ] Cloudflare Firewall 로그
- [ ] 비정상 로그인 시도
- [ ] API Rate Limiting 이벤트
- [ ] SQL Injection 시도 로그

### **Security Best Practices**
1. **정기 패스워드 변경** (90일)
2. **2FA 강제** (관리자 계정)
3. **API Key 로테이션** (180일)
4. **의존성 업데이트** (주간)
5. **보안 감사** (분기별)

### **Incident Response Plan**
1. **탐지**: 알림 수신 또는 수동 발견
2. **평가**: 심각도 판단 (P0-P3)
3. **격리**: 영향 범위 제한
4. **해결**: 근본 원인 수정
5. **복구**: 정상 서비스 재개
6. **사후 분석**: 재발 방지

---

## 📊 성과 리포트

### **Daily Report (자동)**
```
📊 GALLERYPIA Daily Report - 2025-11-26

✅ Uptime: 100%
👥 Visitors: 1,234
📈 Page Views: 5,678
💰 Volume: 12.5 ETH (50 transactions)
🚨 Errors: 2 (Medium)

Top Pages:
1. / (Homepage) - 2,345 views
2. /marketplace - 1,234 views
3. /nft/123 - 567 views

Top Errors:
1. API timeout - 1 occurrence
2. Image load failed - 1 occurrence
```

### **Weekly Report (수동)**
- 주요 지표 트렌드
- 사용자 피드백 요약
- 버그 수정 목록
- 다음주 계획

### **Monthly Report (상세)**
- 종합 Analytics
- 비즈니스 지표 (매출, 성장률)
- 기술 부채 리뷰
- 로드맵 진행 상황

---

## 🎯 운영 KPIs

### **Infrastructure**
| 지표 | 목표 | 현재 |
|------|------|------|
| Uptime | 99.9% | - |
| Page Load | <3초 | 7.65초 → 최적화 필요 |
| API Response | <200ms | - |
| Error Rate | <1% | - |
| Cache Ratio | >80% | - |

### **User Engagement**
| 지표 | 목표 | 현재 |
|------|------|------|
| DAU | 200+ | - |
| Avg. Session | 5min+ | - |
| Bounce Rate | <40% | - |
| Retention (D30) | 40%+ | - |

### **Business**
| 지표 | 목표 | 현재 |
|------|------|------|
| Daily Volume | 2+ ETH | - |
| Transactions | 10+ | - |
| New Users | 20+ | - |
| Revenue | 0.05+ ETH | - |

---

## 📞 Contacts & Resources

### **Critical Contacts**
- **Technical Lead**: [Name] - [Email/Phone]
- **Operations**: [Name] - [Email/Phone]
- **Security**: security@gallerypia.com

### **External Services**
- **Cloudflare Support**: https://dash.cloudflare.com/
- **Sentry**: https://sentry.io/
- **GitHub**: https://github.com/multipia-creator/gallerypia

### **Documentation**
- **Internal Wiki**: [Notion/Confluence]
- **API Docs**: /api/docs
- **User Manual**: /docs/user-manual

---

## ✅ Launch Readiness Checklist

### **Infrastructure**
- [x] Production deployment
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN optimized
- [ ] Monitoring tools setup

### **Operations**
- [ ] Support channels ready
- [ ] FAQ published
- [ ] Incident response plan
- [ ] Backup verified
- [ ] Team trained

### **Marketing**
- [ ] SNS accounts active
- [ ] Launch announcement prepared
- [ ] Press release ready
- [ ] Community onboarded

### **Legal**
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR compliance (if applicable)

---

## 🚀 Go-Live Sequence

### **T-1 Day**
- [ ] Final smoke test
- [ ] Backup verification
- [ ] Team briefing
- [ ] Support ready

### **T-0 (Launch Day)**
- [ ] DNS switch (if custom domain)
- [ ] Monitoring active
- [ ] Announcement posted
- [ ] All hands on deck (4-8 hours)

### **T+1 Day**
- [ ] Post-launch review
- [ ] Issue log review
- [ ] User feedback collection
- [ ] Hotfix if needed

### **T+7 Days**
- [ ] First week report
- [ ] Optimization planning
- [ ] Marketing adjustment

---

**현재 상태**: ✅ Production Ready  
**다음 단계**: Custom Domain 설정 → Beta 테스트 → 정식 론칭

---

*Operations Start Guide created: 2025-11-26*  
*GALLERYPIA - The Ultimate NFT Art Platform*
