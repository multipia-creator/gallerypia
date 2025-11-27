# 튜토리얼/웰컴 모달 중복 실행 수정 보고서

## 📋 문제 상황

교수님 피드백: **"메인페이지 팝업 2번 실행됨"**

### 증상
- 메인 페이지 접속 시 튜토리얼/웰컴 모달이 2번 나타남
- 사용자 경험 저하

---

## ❌ 문제 원인

### 2개의 튜토리얼 시스템이 동시에 작동

1. **`public/static/i18n-tutorial.js`** (신규)
   - 첫 방문 튜토리얼
   - i18n 다국어 지원
   - 2초 지연 후 표시
   - localStorage로 표시 여부 관리

2. **`src/index.tsx` 내부 웰컴 모달** (기존)
   - 첫 방문 확인 (`checkFirstVisit()`)
   - 1초 지연 후 표시
   - localStorage로 표시 여부 관리 (`tutorial_completed`)

### 중복 실행 메커니즘

```
사용자가 메인페이지 접속 (/)
    ↓
i18n-tutorial.js 로드
    ↓
2초 후: 튜토리얼 모달 표시 (1번째) ← 문제!
    ↓
index.tsx 내부 스크립트 실행
    ↓
1초 후: 웰컴 모달 표시 (2번째) ← 문제!
    ↓
결과: 사용자가 2개의 팝업을 보게 됨
```

---

## ✅ 해결 방법

### 1️⃣ i18n-tutorial.js 중복 초기화 방지

**파일**: `public/static/i18n-tutorial.js`

**추가된 코드**:
```javascript
// Global flag to prevent multiple initializations
let tutorialInitialized = false;

function initTutorial() {
  // Prevent duplicate initialization
  if (tutorialInitialized) {
    console.log('[P3] Tutorial already initialized, skipping');
    return;
  }
  
  tutorialInitialized = true;
  
  // ... 나머지 코드
}

// Run only once when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTutorial, { once: true });
} else {
  initTutorial();
}
```

**효과**:
- `tutorialInitialized` 플래그로 중복 초기화 방지
- `{ once: true }` 옵션으로 이벤트 리스너 1회만 실행
- 이미 초기화되었으면 즉시 리턴

---

### 2️⃣ index.tsx 웰컴 모달 비활성화

**파일**: `src/index.tsx`

**변경 전**:
```javascript
window.checkFirstVisit = function() {
  const hasVisited = localStorage.getItem('tutorial_completed');
  const currentPath = window.location.pathname;
  
  const isMobile = window.innerWidth <= 768;
  if (!hasVisited && currentPath === '/' && !isMobile) {
    setTimeout(() => {
      showWelcomeModal();  // ← 2번째 팝업 발생!
    }, 1000);
  }
};
```

**변경 후**:
```javascript
window.checkFirstVisit = function() {
  // Disabled to prevent duplicate tutorial modals
  // The i18n-tutorial.js handles first-visit tutorial now
  console.log('[Tutorial] Using i18n-tutorial.js for first-visit experience');
  return;
};
```

**효과**:
- 기존 웰컴 모달 완전히 비활성화
- i18n-tutorial.js만 사용
- 중복 팝업 제거

---

## 🎯 최종 동작 방식

### 새로운 플로우

```
사용자가 메인페이지 접속 (/)
    ↓
localStorage 확인: 'gallerypia_tutorial_shown' === 'true'?
    ↓
NO → 2초 후 튜토리얼 모달 표시 (1번만!)
    ↓
2초 후 자동 닫힘 + localStorage 저장
    ↓
다음 방문 시: 튜토리얼 표시 안함 ✅
```

### 특징
- ✅ **1번만 실행**: 중복 방지 플래그로 보장
- ✅ **자동 닫힘**: 2초 후 자동으로 닫힘
- ✅ **다국어 지원**: i18n 번역 시스템 사용
- ✅ **localStorage 저장**: 다시 보지 않기 기능

---

## 🧪 테스트 방법

### 로컬 환경 테스트

1. **localStorage 삭제**:
```javascript
// 브라우저 Console에서 실행
localStorage.removeItem('gallerypia_tutorial_shown');
```

2. **메인 페이지 새로고침**:
```
http://localhost:3000/
```

3. **확인 사항**:
   - ✅ 튜토리얼 모달 1번만 표시
   - ✅ 2초 후 자동 닫힘
   - ✅ Console에 `[P3] 첫 방문 튜토리얼 시스템 초기화` 1번만 출력

---

### 프로덕션 환경 테스트

1. **시크릿 모드로 접속** (localStorage 없음):
```
https://e7e497bf.gallerypia.pages.dev/
```

2. **확인 사항**:
   - ✅ 튜토리얼 모달 1번만 표시
   - ✅ 중복 팝업 없음

---

## 📊 수정 전후 비교

| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| **팝업 횟수** | 2번 (중복) ❌ | 1번만 ✅ |
| **초기화 횟수** | 2번 (i18n-tutorial + index.tsx) | 1번 (i18n-tutorial만) ✅ |
| **사용자 경험** | 혼란스러움 ❌ | 깔끔함 ✅ |
| **다국어 지원** | 일부만 | 완전 지원 ✅ |
| **자동 닫힘** | 없음 | 2초 후 자동 ✅ |

---

## 🚀 배포 정보

### Cloudflare Pages 배포
- **배포 URL**: https://e7e497bf.gallerypia.pages.dev
- **메인 URL**: https://gallerypia.pages.dev
- **배포 시간**: 2025-11-27
- **업로드 파일**: 1개 신규 (_worker.js)

### Git 커밋
```bash
5e17b97 - Fix: Prevent duplicate tutorial/welcome modal execution

# Changes:
# - public/static/i18n-tutorial.js: 중복 초기화 방지 플래그 추가
# - src/index.tsx: 기존 웰컴 모달 비활성화
```

---

## 🔍 디버깅 정보

### Console 로그 확인

**정상 동작**:
```
[P3] 첫 방문 튜토리얼 시스템 초기화
[Tutorial] Using i18n-tutorial.js for first-visit experience
```

**중복 방지 동작**:
```
[P3] Tutorial already showing, skipping duplicate call
[P3] Tutorial already initialized, skipping
```

---

## 📝 추가 개선 사항

### 향후 고려사항

1. **튜토리얼 재표시 옵션**
   - 설정 페이지에서 튜토리얼 다시 보기 버튼 추가
   - localStorage 초기화 기능

2. **튜토리얼 커스터마이징**
   - 사용자 역할별 튜토리얼 내용 변경
   - 아티스트, 전문가, 일반 사용자별 다른 가이드

3. **스킵 기능 개선**
   - 현재: 2초 후 자동 닫힘
   - 개선안: 사용자가 직접 닫기 버튼 클릭

---

## 🎯 테스트 체크리스트

### ✅ 확인 완료 항목

- [x] localStorage 삭제 후 메인페이지 접속
- [x] 튜토리얼 모달 1번만 표시
- [x] 2초 후 자동 닫힘
- [x] localStorage에 'gallerypia_tutorial_shown' 저장
- [x] 다음 방문 시 튜토리얼 표시 안함
- [x] Console에 중복 로그 없음
- [x] 로컬 환경 테스트 완료
- [x] 프로덕션 배포 완료

---

## 🎉 결론

**문제**: 메인페이지에서 튜토리얼/웰컴 모달이 2번 실행됨

**원인**: 
- i18n-tutorial.js (신규)
- index.tsx 내부 웰컴 모달 (기존)
- 두 시스템이 동시에 작동

**해결**:
1. ✅ i18n-tutorial.js에 중복 초기화 방지 플래그 추가
2. ✅ index.tsx의 웰컴 모달 비활성화
3. ✅ i18n-tutorial.js만 사용하도록 통합

**결과**:
- ✅ 튜토리얼 모달 1번만 표시
- ✅ 사용자 경험 개선
- ✅ 다국어 지원 완전 적용
- ✅ 프로덕션 배포 완료

**배포 URL**: 
- 최신: https://e7e497bf.gallerypia.pages.dev
- 메인: https://gallerypia.pages.dev

---

📅 **작성일**: 2025-11-27  
👤 **작성자**: Claude AI Assistant  
🔧 **상태**: ✅ 완료 (중복 실행 수정)
