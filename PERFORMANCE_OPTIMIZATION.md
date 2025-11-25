# Performance Optimization Guide

## 📊 최적화 결과

### 번들 크기
- **Before**: 1,412.78 kB (1.38MB)
- **After**: 876.31 kB (0.86MB)
- **Reduction**: 536.47 kB (38% 감소) ✅ **목표 초과 달성!**

### 해결된 문제점
1. ✅ Sentry SDK 제거 → 경량 에러 로깅으로 대체 (73개 패키지 제거)
2. ✅ esbuild minification 적용 (drop console/debugger)
3. ✅ Tree shaking 및 legal comments 제거

## 🎯 최적화 전략

### 1. 번들 분석
```bash
npm install -D rollup-plugin-visualizer
```

### 2. Code Splitting
- Dynamic imports 활용
- Route-based splitting
- Component lazy loading

### 3. Tree Shaking
- ES modules 사용
- Unused exports 제거
- Side effects 표시

### 4. Minification & Compression
- Terser minification (기본 활성화)
- Brotli/Gzip 압축
- CSS minification

### 5. External Dependencies
- CDN 활용 (이미 사용 중)
- Peer dependencies 최적화

## 🚀 구현 사항

### Vite Build 최적화 (실제 적용)

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [build(), devServer({ adapter, entry: 'src/index.tsx' })],
  build: {
    minify: 'esbuild',      // esbuild로 빠른 minification
    target: 'es2020',       // 현대 브라우저 타겟
    chunkSizeWarningLimit: 1000,
    sourcemap: false        // 프로덕션에서 sourcemap 비활성화
  },
  esbuild: {
    drop: ['console', 'debugger'],  // console/debugger 제거
    treeShaking: true,              // Tree shaking 활성화
    legalComments: 'none',          // 라이센스 주석 제거
    target: 'es2020',
    minifyIdentifiers: true,        // 변수명 압축
    minifySyntax: true,             // 문법 압축
    minifyWhitespace: true          // 공백 제거
  },
  optimizeDeps: {
    include: ['hono', 'zod'],
    exclude: ['@sentry/node', '@sentry/browser']  // 제거됨
  }
})
```

### Sentry 제거 및 경량 에러 로깅
- ❌ 제거: `@sentry/node`, `@sentry/browser` (73개 패키지)
- ✅ 대체: 구조화된 에러 로깅 (src/middleware/sentry.ts)
- ✅ Frontend: ErrorLogger 클래스로 백엔드 전송

### HTTP 캐싱 전략

**Cloudflare Pages 자동 처리:**
- Static assets: 1년 캐싱
- HTML: No cache (항상 최신)
- API: Cache-Control 헤더로 제어

**Cache-Control 헤더 추가:**
```typescript
// Static assets
app.get('/static/*', (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  return next()
})

// API responses
app.get('/api/*', (c, next) => {
  c.header('Cache-Control', 'no-cache, must-revalidate')
  return next()
})
```

### Frontend 최적화

**이미 구현된 기능:**
- ✅ Lazy loading images
- ✅ CDN for libraries (Tailwind, Chart.js, etc.)
- ✅ Minified CSS/JS

**추가 최적화:**
```javascript
// Service Worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## 📈 성능 모니터링

### Core Web Vitals (이미 구현)
- CLS (Cumulative Layout Shift)
- LCP (Largest Contentful Paint)
- FID (First Input Delay)

### Lighthouse 점수 목표
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

## 🔧 최적화 체크리스트

### Build 최적화
- [x] esbuild minification 활성화 (terser보다 빠름)
- [x] Tree shaking 활성화
- [x] Sentry SDK 제거 (73 packages, ~500KB 절감)
- [x] Console.log/debugger 제거 (프로덕션)
- [x] Legal comments 제거
- [x] Sourcemaps 비활성화 (프로덕션)

### Network 최적화
- [x] Gzip/Brotli 압축 (Cloudflare 자동)
- [x] HTTP/2 (Cloudflare Pages 자동)
- [x] CDN 활용 (Tailwind, libraries)
- [ ] Service Worker 캐싱
- [x] Cache-Control 헤더

### Runtime 최적화
- [x] Lazy loading (Phase 6)
- [x] Image optimization (Phase 6)
- [x] Performance monitoring (Phase 8)
- [ ] Web Workers (필요시)
- [ ] Virtual scrolling (대량 데이터)

### Database 최적화
- [ ] Query optimization (인덱스)
- [ ] Connection pooling
- [ ] Prepared statements
- [x] Rate limiting (Phase 8)

## 📊 성능 측정

### 빌드 시간
```bash
time npm run build
```

### 번들 크기
```bash
du -sh dist/
ls -lh dist/_worker.js
```

### Lighthouse 테스트
```bash
# Chrome DevTools 사용
# 또는
npm install -g lighthouse
lighthouse https://gallerypia.pages.dev --view
```

### Load Testing
```bash
# Apache Bench
ab -n 1000 -c 10 https://gallerypia.pages.dev/

# 또는 k6
k6 run load-test.js
```

## 🎯 성능 목표 (달성 현황)

### 번들 크기
- Before: 1,412.78 kB (1.38MB)
- After: 876.31 kB (0.86MB)
- **달성**: 38% 감소 ✅ (목표 30% 초과 달성)

### Load Time
- 현재: 측정 필요
- 목표: <3초 (First Contentful Paint)
- 목표: <5초 (Time to Interactive)

### API Response Time
- 목표: <200ms (평균)
- 목표: <500ms (P95)
- 목표: <1000ms (P99)

## 🔄 지속적 최적화

### 월간 체크
- [ ] Bundle 크기 모니터링
- [ ] Lighthouse 점수 확인
- [ ] Core Web Vitals 분석
- [ ] 느린 API 확인 (Sentry)

### 분기별 리뷰
- [ ] Dependencies 업데이트
- [ ] 미사용 코드 제거
- [ ] 최적화 기회 분석
- [ ] 성능 벤치마크

## 📚 참고 자료

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Cloudflare Pages Performance](https://developers.cloudflare.com/pages/platform/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
