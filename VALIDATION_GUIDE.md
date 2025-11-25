# Input Validation Guide (Zod)

## 📋 개요

이 프로젝트는 **Zod**를 사용한 강력한 입력 검증 시스템을 갖추고 있습니다. 모든 API 엔드포인트는 Zod 스키마를 통해 입력을 검증하여 SQL 인젝션, XSS 공격, 잘못된 데이터 입력을 방지합니다.

## 🎯 주요 기능

- ✅ **타입 안전 검증**: TypeScript와 완벽한 통합
- 🛡️ **SQL 인젝션 방지**: 모든 입력 검증으로 SQL 인젝션 차단
- 📝 **명확한 에러 메시지**: 한글로 된 사용자 친화적 에러 메시지
- 🔄 **재사용 가능한 스키마**: 공통 스키마를 여러 엔드포인트에서 재사용
- ⚡ **성능 최적화**: Zod의 빠른 검증 엔진

## 📁 파일 구조

```
src/
├── schemas/
│   └── validation.ts      # 모든 Zod 스키마 정의
├── middleware/
│   └── validator.ts       # 검증 미들웨어 헬퍼 함수
└── index.tsx              # 엔드포인트에서 검증 사용
```

## 🔧 사용법

### 1. 기본 사용 예제

```typescript
import { validateBody, validateQuery } from './middleware/validator'
import { signupSchema, loginSchema } from './schemas/validation'

// POST 요청 body 검증
app.post('/api/auth/signup', 
  validateBody(signupSchema),
  async (c) => {
    // 검증된 데이터 사용
    const data = c.req.valid('json')
    // ... 로직 처리
  }
)

// GET 요청 query 파라미터 검증
app.get('/api/artworks',
  validateQuery(getArtworksQuerySchema),
  async (c) => {
    const query = c.req.valid('query')
    const { page, limit, search } = query
    // ... 로직 처리
  }
)
```

### 2. 사용 가능한 스키마

#### 인증 (Authentication)
- `signupSchema` - 회원가입
- `loginSchema` - 로그인
- `forgotPasswordSchema` - 비밀번호 찾기
- `resetPasswordSchema` - 비밀번호 재설정
- `metamaskLoginSchema` - MetaMask 로그인

#### 작품 (Artwork)
- `createArtworkSchema` - 작품 생성
- `updateArtworkSchema` - 작품 수정
- `getArtworksQuerySchema` - 작품 목록 조회

#### 아티스트 (Artist)
- `createArtistSchema` - 아티스트 생성
- `updateArtistSchema` - 아티스트 수정

#### 전시 (Exhibition)
- `createExhibitionSchema` - 전시 생성
- `updateExhibitionSchema` - 전시 수정

#### 평가 (Evaluation)
- `createEvaluationSchema` - 작품 평가 생성

#### 댓글 (Comment)
- `createCommentSchema` - 댓글 생성
- `updateCommentSchema` - 댓글 수정

### 3. 공통 스키마

재사용 가능한 공통 스키마:

```typescript
// 이메일 검증
emailSchema: z.string()
  .email('유효한 이메일 주소를 입력해주세요')
  .min(5).max(255)

// 비밀번호 검증 (대소문자, 숫자 필수)
passwordSchema: z.string()
  .min(8)
  .regex(/[A-Z]/, '대문자 필수')
  .regex(/[a-z]/, '소문자 필수')
  .regex(/[0-9]/, '숫자 필수')

// ID 검증 (양의 정수)
idSchema: z.coerce.number()
  .int().positive()

// 페이지네이션
pageSchema: z.coerce.number().int().positive().default(1)
limitSchema: z.coerce.number().int().positive().max(100).default(20)
```

## 🚫 검증 실패 시 응답

검증 실패 시 자동으로 400 Bad Request 응답:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "유효한 이메일 주소를 입력해주세요"
    },
    {
      "field": "password",
      "message": "비밀번호는 최소 8자 이상이어야 합니다"
    }
  ]
}
```

## 🔐 보안 이점

1. **SQL 인젝션 방지**: 모든 입력이 검증되어 악의적인 SQL 쿼리 차단
2. **XSS 공격 방지**: 문자열 길이 제한과 형식 검증으로 스크립트 삽입 차단
3. **타입 검증**: 숫자, 이메일, URL 등 타입별 엄격한 검증
4. **길이 제한**: 모든 필드에 최대 길이 설정으로 버퍼 오버플로우 방지

## 📝 새로운 스키마 추가하기

`src/schemas/validation.ts`에 새로운 스키마 추가:

```typescript
export const myNewSchema = z.object({
  field1: z.string().min(1).max(255),
  field2: z.number().int().positive(),
  field3: z.enum(['option1', 'option2', 'option3'])
})
```

그리고 엔드포인트에서 사용:

```typescript
app.post('/api/my-endpoint',
  validateBody(myNewSchema),
  async (c) => {
    const data = c.req.valid('json')
    // ...
  }
)
```

## 🧪 테스트

validation이 작동하는지 테스트:

```bash
# 유효하지 않은 이메일로 테스트
curl -X POST http://localhost:3000/api/test-validation \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"short"}'

# 응답:
# {
#   "success": false,
#   "error": "Validation failed",
#   "details": [...]
# }
```

## 📚 참고 자료

- [Zod 공식 문서](https://zod.dev/)
- [Hono Zod Validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator)
- [TypeScript 타입 안전성](https://www.typescriptlang.org/)

## ✅ 체크리스트

새로운 API 엔드포인트 추가 시:

- [ ] `src/schemas/validation.ts`에 스키마 정의
- [ ] `validateBody()`, `validateQuery()`, 또는 `validateParam()` 미들웨어 추가
- [ ] 엔드포인트에서 `c.req.valid()로` 검증된 데이터 사용
- [ ] 에러 응답 테스트
- [ ] 정상 요청 테스트
