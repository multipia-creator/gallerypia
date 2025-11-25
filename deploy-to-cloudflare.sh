#!/bin/bash
echo "🚀 GALLERYPIA Cloudflare Pages 배포 시작"
echo ""
echo "1️⃣ 프로젝트 빌드 중..."
npm run build

echo ""
echo "2️⃣ Cloudflare 로그인 (브라우저가 열립니다)"
npx wrangler login

echo ""
echo "3️⃣ Pages 프로젝트 생성"
npx wrangler pages project create gallerypia --production-branch main

echo ""
echo "4️⃣ D1 데이터베이스 생성"
npx wrangler d1 create gallerypia-production

echo ""
echo "⚠️  위 명령어 결과에서 database_id를 복사하여 wrangler.jsonc에 붙여넣으세요"
echo ""
echo "5️⃣ 마이그레이션 적용"
npx wrangler d1 migrations apply gallerypia-production

echo ""
echo "6️⃣ 프로젝트 배포"
npx wrangler pages deploy dist --project-name gallerypia

echo ""
echo "✅ 배포 완료!"
echo "🌐 배포된 URL이 표시됩니다"
