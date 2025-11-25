# CI/CD Pipeline Guide

## 📋 개요

이 프로젝트는 **GitHub Actions**를 사용한 완전 자동화된 CI/CD 파이프라인을 갖추고 있습니다. 코드를 푸시하면 자동으로 테스트, 빌드, 배포가 실행됩니다.

## 🚀 파이프라인 구조

### Workflow 트리거
- **Push to main/develop**: 전체 파이프라인 실행 + 프로덕션 배포
- **Pull Request to main**: 테스트 + 빌드 + 프리뷰 배포

### Jobs

#### 1. Test (테스트)
```yaml
- Checkout code
- Setup Node.js 20
- Install dependencies (npm ci)
- Run tests (npm test)
- Generate coverage (npm run test:coverage)
- Upload to Codecov
```

**실행 시간**: ~2-3분  
**실패 시**: 파이프라인 중단, 배포 불가

#### 2. Build (빌드)
```yaml
- Checkout code
- Setup Node.js 20
- Install dependencies
- Build project (npm run build)
- Check artifacts (dist/ 크기 확인)
- Upload artifacts (7일 보관)
```

**실행 시간**: ~1-2분  
**의존성**: Test job 성공 필요

#### 3. Lint (코드 품질)
```yaml
- Checkout code
- Setup Node.js 20
- Install dependencies
- TypeScript check (npx tsc --noEmit)
```

**실행 시간**: ~1분  
**경고 허용**: TypeScript 경고는 실패로 처리하지 않음

#### 4. Deploy Preview (프리뷰 배포)
```yaml
- PR 생성 시에만 실행
- Cloudflare Pages에 프리뷰 배포
- URL: https://preview-{PR번호}.gallerypia.pages.dev
```

**실행 시간**: ~1-2분  
**조건**: Pull Request일 때만

#### 5. Deploy Production (프로덕션 배포)
```yaml
- main 브랜치에 push 시에만 실행
- Cloudflare Pages 프로덕션 배포
- URL: https://gallerypia.pages.dev
```

**실행 시간**: ~1-2분  
**조건**: main 브랜치 + Test/Build/Lint 성공

## 🔐 필수 Secrets 설정

GitHub Repository Settings → Secrets and variables → Actions에서 설정:

### 1. CLOUDFLARE_API_TOKEN
```
Your Cloudflare API Token
위치: Cloudflare Dashboard → My Profile → API Tokens
권한: Cloudflare Pages (Edit)
```

### 2. CLOUDFLARE_ACCOUNT_ID
```
Your Cloudflare Account ID
위치: Cloudflare Dashboard → Overview → Account ID (오른쪽)
```

### 3. CODECOV_TOKEN (선택사항)
```
Codecov 커버리지 업로드용
위치: https://codecov.io/ → Repository Settings
```

## 📊 Workflow 예시

### Scenario 1: Feature 개발
```bash
# 1. Feature 브랜치 생성
git checkout -b feature/new-feature

# 2. 코드 작성 및 커밋
git add .
git commit -m "Add new feature"

# 3. Pull Request 생성
git push origin feature/new-feature
# GitHub에서 PR 생성 → CI 자동 실행

# 4. CI 통과 확인
# - ✅ Test
# - ✅ Build
# - ✅ Lint
# - 🌐 Preview: https://preview-123.gallerypia.pages.dev

# 5. 리뷰 후 Merge
# → main 브랜치에 자동 배포
```

### Scenario 2: Hotfix
```bash
# 1. main에서 직접 수정
git checkout main
git pull

# 2. Hotfix 적용
# ... 수정 ...

# 3. 커밋 및 푸시
git add .
git commit -m "Hotfix: Fix critical bug"
git push origin main

# 4. 자동 배포
# → 테스트 통과 → 빌드 → 프로덕션 배포
# → 약 5분 후 https://gallerypia.pages.dev에 반영
```

## 🔍 CI/CD 모니터링

### GitHub Actions 탭에서 확인
1. Repository → Actions
2. 최근 workflow 실행 확인
3. 각 job 로그 확인 가능

### Status Badge (README에 추가 가능)
```markdown
![CI/CD](https://github.com/username/gallerypia/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Cloudflare Pages 대시보드
- https://dash.cloudflare.com/pages
- 배포 히스토리, 로그, 분석 확인

## 🐛 문제 해결

### 테스트 실패
```bash
# 로컬에서 테스트 확인
npm test

# 실패한 테스트 디버깅
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

### 빌드 실패
```bash
# 로컬 빌드 확인
npm run build

# TypeScript 에러 확인
npx tsc --noEmit

# 의존성 문제 확인
rm -rf node_modules package-lock.json
npm install
```

### 배포 실패
- Cloudflare API Token 확인
- Account ID 확인
- Cloudflare Pages 프로젝트 이름 확인 (gallerypia)
- Wrangler 버전 호환성 확인

## 📈 성능 최적화

### Cache 활용
- Node.js modules 캐싱 (setup-node@v4 자동)
- Build artifacts 캐싱 (7일)

### 병렬 실행
- Test, Build, Lint는 독립적으로 실행 가능
- 실패 시 빠른 피드백

### 조건부 실행
- PR: Preview 배포만
- main push: Production 배포만
- 불필요한 job 스킵

## ✅ Best Practices

1. **Commit 메시지**: 명확한 메시지 작성
2. **PR 크기**: 작은 단위로 분할
3. **테스트 작성**: 새 기능마다 테스트 추가
4. **Lint 통과**: 커밋 전 로컬에서 확인
5. **주기적 의존성 업데이트**: 보안 패치 적용

## 🔄 로컬 개발 → 프로덕션 흐름

```
로컬 개발
  ↓ git push
GitHub (자동)
  ↓ GitHub Actions
테스트 실행 (Vitest)
  ↓ 통과
빌드 (Vite)
  ↓ 성공
코드 품질 확인 (TypeScript)
  ↓ 통과
프로덕션 배포 (Cloudflare)
  ↓ 완료
https://gallerypia.pages.dev ✨
```

## 📚 추가 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Codecov 문서](https://docs.codecov.com/)
