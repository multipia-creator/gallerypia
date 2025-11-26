# 🔧 캐시 및 튜토리얼 문제 해결 보고서

## 📋 사용자 보고 문제

### 1️⃣ **메인페이지 팝업이 2번 나옴**
- **원인**: `showFirstVisitTutorial()` 함수가 중복 호출되어도 방어 로직 없음
- **증상**: 동일한 튜토리얼 팝업이 연속으로 2번 표시됨

### 2️⃣ **메뉴 "가치산정" 변경 안 보임**
- **원인**: 브라우저가 이전 버전의 JS 파일을 1년간 캐시
- **증상**: 서버는 "가치산정"으로 변경되었으나, 브라우저는 구버전 "셀프가치산정 시스템" 표시

---

## 🔍 근본 원인 분석

### **문제 1: 튜토리얼 중복 표시**

**기존 코드** (`public/static/i18n-tutorial.js`):
```javascript
function showFirstVisitTutorial() {
  // Check if already shown
  if (localStorage.getItem('gallerypia_tutorial_shown') === 'true') {
    return;
  }
  // ... 팝업 생성 로직
}
```

**문제점**:
- 함수가 빠르게 2번 호출되면 첫 번째 호출이 localStorage 저장 전에 두 번째 호출이 실행됨
- 중복 실행 방어 플래그 없음

---

### **문제 2: 브라우저 캐시**

**기존 설정** (`public/_headers`):
```
/static/*.js
  Cache-Control: public, max-age=31536000, immutable
```

**문제점**:
- `max-age=31536000` = **1년간 캐시**
- `immutable` = 브라우저가 재검증 없이 캐시 사용
- 배포 후에도 사용자 브라우저는 구버전 JS 파일 사용

---

## ✅ 해결 방법

### **1️⃣ 튜토리얼 중복 방지**

**수정된 코드**:
```javascript
let tutorialShowing = false; // 중복 실행 방지 플래그

function showFirstVisitTutorial() {
  // 중복 호출 방지
  if (tutorialShowing) {
    console.log('[P3] Tutorial already showing, skipping duplicate call');
    return;
  }

  // Check if already shown
  if (localStorage.getItem('gallerypia_tutorial_shown') === 'true') {
    return;
  }

  // 플래그 설정
  tutorialShowing = true;
  
  // ... 팝업 생성 로직
}

window.closeTutorial = function(markAsShown) {
  // ... 닫기 로직
  setTimeout(() => {
    modal.remove();
    tutorialShowing = false; // 플래그 리셋
  }, 300);
};
```

**효과**:
- ✅ 첫 번째 호출 시 `tutorialShowing = true` 설정
- ✅ 두 번째 호출 시 즉시 return으로 차단
- ✅ 팝업 닫힌 후 플래그 리셋으로 다음 방문 시 정상 작동

---

### **2️⃣ 캐시 버스팅 (Cache Busting)**

**방법 A: 버전 쿼리 파라미터** (즉시 적용)

**수정 전**:
```html
<script src="/static/i18n-tutorial.js"></script>
```

**수정 후**:
```html
<script src="/static/i18n-tutorial.js?v=1764167410"></script>
```

**효과**:
- ✅ URL이 변경되어 브라우저가 새 파일로 인식
- ✅ 구버전 캐시 무시하고 새 버전 다운로드

---

**방법 B: 캐시 헤더 수정** (장기 해결책)

**수정 전**:
```
/static/*.js
  Cache-Control: public, max-age=31536000, immutable
```

**수정 후**:
```
/static/*.js
  Cache-Control: public, max-age=3600, must-revalidate
```

**변경 내용**:
- `max-age=31536000` (1년) → `max-age=3600` (1시간)
- `immutable` 제거 → `must-revalidate` 추가

**효과**:
- ✅ 1시간 후 브라우저가 자동으로 새 버전 확인
- ✅ 배포 후 최대 1시간 내 모든 사용자가 새 버전 확인
- ✅ 개발 및 업데이트 속도 향상

---

## 🌐 배포 정보

### **Production URL** (고정 URL, 자동 업데이트)
```
https://gallerypia.pages.dev
```
또는
```
https://gallerypia.com
```

### **최신 배포 고유 URL**
```
https://945998ce.gallerypia.pages.dev
```

### **GitHub Repository**
```
https://github.com/multipia-creator/gallerypia
```

---

## 🧪 사용자 테스트 방법

### **⚠️ 중요: 캐시 완전 삭제 필수!**

기존 캐시가 남아있으면 여전히 구버전이 보일 수 있습니다!

### **방법 1: 브라우저 캐시 완전 삭제** (권장 ⭐⭐⭐)

**Chrome / Edge:**
1. `Ctrl + Shift + Delete` 누르기
2. "전체 기간" 선택
3. ✅ "쿠키 및 기타 사이트 데이터" 체크
4. ✅ "캐시된 이미지 및 파일" 체크
5. "데이터 삭제" 클릭

**Firefox:**
1. `Ctrl + Shift + Delete` 누르기
2. "시간 범위": "전체" 선택
3. ✅ "쿠키" 체크
4. ✅ "캐시" 체크
5. "지금 지우기" 클릭

---

### **방법 2: 하드 리프레시** (빠른 테스트)

- **Windows/Linux**: `Ctrl + Shift + R` 또는 `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

---

### **방법 3: 시크릿 모드** (즉시 테스트)

- **Chrome/Edge**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`

시크릿 창에서 URL 접속:
```
https://gallerypia.pages.dev
```

---

### **방법 4: 개발자 도구 캐시 비활성화**

1. `F12` 눌러 개발자 도구 열기
2. **Network** 탭 클릭
3. ✅ **"Disable cache"** 체크
4. 페이지 새로고침 (`F5`)

---

## ✅ 확인 사항

### **1. 튜토리얼 팝업**
- ✅ 모바일에서 첫 방문 시 **1번만** 표시됨
- ✅ 2초 후 자동으로 닫힘
- ✅ localStorage에 저장되어 다시 표시 안 됨

### **2. 메뉴 텍스트 (상단 네비게이션)**
- ✅ 한국어: **"가치산정"**
- ✅ 영어: **"Valuation"**
- ✅ 중국어: **"估值"**
- ✅ 일본어: **"価値評価"**

### **3. 메인페이지 버튼**
- ✅ 큰 버튼 제목: **"가치산정"** (이전: "셀프가치산정 시스템")
- ✅ 작은 버튼: **"가치산정"**

---

## 📊 기술적 개선사항

### **변경된 파일**

| 파일 | 변경 내용 | 목적 |
|------|----------|------|
| `public/static/i18n-tutorial.js` | 중복 방지 플래그 추가 | 튜토리얼 2번 표시 방지 |
| `src/index.tsx` | 버전 쿼리 파라미터 추가 | 캐시 무효화 |
| `public/_headers` | JS/CSS 캐시 시간 단축 | 업데이트 속도 향상 |

### **Git 커밋**

```bash
# Commit 1: Tutorial duplicate fix
cd35752 - FIX: Tutorial popup duplicate & browser cache issues

# Commit 2: Cache header optimization
cdf6114 - FIX: Reduce JS/CSS cache time for easier updates
```

---

## 🚀 다음 배포부터 적용

### **자동으로 개선되는 사항**

1. **1시간 후 자동 업데이트**
   - JS/CSS 파일이 1시간마다 재검증됨
   - 사용자가 수동으로 캐시 삭제할 필요 없음

2. **튜토리얼 중복 방지**
   - 중복 호출 완전 차단
   - 안정적인 첫 방문 경험

3. **버전 관리**
   - 스크립트에 타임스탬프 버전 추가
   - 배포 시마다 새 버전으로 인식

---

## 📌 요약

| 문제 | 원인 | 해결 | 상태 |
|------|------|------|------|
| 튜토리얼 2번 표시 | 중복 실행 방어 없음 | `tutorialShowing` 플래그 추가 | ✅ 해결 |
| 메뉴 텍스트 안 바뀜 | 1년 브라우저 캐시 | 1) 버전 쿼리 파라미터<br>2) 캐시 시간 1시간으로 단축 | ✅ 해결 |
| 버튼 텍스트 안 바뀜 | 동일 (캐시 문제) | 동일 해결책 | ✅ 해결 |

---

## 🎯 사용자 액션

### **즉시 확인하려면:**

1. **브라우저 캐시 완전 삭제** (`Ctrl + Shift + Delete`)
2. **고정 URL 접속**: `https://gallerypia.pages.dev`
3. **확인**: 메뉴가 **"가치산정"**으로 표시됨

### **1시간 후 자동 확인:**

- 아무 작업 없이 1시간 후 페이지 새로고침
- 브라우저가 자동으로 새 버전 가져옴

---

**최종 배포 완료**: 2025-01-26
**커밋 해시**: `cdf6114`
**배포 URL**: https://945998ce.gallerypia.pages.dev (Production: https://gallerypia.pages.dev)
