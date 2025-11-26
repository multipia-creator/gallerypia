/**
 * i18n (Internationalization) System
 * Multi-language support for GalleryPia
 * L3-6: 다국어 지원
 * 
 * Supported Languages:
 * - ko: Korean (한국어)
 * - en: English
 * - zh: Chinese (简体中文)
 * - ja: Japanese (日本語)
 */

class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = {};
    this.fallbackLanguage = 'ko';
    
    this.init();
  }

  init() {
    // Load translations
    this.loadTranslations();
    
    // Apply initial language
    this.applyLanguage(this.currentLanguage);
    
    console.log(`🌍 i18n initialized with language: ${this.currentLanguage}`);
  }

  // ===== Language Detection =====
  
  detectLanguage() {
    // 1. Check localStorage
    const saved = localStorage.getItem('gallerypia_language');
    if (saved && this.isLanguageSupported(saved)) {
      return saved;
    }
    
    // 2. Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'en-US' → 'en'
    
    if (this.isLanguageSupported(langCode)) {
      return langCode;
    }
    
    // 3. Default to Korean
    return 'ko';
  }

  isLanguageSupported(lang) {
    return ['ko', 'en', 'zh', 'ja'].includes(lang);
  }

  // ===== Translation Loading =====
  
  loadTranslations() {
    this.translations = {
      // Korean (한국어)
      ko: {
        // Navigation
        'nav.home': '홈',
        'nav.gallery': '갤러리',
        'nav.auctions': '경매',
        'nav.artists': '아티스트',
        'nav.leaderboard': '랭킹',
        'nav.recommendations': '추천',
        'nav.analytics': '분석',
        'nav.admin': '관리자',
        'nav.profile': '내 프로필',
        'nav.dashboard': '대시보드',
        'nav.settings': '설정',
        'nav.logout': '로그아웃',
        'nav.login': '로그인',
        'nav.signup': '회원가입',
        
        // Common
        'common.search': '검색',
        'common.loading': '로딩 중...',
        'common.error': '오류',
        'common.success': '성공',
        'common.cancel': '취소',
        'common.confirm': '확인',
        'common.save': '저장',
        'common.delete': '삭제',
        'common.edit': '수정',
        'common.view': '보기',
        'common.more': '더보기',
        'common.less': '줄이기',
        'common.all': '전체',
        'common.back': '뒤로',
        'common.next': '다음',
        'common.previous': '이전',
        
        // Gallery
        'gallery.title': '갤러리',
        'gallery.featured': '추천 작품',
        'gallery.new': '신작',
        'gallery.trending': '트렌딩',
        'gallery.price': '가격',
        'gallery.artist': '작가',
        'gallery.category': '카테고리',
        'gallery.view_details': '상세보기',
        'gallery.like': '좋아요',
        'gallery.share': '공유',
        'gallery.3d_viewer': '3D 보기',
        'gallery.ar_viewer': 'AR 보기',
        'gallery.vr_gallery': 'VR 갤러리',
        
        // Auctions
        'auction.title': '경매',
        'auction.live': '진행 중',
        'auction.upcoming': '예정',
        'auction.ended': '종료',
        'auction.bid': '입찰',
        'auction.current_bid': '현재가',
        'auction.starting_bid': '시작가',
        'auction.time_left': '남은 시간',
        'auction.highest_bidder': '최고 입찰자',
        
        // Artists
        'artist.title': '아티스트',
        'artist.rank': '순위',
        'artist.artworks': '작품 수',
        'artist.followers': '팔로워',
        'artist.view_profile': '프로필 보기',
        'artist.follow': '팔로우',
        
        // Recommendations
        'rec.title': '맞춤 추천',
        'rec.for_you': '당신을 위한',
        'rec.artworks': '추천 작품',
        'rec.similar': '유사한 작품',
        'rec.trending': '인기 급상승',
        'rec.new': '신규 작품',
        'rec.algorithm': '추천 알고리즘',
        'rec.confidence': '신뢰도',
        'rec.subtitle': 'AI 기반 추천 알고리즘으로 취향에 맞는 작품을 발견하세요',
        'rec.personalized': '맞춤 추천',
        'rec.analyzing': '추천 작품을 분석하는 중...',
        'rec.hybrid': '하이브리드 추천',
        'rec.description': '당신의 취향과 행동 패턴을 분석하여 최적의 작품을 추천합니다',
        'rec.count': '추천 작품',
        'rec.empty_title': '아직 추천할 작품이 없습니다',
        'rec.empty_subtitle': '작품을 둘러보고 좋아요를 눌러 취향을 알려주세요!',
        'rec.browse_gallery': '갤러리 둘러보기',
        
        // Footer
        'footer.about': '소개',
        'footer.terms': '이용약관',
        'footer.privacy': '개인정보처리방침',
        'footer.contact': '문의',
        'footer.copyright': '© 2024 GalleryPia. All rights reserved.',
        
        // Main Page - Hero Section
        'hero.title1': 'Discover',
        'hero.title2': 'Premium NFTs',
        'hero.subtitle': '객관적인 가치산정 시스템으로 검증된',
        'hero.subtitle2': '프리미엄 NFT 아트 컬렉션',
        
        // Main Page - Buttons
        'main.explore': 'NFT 컬렉션 탐색',
        'main.valuation': '셀프가치산정 시스템',
        'main.system_guide': '시스템 안내',
        'main.expert_apply': '전문가 신청/평가',
        'main.partnership': 'Partnership',
        'main.partnership_sub': '미술관·갤러리·딜러',
        'main.signup': '회원가입',
        'main.install': '앱 설치',
        'main.mint': 'NFT 민팅',
        'main.wallet': '지갑 연결',
        
        // Main Page - Stats
        'main.artworks': 'NFT 작품',
        'main.artists': '아티스트',
        'main.minted': '민팅 완료',
        'main.total_value': '총 가치',
        
        // Main Page - Features Section
        'features.badge': '🚀 월드클래스 혁신 기술',
        'features.title1': 'NFT 플랫폼의',
        'features.title2': '새로운 기준',
        'features.subtitle1': 'AI 기반 진위 검증, 완전 자동화된 로열티, 글로벌 파트너십으로',
        'features.subtitle2': '세계 최고 수준의 NFT 거래 환경을 제공합니다',
        
        // Feature 1: AI Authentication
        'feature1.title': 'AI 진위 검증',
        'feature1.desc': '딥러닝 기반 이미지 분석과 블록체인 추적으로 작품의 진위성을 자동으로 검증합니다',
        'feature1.item1': '실시간 위조품 탐지',
        'feature1.item2': '블록체인 기록 자동 추적',
        'feature1.item3': '전문가 2차 검증 시스템',
        'feature1.link': '자세히 보기',
        
        // Feature 2: Auto Royalty
        'feature2.title': '자동 로열티 시스템',
        'feature2.desc': '스마트 컨트랙트로 2차 거래 시 아티스트에게 자동으로 수익이 분배됩니다',
        'feature2.item1': '영구적 저작권 수익 보장',
        'feature2.item2': '즉시 정산 시스템',
        'feature2.item3': '투명한 거래 내역',
        
        // Feature 3: Global Partnership
        'feature3.title': '글로벌 파트너십',
        'feature3.desc': '세계 유수의 미술관, 갤러리와의 협력으로 검증된 작품만을 제공합니다',
        'feature3.item1': '검증된 미술관 작품',
        'feature3.item2': '큐레이터 추천 시스템',
        'feature3.item3': '글로벌 마켓플레이스',
        
        // Common Terms (for auto-translation)
        'common.recommended': '추천',
        'common.popular': '인기',
        'common.new': '신규',
        'common.recent': '최신',
        'common.viewAll': '전체 보기',
        'common.artworks': '작품',
        'common.price': '산정가',
        'common.painting': '회화',
        'common.digital': '디지털아트',
        'common.photo': '사진',
        'common.sculpture': '조각',
        'common.abstract': '추상화',
        'common.3dart': '3D 아트',
        'common.excellentCollection': '전문가 평가가 우수한 엄선된 컬렉션',
        'common.mostInterest': '가장 많은 관심을 받고 있는 작품',
        'common.latestArtworks': '최근 등록된 신작',
        'common.noArtworks': '등록된 작품이 없습니다.',
        'common.noRecommended': '평점 4.0 이상의 추천 작품이 없습니다.',
        'common.noPopular': '인기 작품이 없습니다.',
        'common.expertEval': '전문가 평가를 받은 우수한 작품이 곧 추가됩니다.',
        'common.close': '닫기',
        'common.submit': '제출',
        'common.reset': '초기화',
        'common.filter': '필터',
        'common.sort': '정렬',
        'common.apply': '적용',
        'common.clear': '지우기',
        
        // Navigation Common
        'nav.skip_to_content': '메인 콘텐츠로 바로가기',
        'nav.language_selection': '언어 선택',
        'nav.notifications': '알림',
        'nav.loading_notifications': '알림을 불러오는 중...',
        'nav.no_notifications': '새로운 알림이 없습니다',
        'nav.user': '사용자',
        'nav.tutorial_replay': '튜토리얼 다시보기',
        'nav.wallet_connect': '지갑연결',
        'nav.curation': '큐레이션',
        'nav.academy': '아카데미',
        'nav.about': '소개',
        
        // Gallery Page
        'gallery.title': '갤러리',
        'gallery.all': '전체',
        'gallery.painting': '회화',
        'gallery.sculpture': '조각',
        'gallery.photo': '사진',
        'gallery.digital': '디지털아트',
        'gallery.mixed': '혼합매체',
        'gallery.installation': '설치미술',
        'gallery.craft': '공예',
        'gallery.design': '디자인',
        'gallery.print': '판화',
        'gallery.media': '미디어아트',
        'gallery.sort_latest': '최신순',
        'gallery.sort_popular': '인기순',
        'gallery.sort_price_high': '높은 가격순',
        'gallery.sort_price_low': '낮은 가격순',
        'gallery.filter_verified': '검증된 작품만',
        'gallery.filter_price_range': '가격 범위',
        'gallery.search_placeholder': '작품명, 작가명 검색...',
        'gallery.no_results': '검색 결과가 없습니다',
        'gallery.loading': '작품을 불러오는 중...',
        
        // Artwork Card
        'artwork.views': '조회',
        'artwork.likes': '좋아요',
        'artwork.estimated_price': '산정가',
        'artwork.view_details': '상세 보기',
        'artwork.add_to_favorites': '즐겨찾기 추가',
        'artwork.share': '공유',
        'artwork.report': '신고',
        
        // Valuation Page
        'valuation.title': '가치산정',
        'valuation.description': '학술 논문 기반 과학적 NFT 미술품 가치산정 플랫폼',
        'valuation.system_title': '5개 모듈 기반의 과학적 가치산정 방법론',
        'valuation.upload_artwork': 'NFT 작품 업로드',
        'valuation.start': '가치산정 시작',
        'valuation.history': '평가 이력',
        
        // Search Page
        'search.title': '검색',
        'search.voice_search': '음성 검색',
        'search.ai_search': 'AI 검색',
        'search.advanced': '고급 검색',
        'search.recent_searches': '최근 검색',
        'search.popular_searches': '인기 검색어',
        
        // Artist Page
        'artists.title': '아티스트',
        'artists.all': '전체 아티스트',
        'artists.featured': '추천 아티스트',
        'artists.new': '신규 아티스트',
        'artists.follow': '팔로우',
        'artists.following': '팔로잉',
        'artists.artworks': '작품',
        'artists.followers': '팔로워',
        
        // Collections
        'collections.title': '컬렉션',
        'collections.view': '컬렉션 보기',
        'collections.create': '컬렉션 만들기',
        'collections.my': '내 컬렉션',
        
        // Mint Page
        'mint.title': 'NFT 민팅',
        'mint.upload': '작품 업로드',
        'mint.title_label': '작품명',
        'mint.description_label': '작품 설명',
        'mint.price_label': '가격',
        'mint.category_label': '카테고리',
        'mint.start_minting': '민팅 시작',
        
        // My Page
        'mypage.title': '마이페이지',
        'mypage.dashboard': '대시보드',
        'mypage.profile': '프로필',
        'mypage.settings': '설정',
        'mypage.my_artworks': '내 작품',
        'mypage.favorites': '즐겨찾기',
        'mypage.transactions': '거래 내역',
        
        // Leaderboard
        'leaderboard.title': '리더보드',
        'leaderboard.artists': '아티스트 랭킹',
        'leaderboard.artworks': '작품 랭킹',
        'leaderboard.collectors': '컬렉터 랭킹',
        
        // Academy
        'academy.title': 'NFT 아카데미',
        'academy.courses': '강좌',
        'academy.tutorials': '튜토리얼',
        'academy.guides': '가이드',
        
        // Support
        'support.title': '지원',
        'support.faq': '자주 묻는 질문',
        'support.contact': '문의하기',
        'support.help': '도움말',
        
        // Auth
        'auth.login': '로그인',
        'auth.signup': '회원가입',
        'auth.logout': '로그아웃',
        'auth.forgot_password': '비밀번호 찾기',
        'auth.reset_password': '비밀번호 재설정',
        'auth.welcome': '갤러리피아에 오신 것을 환영합니다',
        'auth.social_login': '소셜 계정으로 간편 로그인',
        'auth.social_signup': '소셜 계정으로 간편 가입',
        'auth.or_login_with': '또는 이메일로 로그인',
        'auth.or_signup_with': '또는 이메일로 가입',
        'auth.email': '이메일',
        'auth.password': '비밀번호',
        'auth.remember_me': '로그인 상태 유지',
        'auth.login_button': '로그인',
        'auth.signup_button': '회원가입',
        'auth.no_account': '계정이 없으신가요?',
        'auth.have_account': '이미 계정이 있으신가요?',
        'auth.signup_now': '지금 가입하기',
        'auth.login_now': '로그인하기',
        'auth.password_placeholder': '비밀번호를 입력하세요',
        'auth.basic_info': '기본 정보',
        'auth.username': '사용자명',
        'auth.full_name': '이름',
        'auth.phone': '전화번호',
        'auth.confirm_password': '비밀번호 확인',
        'auth.confirm_password_placeholder': '비밀번호를 다시 입력하세요',
        'auth.account_type': '계정 유형 선택',
        'auth.role_buyer': '구매자',
        'auth.role_buyer_desc': 'NFT 작품을 구매하고 소장합니다',
        'auth.role_seller': '판매자',
        'auth.role_seller_desc': 'NFT 작품을 판매하고 거래합니다',
        'auth.role_artist': '미술작가',
        'auth.role_artist_desc': '작품을 등록하고 NFT로 민팅합니다',
        'auth.role_expert': '전문가',
        'auth.role_expert_desc': '작품을 평가하고 ETH 보상을 받습니다',
        'auth.role_expert_reward': '평가당 0.01-0.1 ETH 보상',
        'auth.role_museum': '뮤지엄',
        'auth.role_museum_desc': '전시를 기획하고 작품을 큐레이션합니다',
        'auth.role_gallery': '갤러리',
        'auth.role_gallery_desc': '작품을 전시하고 거래를 중개합니다',
        'auth.forgot_title': '비밀번호 찾기',
        'auth.forgot_desc': '가입하신 이메일 주소를 입력해주세요',
        'auth.forgot_info': '입력하신 이메일로 비밀번호 재설정 링크가 전송됩니다.',
        'auth.send_reset_link': '재설정 링크 보내기',
        'auth.back_to_login': '로그인으로 돌아가기',
        'auth.reset_title': '비밀번호 재설정',
        'auth.reset_desc': '새로운 비밀번호를 입력해주세요',
        'auth.new_password': '새 비밀번호',
        'auth.password_min': '최소 8자 이상',
        'auth.change_password': '비밀번호 변경',
        
        // Recommendations
        'recommendations.title': '당신을 위한 추천 작품',
        'recommendations.subtitle': 'AI 기반 추천 알고리즘으로 취향에 맞는 작품을 발견하세요',
        'recommendations.tab_personalized': '맞춤 추천',
        'recommendations.tab_trending': '인기 급상승',
        'recommendations.tab_new': '신규 작품',
        'recommendations.loading': '추천 작품을 분석하는 중...',
        'recommendations.algorithm_name': '하이브리드 추천',
        'recommendations.algorithm_desc': '당신의 취향과 행동 패턴을 분석하여 최적의 작품을 추천합니다',
        'recommendations.count_label': '추천 작품',
        'recommendations.empty_title': '아직 추천할 작품이 없습니다',
        'recommendations.empty_desc': '작품을 둘러보고 좋아요를 눌러 취향을 알려주세요!',
        'recommendations.view_gallery': '갤러리 둘러보기',
        
        // Buttons
        'btn.buy': '구매하기',
        'btn.bid': '입찰하기',
        'btn.view_more': '더 보기',
        'btn.view_all': '전체 보기',
        'btn.go_back': '뒤로 가기',
        'btn.download': '다운로드',
        'btn.upload': '업로드',
        
        // Messages
        'msg.loading': '로딩 중...',
        'msg.success': '성공했습니다',
        'msg.error': '오류가 발생했습니다',
        'msg.no_data': '데이터가 없습니다',
        'msg.coming_soon': '곧 출시됩니다',
        
        // Search Section
        'search.placeholder': 'AI로 작품 검색... (텍스트, 음성 지원)',
        'search.voice': '음성 검색',
        'search.ai': 'AI 검색',
        'search.noResults': '검색 결과가 없습니다',
        
        // Quick Categories
        'category.painting': '회화',
        'category.digital': '디지털아트',
        'category.photo': '사진',
        'category.sculpture': '조각',
        'category.abstract': '추상화',
        'category.3dart': '3D 아트',
        
        // VR Gallery
        'vr.tour': 'VR 갤러리 투어',
        'vr.experience': '360도 가상 갤러리에서 작품 감상하기',
        'vr.goGallery': '갤러리로 이동',
        
        // Stats Cards
        'stats.artworks': 'NFT 작품',
        'stats.artists': '아티스트',
        'stats.minted': '민팅 완료',
        'stats.totalValue': '총 가치',
        
        // Innovation Features Section
        'innovation.badge': '월드클래스 3대 신기능',
        'innovation.title': '혁신 기술로 더 안전하고 편리한 NFT 경험',
        'innovation.subtitle': 'AI 기반 진위 검증, 완전 자동화된 로열티, 글로벌 파트너십으로',
        
        // AI Verification Feature
        'feature.ai.title': 'AI 진위 검증',
        'feature.ai.desc': '딥러닝 기반 이미지 분석과 블록체인 추적으로 작품의 진위성을 자동으로 검증합니다',
        'feature.ai.item1': '실시간 위조품 탐지',
        'feature.ai.item2': '블록체인 기록 자동 추적',
        'feature.ai.item3': '전문가 2차 검증 시스템',
        'feature.ai.link': '진위 검증 알아보기',
        
        // Auto Royalty Feature
        'feature.royalty.title': '자동 로열티 분배',
        'feature.royalty.desc': '스마트 컨트랙트를 통한 완전 자동화된 로열티 분배 시스템으로 투명한 수익 분배를 보장합니다',
        'feature.royalty.item1': '거래 즉시 자동 분배',
        'feature.royalty.item2': '투명한 분배 내역 확인',
        'feature.royalty.item3': '스마트 컨트랙트 보장',
        'feature.royalty.link': '로열티 시스템 알아보기',
        
        // Global Partnership Feature
        'feature.partnership.title': '글로벌 파트너십',
        'feature.partnership.desc': '전 세계 미술관, 갤러리, 딜러와의 파트너십으로 프리미엄 작품을 제공합니다',
        'feature.partnership.item1': '전문 갤러리 큐레이션',
        'feature.partnership.item2': '국제 미술 전시 연계',
        'feature.partnership.item3': '블록체인 보안',
        'feature.partnership.link': '파트너 미술관 보기',
        
        // Artwork Sections
        'section.recommended': '추천 작품',
        'section.popular': '인기 작품',
        'section.new': '신규 작품',
        'section.recommendedDesc': '평점 4.0 이상의 추천 작품이 없습니다.',
        'section.popularDesc': '인기 작품이 없습니다.',
        'section.popularMsg': '조회수와 좋아요가 많은 작품이 곧 추가됩니다.',
        'section.newDesc': '등록된 작품이 없습니다.',
        
        // AI Recommendations
        'ai.recommendations': '🤖 AI RECOMMENDATIONS',
        'ai.forYou': '당신을 위한 추천 작품',
        'ai.analyzing': '추천 작품을 분석하는 중...',
        'ai.hybrid': '하이브리드 추천',
        'ai.noRecommendations': '아직 추천할 작품이 없습니다',
        
        // Artwork Card
        'card.estimatedValue': '산정가',
        'card.views': '조회',
        'card.likes': '좋아요',
        'card.seeDetails': '상세 보기',
        
        // Auction Section
        'auction.info': '경매 정보를 불러오는 중...',
        'auction.ended': '경매 종료',
        'auction.noAuctions': '진행 중인 경매가 없습니다',
        'auction.available': '판매자가 경매를 시작하면 참여할 수 있습니다',
        'auction.bid': '경매 입찰',
        
        // Valuation System
        'valuation.title': '작품분석 + AI평가 + 전문가 검증',
        'valuation.subtitle': '평가 완료 후 즉시 NFT 민팅 및 등록 가능',
        'valuation.aiValue': 'AI 산정 가치',
        'valuation.hashBonus': '블록체인 원본 해시 등록 (+40점)',
        'valuation.noArtworks': '민팅 가능한 작품이 없습니다.',
        'valuation.aiPrice': 'AI 산정가',
        'valuation.aiPrediction': 'AI 가격 예측 보기',
        
        // Upload Section
        'upload.title': 'NFT 작품 업로드',
        'upload.subtitle': '작품을 업로드하고 NFT로 발행하세요',
        'upload.dragDrop': '이미지를 드래그하거나 클릭하여 업로드',
        'upload.noUploads': '아직 업로드한 작품이 없습니다',
        
        // Analysis
        'analysis.marketTrend': 'NFT 마켓 트렌드 및 거래량 분석',
        'analysis.editionComparison': '에디션 수 및 유사 NFT 비교 분석',
        'analysis.artistStyle': '아티스트의 고유한 스타일과 창의성',
        
        // Main Page
        'main.hero_title_1': 'Discover',
        'main.hero_title_2': 'Premium NFTs',
        'main.hero_subtitle': '객관적인 가치산정 시스템으로 검증된 프리미엄 NFT 아트 컬렉션',
        'main.search_placeholder': 'AI로 작품 검색... (텍스트, 음성 지원)',
        'main.voice_search': '음성 검색',
        'main.ai_search': 'AI 검색',
        
        // Welcome Tutorial
        'tutorial.welcome_title': '갤러리피아에 오신 것을 환영합니다! 🎨',
        'tutorial.welcome_subtitle': 'NFT 아트의 새로운 세계로',
        'tutorial.welcome_description': '갤러리피아는 AI 기반 가치산정 시스템을 갖춘 차세대 NFT 아트 플랫폼입니다. 주요 기능을 빠르게 둘러보시겠어요?',
        'tutorial.start_tour': '투어 시작하기',
        'tutorial.skip': '건너뛰기',
        
        // Keyboard Shortcuts
        'shortcuts.title': '⌨️ 키보드 단축키',
        'shortcuts.close': '닫기',
        'shortcuts.section_navigation': '🧭 네비게이션',
        'shortcuts.go_home': '홈으로 이동',
        'shortcuts.go_gallery': '갤러리로 이동',
        'shortcuts.search': '검색',
        'shortcuts.section_actions': '⚡ 액션',
        'shortcuts.open_notifications': '알림 열기',
        'shortcuts.close_modal': '모달/메뉴 닫기',
        'shortcuts.help': '단축키 도움말',
        'shortcuts.section_accessibility': '♿ 접근성',
        'shortcuts.tab_navigate': '요소 간 이동',
        'shortcuts.tab_reverse': '역방향 이동',
        'shortcuts.activate_link': '링크/버튼 활성화',
        'shortcuts.tip': '<strong>Tip:</strong> Tab 키를 눌러 페이지 내 모든 인터랙티브 요소를 탐색할 수 있습니다.',
        'shortcuts.confirm': '확인',
      },
      
      // English
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.gallery': 'Gallery',
        'nav.auctions': 'Auctions',
        'nav.artists': 'Artists',
        'nav.leaderboard': 'Leaderboard',
        'nav.recommendations': 'Recommendations',
        'nav.analytics': 'Analytics',
        'nav.admin': 'Admin',
        'nav.profile': 'My Profile',
        'nav.dashboard': 'Dashboard',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',
        'nav.login': 'Login',
        'nav.signup': 'Sign Up',
        
        // Common
        'common.search': 'Search',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.more': 'More',
        'common.less': 'Less',
        'common.all': 'All',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        
        // Gallery
        'gallery.title': 'Gallery',
        'gallery.featured': 'Featured Artworks',
        'gallery.new': 'New Arrivals',
        'gallery.trending': 'Trending',
        'gallery.price': 'Price',
        'gallery.artist': 'Artist',
        'gallery.category': 'Category',
        'gallery.view_details': 'View Details',
        'gallery.like': 'Like',
        'gallery.share': 'Share',
        'gallery.3d_viewer': '3D View',
        'gallery.ar_viewer': 'AR View',
        'gallery.vr_gallery': 'VR Gallery',
        
        // Auctions
        'auction.title': 'Auctions',
        'auction.live': 'Live',
        'auction.upcoming': 'Upcoming',
        'auction.ended': 'Ended',
        'auction.bid': 'Place Bid',
        'auction.current_bid': 'Current Bid',
        'auction.starting_bid': 'Starting Bid',
        'auction.time_left': 'Time Left',
        'auction.highest_bidder': 'Highest Bidder',
        
        // Artists
        'artist.title': 'Artists',
        'artist.rank': 'Rank',
        'artist.artworks': 'Artworks',
        'artist.followers': 'Followers',
        'artist.view_profile': 'View Profile',
        'artist.follow': 'Follow',
        
        // Recommendations
        'rec.title': 'Personalized',
        'rec.for_you': 'For You',
        'rec.similar': 'Similar Artworks',
        'rec.trending': 'Trending',
        'rec.algorithm': 'Algorithm',
        'rec.confidence': 'Confidence',
        
        // Footer
        'footer.about': 'About',
        'footer.terms': 'Terms',
        'footer.privacy': 'Privacy',
        'footer.contact': 'Contact',
        'footer.copyright': '© 2024 GalleryPia. All rights reserved.',
        
        // Main Page - Hero Section
        'hero.title1': 'Discover',
        'hero.title2': 'Premium NFTs',
        'hero.subtitle': 'Verified by objective valuation system',
        'hero.subtitle2': 'Premium NFT art collection',
        
        // Main Page - Buttons
        'main.explore': 'Explore NFT Collection',
        'main.valuation': 'Self-Valuation System',
        'main.system_guide': 'System Guide',
        'main.expert_apply': 'Expert Application',
        'main.partnership': 'Partnership',
        'main.partnership_sub': 'Museum·Gallery·Dealer',
        'main.signup': 'Sign Up',
        'main.install': 'Install App',
        'main.mint': 'Mint NFT',
        'main.wallet': 'Connect Wallet',
        
        // Main Page - Stats
        'main.artworks': 'NFT Artworks',
        'main.artists': 'Artists',
        'main.minted': 'Minted',
        'main.total_value': 'Total Value',
        
        // Main Page - Features Section
        'features.badge': '🚀 World-Class Innovation',
        'features.title1': 'New Standard for',
        'features.title2': 'NFT Platform',
        'features.subtitle1': 'AI-based authentication, automated royalties, global partnerships',
        'features.subtitle2': 'Providing world-class NFT trading environment',
        
        // Feature 1: AI Authentication
        'feature1.title': 'AI Authentication',
        'feature1.desc': 'Automatically verify artwork authenticity with deep learning image analysis and blockchain tracking',
        'feature1.item1': 'Real-time counterfeit detection',
        'feature1.item2': 'Auto blockchain tracking',
        'feature1.item3': 'Expert 2nd verification',
        'feature1.link': 'Learn More',
        
        // Feature 2: Auto Royalty
        'feature2.title': 'Auto Royalty System',
        'feature2.desc': 'Smart contracts automatically distribute revenue to artists on secondary sales',
        'feature2.item1': 'Permanent copyright income',
        'feature2.item2': 'Instant settlement',
        'feature2.item3': 'Transparent transactions',
        
        // Feature 3: Global Partnership
        'feature3.title': 'Global Partnership',
        'feature3.desc': 'Verified artworks only through partnerships with world-renowned museums and galleries',
        'feature3.item1': 'Verified museum works',
        'feature3.item2': 'Curator recommendations',
        'feature3.item3': 'Global marketplace',
        
        // Search Section
        'search.placeholder': 'Search artworks with AI... (Text, Voice supported)',
        'search.voice': 'Voice Search',
        'search.ai': 'AI Search',
        'search.noResults': 'No results found',
        
        // Quick Categories  
        'category.painting': 'Painting',
        'category.digital': 'Digital Art',
        'category.photo': 'Photography',
        'category.sculpture': 'Sculpture',
        'category.abstract': 'Abstract',
        'category.3dart': '3D Art',
        
        // VR Gallery
        'vr.tour': 'VR Gallery Tour',
        'vr.experience': 'Experience artworks in 360° virtual gallery',
        'vr.goGallery': 'Go to Gallery',
        
        // Stats Cards
        'stats.artworks': 'NFT Artworks',
        'stats.artists': 'Artists',
        'stats.minted': 'Minted',
        'stats.totalValue': 'Total Value',
        
        // Innovation Features Section
        'innovation.badge': 'World-Class 3 Major Features',
        'innovation.title': 'Safer and More Convenient NFT Experience',
        'innovation.subtitle': 'AI authenticity verification, automated royalty, global partnerships',
        
        // AI Verification Feature
        'feature.ai.title': 'AI Authenticity Verification',
        'feature.ai.desc': 'Auto verify artwork authenticity with deep learning image analysis and blockchain tracking',
        'feature.ai.item1': 'Real-time counterfeit detection',
        'feature.ai.item2': 'Automatic blockchain tracking',
        'feature.ai.item3': 'Expert secondary verification',
        'feature.ai.link': 'Learn about verification',
        
        // Auto Royalty Feature
        'feature.royalty.title': 'Automated Royalty Distribution',
        'feature.royalty.desc': 'Fully automated royalty distribution system through smart contracts',
        'feature.royalty.item1': 'Instant automatic distribution',
        'feature.royalty.item2': 'Transparent distribution history',
        'feature.royalty.item3': 'Smart contract guarantee',
        'feature.royalty.link': 'Learn about royalty system',
        
        // Global Partnership Feature
        'feature.partnership.title': 'Global Partnerships',
        'feature.partnership.desc': 'Premium artworks through partnerships with museums, galleries, and dealers worldwide',
        'feature.partnership.item1': 'Professional gallery curation',
        'feature.partnership.item2': 'International art exhibitions',
        'feature.partnership.item3': 'Blockchain security',
        'feature.partnership.link': 'View partner museums',
        
        // Artwork Sections
        'section.recommended': 'Recommended Artworks',
        'section.popular': 'Popular Artworks',
        'section.new': 'New Artworks',
        'section.recommendedDesc': 'No recommended artworks with rating 4.0+',
        'section.popularDesc': 'No popular artworks',
        'section.popularMsg': 'Popular artworks with many views and likes coming soon',
        'section.newDesc': 'No artworks registered yet',
        
        // AI Recommendations
        'ai.recommendations': '🤖 AI RECOMMENDATIONS',
        'ai.forYou': 'Recommended for You',
        'ai.analyzing': 'Analyzing recommendations...',
        'ai.hybrid': 'Hybrid Recommendations',
        'ai.noRecommendations': 'No recommendations yet',
        
        // Artwork Card
        'card.estimatedValue': 'Estimated Value',
        'card.views': 'Views',
        'card.likes': 'Likes',
        'card.seeDetails': 'See Details',
        
        // Auction Section
        'auction.info': 'Loading auction information...',
        'auction.ended': 'Auction Ended',
        'auction.noAuctions': 'No ongoing auctions',
        'auction.available': 'You can participate when sellers start auctions',
        'auction.bid': 'Place Bid',
        
        // Valuation System
        'valuation.title': 'Artwork Analysis + AI Evaluation + Expert Verification',
        'valuation.subtitle': 'Immediate NFT minting after evaluation',
        'valuation.aiValue': 'AI Estimated Value',
        'valuation.hashBonus': 'Blockchain Hash Registration (+40pts)',
        'valuation.noArtworks': 'No artworks available for minting',
        'valuation.aiPrice': 'AI Estimated Price',
        'valuation.aiPrediction': 'View AI Price Prediction',
        
        // Upload Section
        'upload.title': 'Upload NFT Artwork',
        'upload.subtitle': 'Upload your artwork and mint as NFT',
        'upload.dragDrop': 'Drag or click to upload images',
        'upload.noUploads': 'No uploaded artworks yet',
        
        // Analysis
        'analysis.marketTrend': 'NFT market trend and trading volume analysis',
        'analysis.editionComparison': 'Edition count and similar NFT comparison',
        'analysis.artistStyle': 'Artist\'s unique style and creativity',
        
        // Main Page
        'main.hero_title_1': 'Discover',
        'main.hero_title_2': 'Premium NFTs',
        'main.hero_subtitle': 'Premium NFT art collection verified by objective valuation system',
        'main.search_placeholder': 'Search with AI... (Text, Voice supported)',
        'main.voice_search': 'Voice Search',
        'main.ai_search': 'AI Search',
        
        // Welcome Tutorial
        'tutorial.welcome_title': 'Welcome to GalleryPia! 🎨',
        'tutorial.welcome_subtitle': 'Into the new world of NFT Art',
        'tutorial.welcome_description': 'GalleryPia is a next-generation NFT art platform with an AI-based valuation system. Would you like a quick tour of the main features?',
        'tutorial.start_tour': 'Start Tour',
        'tutorial.skip': 'Skip',
        
        // Keyboard Shortcuts
        'shortcuts.title': '⌨️ Keyboard Shortcuts',
        'shortcuts.close': 'Close',
        'shortcuts.section_navigation': '🧭 Navigation',
        'shortcuts.go_home': 'Go to Home',
        'shortcuts.go_gallery': 'Go to Gallery',
        'shortcuts.search': 'Search',
        'shortcuts.section_actions': '⚡ Actions',
        'shortcuts.open_notifications': 'Open Notifications',
        'shortcuts.close_modal': 'Close Modal/Menu',
        'shortcuts.help': 'Shortcuts Help',
        'shortcuts.section_accessibility': '♿ Accessibility',
        'shortcuts.tab_navigate': 'Navigate between elements',
        'shortcuts.tab_reverse': 'Navigate backwards',
        'shortcuts.activate_link': 'Activate link/button',
        'shortcuts.tip': '<strong>Tip:</strong> Press Tab to navigate all interactive elements on the page.',
        'shortcuts.confirm': 'Confirm',
        
        // Common Terms
        'common.close': 'Close',
        'common.submit': 'Submit',
        'common.reset': 'Reset',
        'common.filter': 'Filter',
        'common.sort': 'Sort',
        'common.apply': 'Apply',
        'common.clear': 'Clear',
        
        // Navigation Common
        'nav.skip_to_content': 'Skip to main content',
        'nav.language_selection': 'Language Selection',
        'nav.notifications': 'Notifications',
        'nav.loading_notifications': 'Loading notifications...',
        'nav.no_notifications': 'No new notifications',
        'nav.user': 'User',
        'nav.tutorial_replay': 'Replay Tutorial',
        'nav.wallet_connect': 'Connect Wallet',
        'nav.curation': 'Curation',
        'nav.academy': 'Academy',
        'nav.about': 'About',
        
        // Gallery Page
        'gallery.title': 'Gallery',
        'gallery.all': 'All',
        'gallery.painting': 'Painting',
        'gallery.sculpture': 'Sculpture',
        'gallery.photo': 'Photography',
        'gallery.digital': 'Digital Art',
        'gallery.mixed': 'Mixed Media',
        'gallery.installation': 'Installation',
        'gallery.craft': 'Craft',
        'gallery.design': 'Design',
        'gallery.print': 'Print',
        'gallery.media': 'Media Art',
        'gallery.sort_latest': 'Latest',
        'gallery.sort_popular': 'Popular',
        'gallery.sort_price_high': 'Price: High to Low',
        'gallery.sort_price_low': 'Price: Low to High',
        'gallery.filter_verified': 'Verified Only',
        'gallery.filter_price_range': 'Price Range',
        'gallery.search_placeholder': 'Search by artwork or artist...',
        'gallery.no_results': 'No results found',
        'gallery.loading': 'Loading artworks...',
        
        // Artwork Card
        'artwork.views': 'Views',
        'artwork.likes': 'Likes',
        'artwork.estimated_price': 'Est. Price',
        'artwork.view_details': 'View Details',
        'artwork.add_to_favorites': 'Add to Favorites',
        'artwork.share': 'Share',
        'artwork.report': 'Report',
        
        // Valuation Page
        'valuation.title': 'Valuation',
        'valuation.description': 'Scientific NFT Art Valuation Platform',
        'valuation.system_title': 'Scientific Valuation Based on 5 Modules',
        'valuation.upload_artwork': 'Upload NFT Artwork',
        'valuation.start': 'Start Valuation',
        'valuation.history': 'Valuation History',
        
        // Search Page
        'search.title': 'Search',
        'search.voice_search': 'Voice Search',
        'search.ai_search': 'AI Search',
        'search.advanced': 'Advanced Search',
        'search.recent_searches': 'Recent Searches',
        'search.popular_searches': 'Popular Searches',
        
        // Artist Page
        'artists.title': 'Artists',
        'artists.all': 'All Artists',
        'artists.featured': 'Featured Artists',
        'artists.new': 'New Artists',
        'artists.follow': 'Follow',
        'artists.following': 'Following',
        'artists.artworks': 'Artworks',
        'artists.followers': 'Followers',
        
        // Collections
        'collections.title': 'Collections',
        'collections.view': 'View Collection',
        'collections.create': 'Create Collection',
        'collections.my': 'My Collections',
        
        // Mint Page
        'mint.title': 'Mint NFT',
        'mint.upload': 'Upload Artwork',
        'mint.title_label': 'Artwork Title',
        'mint.description_label': 'Description',
        'mint.price_label': 'Price',
        'mint.category_label': 'Category',
        'mint.start_minting': 'Start Minting',
        
        // My Page
        'mypage.title': 'My Page',
        'mypage.dashboard': 'Dashboard',
        'mypage.profile': 'Profile',
        'mypage.settings': 'Settings',
        'mypage.my_artworks': 'My Artworks',
        'mypage.favorites': 'Favorites',
        'mypage.transactions': 'Transactions',
        
        // Leaderboard
        'leaderboard.title': 'Leaderboard',
        'leaderboard.artists': 'Artists Ranking',
        'leaderboard.artworks': 'Artworks Ranking',
        'leaderboard.collectors': 'Collectors Ranking',
        
        // Academy
        'academy.title': 'NFT Academy',
        'academy.courses': 'Courses',
        'academy.tutorials': 'Tutorials',
        'academy.guides': 'Guides',
        
        // Support
        'support.title': 'Support',
        'support.faq': 'FAQ',
        'support.contact': 'Contact Us',
        'support.help': 'Help',
        
        // Auth
        'auth.login': 'Login',
        'auth.signup': 'Sign Up',
        'auth.logout': 'Logout',
        'auth.forgot_password': 'Forgot Password',
        'auth.reset_password': 'Reset Password',
        'auth.welcome': 'Welcome to GalleryPia',
        'auth.social_login': 'Quick login with social account',
        'auth.social_signup': 'Quick signup with social account',
        'auth.or_login_with': 'Or login with email',
        'auth.or_signup_with': 'Or sign up with email',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.remember_me': 'Remember me',
        'auth.login_button': 'Login',
        'auth.signup_button': 'Sign Up',
        'auth.no_account': 'Don\'t have an account?',
        'auth.have_account': 'Already have an account?',
        'auth.signup_now': 'Sign up now',
        'auth.login_now': 'Login now',
        'auth.password_placeholder': 'Enter your password',
        'auth.basic_info': 'Basic Information',
        'auth.username': 'Username',
        'auth.full_name': 'Full Name',
        'auth.phone': 'Phone Number',
        'auth.confirm_password': 'Confirm Password',
        'auth.confirm_password_placeholder': 'Re-enter password',
        'auth.account_type': 'Select Account Type',
        'auth.role_buyer': 'Buyer',
        'auth.role_buyer_desc': 'Purchase and collect NFT artworks',
        'auth.role_seller': 'Seller',
        'auth.role_seller_desc': 'Sell and trade NFT artworks',
        'auth.role_artist': 'Artist',
        'auth.role_artist_desc': 'Register artworks and mint as NFTs',
        'auth.role_expert': 'Expert',
        'auth.role_expert_desc': 'Evaluate artworks and earn ETH rewards',
        'auth.role_expert_reward': '0.01-0.1 ETH reward per evaluation',
        'auth.role_museum': 'Museum',
        'auth.role_museum_desc': 'Plan exhibitions and curate artworks',
        'auth.role_gallery': 'Gallery',
        'auth.role_gallery_desc': 'Exhibit artworks and intermediate transactions',
        'auth.forgot_title': 'Forgot Password',
        'auth.forgot_desc': 'Please enter your registered email address',
        'auth.forgot_info': 'A password reset link will be sent to the email you entered.',
        'auth.send_reset_link': 'Send Reset Link',
        'auth.back_to_login': 'Back to Login',
        'auth.reset_title': 'Reset Password',
        'auth.reset_desc': 'Please enter a new password',
        'auth.new_password': 'New Password',
        'auth.password_min': 'Minimum 8 characters',
        'auth.change_password': 'Change Password',
        
        // Recommendations
        'recommendations.title': 'Recommended Artworks',
        'recommendations.subtitle': 'Discover artworks tailored to your taste with AI-based recommendation algorithm',
        'recommendations.tab_personalized': 'For You',
        'recommendations.tab_trending': 'Trending',
        'recommendations.tab_new': 'New Arrivals',
        'recommendations.loading': 'Analyzing recommendations...',
        'recommendations.algorithm_name': 'Hybrid Recommendations',
        'recommendations.algorithm_desc': 'We analyze your preferences and behavior patterns to recommend the best artworks',
        'recommendations.count_label': 'Recommendations',
        'recommendations.empty_title': 'No recommendations yet',
        'recommendations.empty_desc': 'Browse the gallery and like artworks to help us understand your taste!',
        'recommendations.view_gallery': 'Browse Gallery',
        
        // Buttons
        'btn.buy': 'Buy Now',
        'btn.bid': 'Place Bid',
        'btn.view_more': 'View More',
        'btn.view_all': 'View All',
        'btn.go_back': 'Go Back',
        'btn.download': 'Download',
        'btn.upload': 'Upload',
        
        // Messages
        'msg.loading': 'Loading...',
        'msg.success': 'Success',
        'msg.error': 'An error occurred',
        'msg.no_data': 'No data available',
        'msg.coming_soon': 'Coming Soon',
      },
      
      // Chinese (简体中文)
      zh: {
        // Navigation
        'nav.home': '首页',
        'nav.gallery': '画廊',
        'nav.auctions': '拍卖',
        'nav.artists': '艺术家',
        'nav.leaderboard': '排行榜',
        'nav.recommendations': '推荐',
        'nav.analytics': '分析',
        'nav.admin': '管理员',
        'nav.profile': '我的资料',
        'nav.dashboard': '仪表板',
        'nav.settings': '设置',
        'nav.logout': '登出',
        'nav.login': '登录',
        'nav.signup': '注册',
        
        // Common
        'common.search': '搜索',
        'common.loading': '加载中...',
        'common.error': '错误',
        'common.success': '成功',
        'common.cancel': '取消',
        'common.confirm': '确认',
        'common.save': '保存',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.view': '查看',
        'common.more': '更多',
        'common.less': '收起',
        'common.all': '全部',
        'common.back': '返回',
        'common.next': '下一个',
        'common.previous': '上一个',
        
        // Gallery
        'gallery.title': '画廊',
        'gallery.featured': '精选作品',
        'gallery.new': '新作品',
        'gallery.trending': '热门',
        'gallery.price': '价格',
        'gallery.artist': '艺术家',
        'gallery.category': '分类',
        'gallery.view_details': '查看详情',
        'gallery.like': '喜欢',
        'gallery.share': '分享',
        'gallery.3d_viewer': '3D查看',
        'gallery.ar_viewer': 'AR查看',
        'gallery.vr_gallery': 'VR画廊',
        
        // Auctions
        'auction.title': '拍卖',
        'auction.live': '进行中',
        'auction.upcoming': '即将开始',
        'auction.ended': '已结束',
        'auction.bid': '出价',
        'auction.current_bid': '当前价',
        'auction.starting_bid': '起拍价',
        'auction.time_left': '剩余时间',
        'auction.highest_bidder': '最高出价者',
        
        // Artists
        'artist.title': '艺术家',
        'artist.rank': '排名',
        'artist.artworks': '作品数',
        'artist.followers': '关注者',
        'artist.view_profile': '查看资料',
        'artist.follow': '关注',
        
        // Recommendations
        'rec.title': '个性化推荐',
        'rec.for_you': '为你推荐',
        'rec.similar': '相似作品',
        'rec.trending': '热门作品',
        'rec.algorithm': '推荐算法',
        'rec.confidence': '置信度',
        
        // Footer
        'footer.about': '关于',
        'footer.terms': '条款',
        'footer.privacy': '隐私',
        'footer.contact': '联系',
        'footer.copyright': '© 2024 GalleryPia. 版权所有。',
        
        // Main Page - Hero Section
        'hero.title1': 'Discover',
        'hero.title2': 'Premium NFTs',
        'hero.subtitle': '通过客观估值系统验证',
        'hero.subtitle2': '高级NFT艺术收藏',
        
        // Main Page - Buttons
        'main.explore': '探索NFT收藏',
        'main.valuation': '自我估值系统',
        'main.system_guide': '系统指南',
        'main.expert_apply': '专家申请',
        'main.partnership': 'Partnership',
        'main.partnership_sub': '博物馆·画廊·经销商',
        'main.signup': '注册',
        'main.install': '安装应用',
        'main.mint': '铸造NFT',
        'main.wallet': '连接钱包',
        
        // Main Page - Stats
        'main.artworks': 'NFT作品',
        'main.artists': '艺术家',
        'main.minted': '已铸造',
        'main.total_value': '总价值',
        
        // Main Page - Features Section
        'features.badge': '🚀 世界级创新技术',
        'features.title1': 'NFT平台的',
        'features.title2': '新标准',
        'features.subtitle1': 'AI认证、自动版税、全球合作伙伴',
        'features.subtitle2': '提供世界级NFT交易环境',
        
        // Feature 1: AI Authentication
        'feature1.title': 'AI真伪验证',
        'feature1.desc': '通过深度学习图像分析和区块链追踪自动验证作品真实性',
        'feature1.item1': '实时假货检测',
        'feature1.item2': '自动区块链追踪',
        'feature1.item3': '专家二次验证',
        'feature1.link': '了解更多',
        
        // Feature 2: Auto Royalty
        'feature2.title': '自动版税系统',
        'feature2.desc': '智能合约在二次销售时自动向艺术家分配收益',
        'feature2.item1': '永久版权收入',
        'feature2.item2': '即时结算',
        'feature2.item3': '透明交易',
        
        // Feature 3: Global Partnership
        'feature3.title': '全球合作伙伴',
        'feature3.desc': '通过与世界知名博物馆和画廊合作仅提供经过验证的作品',
        'feature3.item1': '经过验证的博物馆作品',
        'feature3.item2': '策展人推荐',
        'feature3.item3': '全球市场',
        
        // Search Section
        'search.placeholder': '用AI搜索作品... (支持文本、语音)',
        'search.voice': '语音搜索',
        'search.ai': 'AI搜索',
        'search.noResults': '未找到结果',
        
        // Quick Categories
        'category.painting': '绘画',
        'category.digital': '数字艺术',
        'category.photo': '摄影',
        'category.sculpture': '雕塑',
        'category.abstract': '抽象画',
        'category.3dart': '3D艺术',
        
        // VR Gallery
        'vr.tour': 'VR画廊之旅',
        'vr.experience': '在360°虚拟画廊中欣赏作品',
        'vr.goGallery': '前往画廊',
        
        // Stats Cards
        'stats.artworks': 'NFT作品',
        'stats.artists': '艺术家',
        'stats.minted': '已铸造',
        'stats.totalValue': '总价值',
        
        // Innovation Features Section
        'innovation.badge': '世界级三大新功能',
        'innovation.title': '创新技术带来更安全便捷的NFT体验',
        'innovation.subtitle': '基于AI的真伪验证、全自动版税、全球合作伙伴',
        
        // AI Verification Feature
        'feature.ai.title': 'AI真伪验证',
        'feature.ai.desc': '通过深度学习图像分析和区块链追踪自动验证作品真伪',
        'feature.ai.item1': '实时伪造品检测',
        'feature.ai.item2': '区块链记录自动追踪',
        'feature.ai.item3': '专家二次验证系统',
        'feature.ai.link': '了解验证',
        
        // Auto Royalty Feature
        'feature.royalty.title': '自动版税分配',
        'feature.royalty.desc': '通过智能合约实现完全自动化的版税分配系统，确保透明的收益分配',
        'feature.royalty.item1': '即时自动分配',
        'feature.royalty.item2': '透明分配记录',
        'feature.royalty.item3': '智能合约保障',
        'feature.royalty.link': '了解版税系统',
        
        // Global Partnership Feature
        'feature.partnership.title': '全球合作伙伴',
        'feature.partnership.desc': '通过与全球博物馆、画廊和经销商的合作提供优质作品',
        'feature.partnership.item1': '专业画廊策展',
        'feature.partnership.item2': '国际艺术展览联动',
        'feature.partnership.item3': '区块链安全',
        'feature.partnership.link': '查看合作博物馆',
        
        // Artwork Sections
        'section.recommended': '推荐作品',
        'section.popular': '热门作品',
        'section.new': '新作品',
        'section.recommendedDesc': '暂无评分4.0以上的推荐作品',
        'section.popularDesc': '暂无热门作品',
        'section.popularMsg': '浏览量和点赞数高的作品即将添加',
        'section.newDesc': '暂无已注册作品',
        
        // AI Recommendations
        'ai.recommendations': '🤖 AI推荐',
        'ai.forYou': '为您推荐',
        'ai.analyzing': '正在分析推荐作品...',
        'ai.hybrid': '混合推荐',
        'ai.noRecommendations': '暂无推荐作品',
        
        // Artwork Card
        'card.estimatedValue': '估价',
        'card.views': '浏览',
        'card.likes': '点赞',
        'card.seeDetails': '查看详情',
        
        // Auction Section
        'auction.info': '正在加载拍卖信息...',
        'auction.ended': '拍卖结束',
        'auction.noAuctions': '暂无进行中的拍卖',
        'auction.available': '卖家开始拍卖后即可参与',
        'auction.bid': '竞价',
        
        // Valuation System
        'valuation.title': '作品分析 + AI评估 + 专家验证',
        'valuation.subtitle': '评估完成后立即铸造NFT并注册',
        'valuation.aiValue': 'AI估值',
        'valuation.hashBonus': '区块链原始哈希注册 (+40分)',
        'valuation.noArtworks': '暂无可铸造作品',
        'valuation.aiPrice': 'AI估价',
        'valuation.aiPrediction': '查看AI价格预测',
        
        // Upload Section
        'upload.title': '上传NFT作品',
        'upload.subtitle': '上传您的作品并铸造为NFT',
        'upload.dragDrop': '拖动或点击上传图片',
        'upload.noUploads': '暂无已上传作品',
        
        // Analysis
        'analysis.marketTrend': 'NFT市场趋势和交易量分析',
        'analysis.editionComparison': '版数和类似NFT对比分析',
        'analysis.artistStyle': '艺术家的独特风格和创意',
        
        // Main Page
        'main.hero_title_1': '发现',
        'main.hero_title_2': '优质NFT',
        'main.hero_subtitle': '经客观估值系统验证的优质NFT艺术收藏',
        'main.search_placeholder': '使用AI搜索... (支持文字、语音)',
        'main.voice_search': '语音搜索',
        'main.ai_search': 'AI搜索',
        
        // Welcome Tutorial
        'tutorial.welcome_title': '欢迎来到GalleryPia！🎨',
        'tutorial.welcome_subtitle': '进入NFT艺术的新世界',
        'tutorial.welcome_description': 'GalleryPia是一个具有AI估值系统的下一代NFT艺术平台。想快速浏览主要功能吗？',
        'tutorial.start_tour': '开始导览',
        'tutorial.skip': '跳过',
        
        // Keyboard Shortcuts
        'shortcuts.title': '⌨️ 键盘快捷键',
        'shortcuts.close': '关闭',
        'shortcuts.section_navigation': '🧭 导航',
        'shortcuts.go_home': '前往主页',
        'shortcuts.go_gallery': '前往画廊',
        'shortcuts.search': '搜索',
        'shortcuts.section_actions': '⚡ 操作',
        'shortcuts.open_notifications': '打开通知',
        'shortcuts.close_modal': '关闭模态窗口/菜单',
        'shortcuts.help': '快捷键帮助',
        'shortcuts.section_accessibility': '♿ 辅助功能',
        'shortcuts.tab_navigate': '在元素间导航',
        'shortcuts.tab_reverse': '反向导航',
        'shortcuts.activate_link': '激活链接/按钮',
        'shortcuts.tip': '<strong>提示:</strong> 按Tab键可以浏览页面上的所有交互元素。',
        'shortcuts.confirm': '确认',
        
        // Common Terms
        'common.close': '关闭',
        'common.submit': '提交',
        'common.reset': '重置',
        'common.filter': '筛选',
        'common.sort': '排序',
        'common.apply': '应用',
        'common.clear': '清除',
        
        // Navigation Common
        'nav.skip_to_content': '跳转到主要内容',
        'nav.language_selection': '语言选择',
        'nav.notifications': '通知',
        'nav.loading_notifications': '正在加载通知...',
        'nav.no_notifications': '暂无新通知',
        'nav.user': '用户',
        'nav.tutorial_replay': '重播教程',
        'nav.wallet_connect': '连接钱包',
        'nav.curation': '策展',
        'nav.academy': '学院',
        'nav.about': '关于',
        
        // Gallery Page
        'gallery.title': '画廊',
        'gallery.all': '全部',
        'gallery.painting': '绘画',
        'gallery.sculpture': '雕塑',
        'gallery.photo': '摄影',
        'gallery.digital': '数字艺术',
        'gallery.mixed': '混合媒体',
        'gallery.installation': '装置艺术',
        'gallery.craft': '工艺',
        'gallery.design': '设计',
        'gallery.print': '版画',
        'gallery.media': '媒体艺术',
        'gallery.sort_latest': '最新',
        'gallery.sort_popular': '热门',
        'gallery.sort_price_high': '价格：高到低',
        'gallery.sort_price_low': '价格：低到高',
        'gallery.filter_verified': '仅显示已验证',
        'gallery.filter_price_range': '价格范围',
        'gallery.search_placeholder': '按作品或艺术家搜索...',
        'gallery.no_results': '未找到结果',
        'gallery.loading': '正在加载作品...',
        
        // Artwork Card
        'artwork.views': '浏览',
        'artwork.likes': '点赞',
        'artwork.estimated_price': '估价',
        'artwork.view_details': '查看详情',
        'artwork.add_to_favorites': '添加到收藏',
        'artwork.share': '分享',
        'artwork.report': '举报',
        
        // Valuation Page
        'valuation.title': '估值',
        'valuation.description': '科学NFT艺术品估值平台',
        'valuation.system_title': '基于5个模块的科学估值',
        'valuation.upload_artwork': '上传NFT作品',
        'valuation.start': '开始估值',
        'valuation.history': '估值历史',
        
        // Search Page
        'search.title': '搜索',
        'search.voice_search': '语音搜索',
        'search.ai_search': 'AI搜索',
        'search.advanced': '高级搜索',
        'search.recent_searches': '最近搜索',
        'search.popular_searches': '热门搜索',
        
        // Artist Page
        'artists.title': '艺术家',
        'artists.all': '全部艺术家',
        'artists.featured': '推荐艺术家',
        'artists.new': '新艺术家',
        'artists.follow': '关注',
        'artists.following': '已关注',
        'artists.artworks': '作品',
        'artists.followers': '粉丝',
        
        // Collections
        'collections.title': '收藏',
        'collections.view': '查看收藏',
        'collections.create': '创建收藏',
        'collections.my': '我的收藏',
        
        // Mint Page
        'mint.title': '铸造NFT',
        'mint.upload': '上传作品',
        'mint.title_label': '作品名称',
        'mint.description_label': '描述',
        'mint.price_label': '价格',
        'mint.category_label': '类别',
        'mint.start_minting': '开始铸造',
        
        // My Page
        'mypage.title': '我的主页',
        'mypage.dashboard': '仪表板',
        'mypage.profile': '个人资料',
        'mypage.settings': '设置',
        'mypage.my_artworks': '我的作品',
        'mypage.favorites': '收藏',
        'mypage.transactions': '交易记录',
        
        // Leaderboard
        'leaderboard.title': '排行榜',
        'leaderboard.artists': '艺术家排名',
        'leaderboard.artworks': '作品排名',
        'leaderboard.collectors': '收藏家排名',
        
        // Academy
        'academy.title': 'NFT学院',
        'academy.courses': '课程',
        'academy.tutorials': '教程',
        'academy.guides': '指南',
        
        // Support
        'support.title': '支持',
        'support.faq': '常见问题',
        'support.contact': '联系我们',
        'support.help': '帮助',
        
        // Auth
        'auth.login': '登录',
        'auth.signup': '注册',
        'auth.logout': '登出',
        'auth.forgot_password': '忘记密码',
        'auth.reset_password': '重置密码',
        'auth.welcome': '欢迎来到GalleryPia',
        'auth.social_login': '使用社交账户快速登录',
        'auth.social_signup': '使用社交账户快速注册',
        'auth.or_login_with': '或使用电子邮件登录',
        'auth.or_signup_with': '或使用电子邮件注册',
        'auth.email': '电子邮件',
        'auth.password': '密码',
        'auth.remember_me': '记住我',
        'auth.login_button': '登录',
        'auth.signup_button': '注册',
        'auth.no_account': '还没有账户？',
        'auth.have_account': '已有账户？',
        'auth.signup_now': '立即注册',
        'auth.login_now': '立即登录',
        'auth.password_placeholder': '输入密码',
        'auth.basic_info': '基本信息',
        'auth.username': '用户名',
        'auth.full_name': '姓名',
        'auth.phone': '电话号码',
        'auth.confirm_password': '确认密码',
        'auth.confirm_password_placeholder': '再次输入密码',
        'auth.account_type': '选择账户类型',
        'auth.role_buyer': '买家',
        'auth.role_buyer_desc': '购买和收藏NFT艺术品',
        'auth.role_seller': '卖家',
        'auth.role_seller_desc': '出售和交易NFT艺术品',
        'auth.role_artist': '艺术家',
        'auth.role_artist_desc': '注册作品并铸造为NFT',
        'auth.role_expert': '专家',
        'auth.role_expert_desc': '评估作品并获得ETH奖励',
        'auth.role_expert_reward': '每次评估奖励0.01-0.1 ETH',
        'auth.role_museum': '博物馆',
        'auth.role_museum_desc': '策划展览和策展作品',
        'auth.role_gallery': '画廊',
        'auth.role_gallery_desc': '展示作品并中介交易',
        'auth.forgot_title': '忘记密码',
        'auth.forgot_desc': '请输入您注册的电子邮件地址',
        'auth.forgot_info': '密码重置链接将发送到您输入的电子邮件。',
        'auth.send_reset_link': '发送重置链接',
        'auth.back_to_login': '返回登录',
        'auth.reset_title': '重置密码',
        'auth.reset_desc': '请输入新密码',
        'auth.new_password': '新密码',
        'auth.password_min': '至少8个字符',
        'auth.change_password': '更改密码',
        
        // Recommendations
        'recommendations.title': '为您推荐的作品',
        'recommendations.subtitle': '通过AI推荐算法发现符合您品味的作品',
        'recommendations.tab_personalized': '个性化推荐',
        'recommendations.tab_trending': '热门上升',
        'recommendations.tab_new': '新作品',
        'recommendations.loading': '正在分析推荐作品...',
        'recommendations.algorithm_name': '混合推荐',
        'recommendations.algorithm_desc': '分析您的偏好和行为模式，推荐最佳作品',
        'recommendations.count_label': '推荐作品',
        'recommendations.empty_title': '暂无推荐作品',
        'recommendations.empty_desc': '浏览画廊并点赞作品，告诉我们您的品味！',
        'recommendations.view_gallery': '浏览画廊',
        
        // Buttons
        'btn.buy': '立即购买',
        'btn.bid': '出价',
        'btn.view_more': '查看更多',
        'btn.view_all': '查看全部',
        'btn.go_back': '返回',
        'btn.download': '下载',
        'btn.upload': '上传',
        
        // Messages
        'msg.loading': '加载中...',
        'msg.success': '成功',
        'msg.error': '发生错误',
        'msg.no_data': '暂无数据',
        'msg.coming_soon': '即将推出',
      },
      
      // Japanese (日本語)
      ja: {
        // Navigation
        'nav.home': 'ホーム',
        'nav.gallery': 'ギャラリー',
        'nav.auctions': 'オークション',
        'nav.artists': 'アーティスト',
        'nav.leaderboard': 'ランキング',
        'nav.recommendations': 'おすすめ',
        'nav.analytics': '分析',
        'nav.admin': '管理者',
        'nav.profile': 'マイプロフィール',
        'nav.dashboard': 'ダッシュボード',
        'nav.settings': '設定',
        'nav.logout': 'ログアウト',
        'nav.login': 'ログイン',
        'nav.signup': '新規登録',
        
        // Common
        'common.search': '検索',
        'common.loading': '読み込み中...',
        'common.error': 'エラー',
        'common.success': '成功',
        'common.cancel': 'キャンセル',
        'common.confirm': '確認',
        'common.save': '保存',
        'common.delete': '削除',
        'common.edit': '編集',
        'common.view': '表示',
        'common.more': 'もっと見る',
        'common.less': '閉じる',
        'common.all': 'すべて',
        'common.back': '戻る',
        'common.next': '次へ',
        'common.previous': '前へ',
        
        // Gallery
        'gallery.title': 'ギャラリー',
        'gallery.featured': 'おすすめ作品',
        'gallery.new': '新作',
        'gallery.trending': 'トレンド',
        'gallery.price': '価格',
        'gallery.artist': 'アーティスト',
        'gallery.category': 'カテゴリー',
        'gallery.view_details': '詳細を見る',
        'gallery.like': 'いいね',
        'gallery.share': 'シェア',
        'gallery.3d_viewer': '3Dビュー',
        'gallery.ar_viewer': 'ARビュー',
        'gallery.vr_gallery': 'VRギャラリー',
        
        // Auctions
        'auction.title': 'オークション',
        'auction.live': '開催中',
        'auction.upcoming': '予定',
        'auction.ended': '終了',
        'auction.bid': '入札',
        'auction.current_bid': '現在価格',
        'auction.starting_bid': '開始価格',
        'auction.time_left': '残り時間',
        'auction.highest_bidder': '最高入札者',
        
        // Artists
        'artist.title': 'アーティスト',
        'artist.rank': 'ランク',
        'artist.artworks': '作品数',
        'artist.followers': 'フォロワー',
        'artist.view_profile': 'プロフィールを見る',
        'artist.follow': 'フォロー',
        
        // Recommendations
        'rec.title': 'パーソナライズ',
        'rec.for_you': 'あなたへのおすすめ',
        'rec.similar': '類似作品',
        'rec.trending': '人気作品',
        'rec.algorithm': 'アルゴリズム',
        'rec.confidence': '信頼度',
        
        // Footer
        'footer.about': '概要',
        'footer.terms': '利用規約',
        'footer.privacy': 'プライバシー',
        'footer.contact': 'お問い合わせ',
        'footer.copyright': '© 2024 GalleryPia. All rights reserved.',
        
        // Main Page - Hero Section
        'hero.title1': 'Discover',
        'hero.title2': 'Premium NFTs',
        'hero.subtitle': '客観的評価システムで検証済み',
        'hero.subtitle2': 'プレミアムNFTアートコレクション',
        
        // Main Page - Buttons
        'main.explore': 'NFTコレクション探索',
        'main.valuation': 'セルフ評価システム',
        'main.system_guide': 'システムガイド',
        'main.expert_apply': '専門家申請',
        'main.partnership': 'Partnership',
        'main.partnership_sub': '美術館·ギャラリー·ディーラー',
        'main.signup': '新規登録',
        'main.install': 'アプリインストール',
        'main.mint': 'NFTミント',
        'main.wallet': 'ウォレット接続',
        
        // Main Page - Stats
        'main.artworks': 'NFT作品',
        'main.artists': 'アーティスト',
        'main.minted': 'ミント完了',
        'main.total_value': '総価値',
        
        // Main Page - Features Section
        'features.badge': '🚀 ワールドクラス革新技術',
        'features.title1': 'NFTプラットフォームの',
        'features.title2': '新基準',
        'features.subtitle1': 'AI認証、自動ロイヤリティ、グローバルパートナーシップ',
        'features.subtitle2': '世界最高水準のNFT取引環境を提供',
        
        // Feature 1: AI Authentication
        'feature1.title': 'AI真贋検証',
        'feature1.desc': 'ディープラーニング画像分析とブロックチェーン追跡で作品の真贋を自動検証',
        'feature1.item1': 'リアルタイム偽造品検出',
        'feature1.item2': '自動ブロックチェーン追跡',
        'feature1.item3': '専門家二次検証',
        'feature1.link': '詳細を見る',
        
        // Feature 2: Auto Royalty
        'feature2.title': '自動ロイヤリティ',
        'feature2.desc': 'スマートコントラクトで二次販売時にアーティストへ自動分配',
        'feature2.item1': '永続的著作権収益',
        'feature2.item2': '即時決済',
        'feature2.item3': '透明な取引',
        
        // Feature 3: Global Partnership
        'feature3.title': 'グローバルパートナーシップ',
        'feature3.desc': '世界有数の美術館・ギャラリーとの協力により検証済み作品のみ提供',
        'feature3.item1': '検証済み美術館作品',
        'feature3.item2': 'キュレーター推薦',
        'feature3.item3': 'グローバルマーケット',
        
        // Search Section
        'search.placeholder': 'AIで作品を検索... (テキスト、音声対応)',
        'search.voice': '音声検索',
        'search.ai': 'AI検索',
        'search.noResults': '検索結果がありません',
        
        // Quick Categories
        'category.painting': '絵画',
        'category.digital': 'デジタルアート',
        'category.photo': '写真',
        'category.sculpture': '彫刻',
        'category.abstract': '抽象画',
        'category.3dart': '3Dアート',
        
        // VR Gallery
        'vr.tour': 'VRギャラリーツアー',
        'vr.experience': '360度バーチャルギャラリーで作品鑑賞',
        'vr.goGallery': 'ギャラリーへ',
        
        // Stats Cards
        'stats.artworks': 'NFT作品',
        'stats.artists': 'アーティスト',
        'stats.minted': 'ミント済み',
        'stats.totalValue': '総価値',
        
        // Innovation Features Section
        'innovation.badge': 'ワールドクラス3大新機能',
        'innovation.title': '革新技術でより安全で便利なNFT体験',
        'innovation.subtitle': 'AIベースの真贋検証、完全自動化されたロイヤリティ、グローバルパートナーシップ',
        
        // AI Verification Feature
        'feature.ai.title': 'AI真贋検証',
        'feature.ai.desc': 'ディープラーニングベースの画像分析とブロックチェーントラッキングで作品の真贋を自動検証',
        'feature.ai.item1': 'リアルタイム偽造品検出',
        'feature.ai.item2': 'ブロックチェーン記録自動追跡',
        'feature.ai.item3': '専門家二次検証システム',
        'feature.ai.link': '検証について',
        
        // Auto Royalty Feature
        'feature.royalty.title': '自動ロイヤリティ分配',
        'feature.royalty.desc': 'スマートコントラクトによる完全自動化されたロイヤリティ分配システムで透明な収益分配を保証',
        'feature.royalty.item1': '即時自動分配',
        'feature.royalty.item2': '透明な分配履歴',
        'feature.royalty.item3': 'スマートコントラクト保証',
        'feature.royalty.link': 'ロイヤリティシステムについて',
        
        // Global Partnership Feature
        'feature.partnership.title': 'グローバルパートナーシップ',
        'feature.partnership.desc': '世界中の美術館、ギャラリー、ディーラーとのパートナーシップでプレミアム作品を提供',
        'feature.partnership.item1': 'プロのギャラリーキュレーション',
        'feature.partnership.item2': '国際美術展示連携',
        'feature.partnership.item3': 'ブロックチェーンセキュリティ',
        'feature.partnership.link': 'パートナー美術館を見る',
        
        // Artwork Sections
        'section.recommended': 'おすすめ作品',
        'section.popular': '人気作品',
        'section.new': '新作',
        'section.recommendedDesc': '評価4.0以上のおすすめ作品はありません',
        'section.popularDesc': '人気作品はありません',
        'section.popularMsg': '閲覧数といいねが多い作品が間もなく追加されます',
        'section.newDesc': '登録された作品はありません',
        
        // AI Recommendations
        'ai.recommendations': '🤖 AIレコメンデーション',
        'ai.forYou': 'あなたへのおすすめ',
        'ai.analyzing': 'おすすめ作品を分析中...',
        'ai.hybrid': 'ハイブリッド推薦',
        'ai.noRecommendations': 'まだおすすめできる作品がありません',
        
        // Artwork Card
        'card.estimatedValue': '見積額',
        'card.views': '閲覧',
        'card.likes': 'いいね',
        'card.seeDetails': '詳細を見る',
        
        // Auction Section
        'auction.info': 'オークション情報を読み込み中...',
        'auction.ended': 'オークション終了',
        'auction.noAuctions': '進行中のオークションはありません',
        'auction.available': '販売者がオークションを開始すると参加できます',
        'auction.bid': '入札',
        
        // Valuation System
        'valuation.title': '作品分析 + AI評価 + 専門家検証',
        'valuation.subtitle': '評価完了後すぐにNFTミントと登録が可能',
        'valuation.aiValue': 'AI見積額',
        'valuation.hashBonus': 'ブロックチェーン原本ハッシュ登録 (+40点)',
        'valuation.noArtworks': 'ミント可能な作品がありません',
        'valuation.aiPrice': 'AI見積もり',
        'valuation.aiPrediction': 'AI価格予測を見る',
        
        // Upload Section
        'upload.title': 'NFT作品アップロード',
        'upload.subtitle': '作品をアップロードしてNFTとして発行',
        'upload.dragDrop': '画像をドラッグまたはクリックしてアップロード',
        'upload.noUploads': 'まだアップロードした作品がありません',
        
        // Analysis
        'analysis.marketTrend': 'NFT市場トレンドと取引量分析',
        'analysis.editionComparison': 'エディション数と類似NFT比較分析',
        'analysis.artistStyle': 'アーティストの独自のスタイルと創造性',
        
        // Main Page
        'main.hero_title_1': '発見する',
        'main.hero_title_2': 'プレミアムNFT',
        'main.hero_subtitle': '客観的な価値評価システムで検証されたプレミアムNFTアートコレクション',
        'main.search_placeholder': 'AIで作品を検索... (テキスト、音声対応)',
        'main.voice_search': '音声検索',
        'main.ai_search': 'AI検索',
        
        // Welcome Tutorial
        'tutorial.welcome_title': 'GalleryPiaへようこそ！🎨',
        'tutorial.welcome_subtitle': 'NFTアートの新しい世界へ',
        'tutorial.welcome_description': 'GalleryPiaはAIベースの価値評価システムを備えた次世代NFTアートプラットフォームです。主要機能を簡単にご案内しましょうか？',
        'tutorial.start_tour': 'ツアーを開始',
        'tutorial.skip': 'スキップ',
        
        // Keyboard Shortcuts
        'shortcuts.title': '⌨️ キーボードショートカット',
        'shortcuts.close': '閉じる',
        'shortcuts.section_navigation': '🧭 ナビゲーション',
        'shortcuts.go_home': 'ホームに移動',
        'shortcuts.go_gallery': 'ギャラリーに移動',
        'shortcuts.search': '検索',
        'shortcuts.section_actions': '⚡ アクション',
        'shortcuts.open_notifications': '通知を開く',
        'shortcuts.close_modal': 'モーダル/メニューを閉じる',
        'shortcuts.help': 'ショートカットヘルプ',
        'shortcuts.section_accessibility': '♿ アクセシビリティ',
        'shortcuts.tab_navigate': '要素間を移動',
        'shortcuts.tab_reverse': '逆方向に移動',
        'shortcuts.activate_link': 'リンク/ボタンを有効化',
        'shortcuts.tip': '<strong>ヒント:</strong> Tabキーを押してページ上のすべてのインタラクティブ要素を閲覧できます。',
        'shortcuts.confirm': '確認',
        
        // Common Terms
        'common.close': '閉じる',
        'common.submit': '送信',
        'common.reset': 'リセット',
        'common.filter': 'フィルター',
        'common.sort': '並び替え',
        'common.apply': '適用',
        'common.clear': 'クリア',
        
        // Navigation Common
        'nav.skip_to_content': 'メインコンテンツへスキップ',
        'nav.language_selection': '言語選択',
        'nav.notifications': '通知',
        'nav.loading_notifications': '通知を読み込み中...',
        'nav.no_notifications': '新しい通知はありません',
        'nav.user': 'ユーザー',
        'nav.tutorial_replay': 'チュートリアルを再生',
        'nav.wallet_connect': 'ウォレット接続',
        'nav.curation': 'キュレーション',
        'nav.academy': 'アカデミー',
        'nav.about': '概要',
        
        // Gallery Page
        'gallery.title': 'ギャラリー',
        'gallery.all': '全て',
        'gallery.painting': '絵画',
        'gallery.sculpture': '彫刻',
        'gallery.photo': '写真',
        'gallery.digital': 'デジタルアート',
        'gallery.mixed': 'ミクストメディア',
        'gallery.installation': 'インスタレーション',
        'gallery.craft': '工芸',
        'gallery.design': 'デザイン',
        'gallery.print': '版画',
        'gallery.media': 'メディアアート',
        'gallery.sort_latest': '最新',
        'gallery.sort_popular': '人気',
        'gallery.sort_price_high': '価格：高い順',
        'gallery.sort_price_low': '価格：安い順',
        'gallery.filter_verified': '検証済みのみ',
        'gallery.filter_price_range': '価格範囲',
        'gallery.search_placeholder': '作品またはアーティストで検索...',
        'gallery.no_results': '結果が見つかりません',
        'gallery.loading': '作品を読み込み中...',
        
        // Artwork Card
        'artwork.views': '閲覧数',
        'artwork.likes': 'いいね',
        'artwork.estimated_price': '見積額',
        'artwork.view_details': '詳細を見る',
        'artwork.add_to_favorites': 'お気に入りに追加',
        'artwork.share': '共有',
        'artwork.report': '報告',
        
        // Valuation Page
        'valuation.title': '評価',
        'valuation.description': '科学的NFTアート評価プラットフォーム',
        'valuation.system_title': '5つのモジュールに基づく科学的評価',
        'valuation.upload_artwork': 'NFT作品をアップロード',
        'valuation.start': '評価を開始',
        'valuation.history': '評価履歴',
        
        // Search Page
        'search.title': '検索',
        'search.voice_search': '音声検索',
        'search.ai_search': 'AI検索',
        'search.advanced': '詳細検索',
        'search.recent_searches': '最近の検索',
        'search.popular_searches': '人気の検索',
        
        // Artist Page
        'artists.title': 'アーティスト',
        'artists.all': '全アーティスト',
        'artists.featured': 'おすすめアーティスト',
        'artists.new': '新規アーティスト',
        'artists.follow': 'フォロー',
        'artists.following': 'フォロー中',
        'artists.artworks': '作品',
        'artists.followers': 'フォロワー',
        
        // Collections
        'collections.title': 'コレクション',
        'collections.view': 'コレクションを表示',
        'collections.create': 'コレクションを作成',
        'collections.my': 'マイコレクション',
        
        // Mint Page
        'mint.title': 'NFTミント',
        'mint.upload': '作品をアップロード',
        'mint.title_label': '作品名',
        'mint.description_label': '説明',
        'mint.price_label': '価格',
        'mint.category_label': 'カテゴリー',
        'mint.start_minting': 'ミントを開始',
        
        // My Page
        'mypage.title': 'マイページ',
        'mypage.dashboard': 'ダッシュボード',
        'mypage.profile': 'プロフィール',
        'mypage.settings': '設定',
        'mypage.my_artworks': 'マイ作品',
        'mypage.favorites': 'お気に入り',
        'mypage.transactions': '取引履歴',
        
        // Leaderboard
        'leaderboard.title': 'リーダーボード',
        'leaderboard.artists': 'アーティストランキング',
        'leaderboard.artworks': '作品ランキング',
        'leaderboard.collectors': 'コレクターランキング',
        
        // Academy
        'academy.title': 'NFTアカデミー',
        'academy.courses': 'コース',
        'academy.tutorials': 'チュートリアル',
        'academy.guides': 'ガイド',
        
        // Support
        'support.title': 'サポート',
        'support.faq': 'よくある質問',
        'support.contact': 'お問い合わせ',
        'support.help': 'ヘルプ',
        
        // Auth
        'auth.login': 'ログイン',
        'auth.signup': '新規登録',
        'auth.logout': 'ログアウト',
        'auth.forgot_password': 'パスワードを忘れた',
        'auth.reset_password': 'パスワードリセット',
        'auth.welcome': 'GalleryPiaへようこそ',
        'auth.social_login': 'ソーシャルアカウントで簡単ログイン',
        'auth.social_signup': 'ソーシャルアカウントで簡単登録',
        'auth.or_login_with': 'またはメールでログイン',
        'auth.or_signup_with': 'またはメールで登録',
        'auth.email': 'メールアドレス',
        'auth.password': 'パスワード',
        'auth.remember_me': 'ログイン状態を保持',
        'auth.login_button': 'ログイン',
        'auth.signup_button': '新規登録',
        'auth.no_account': 'アカウントをお持ちでない方',
        'auth.have_account': 'すでにアカウントをお持ちの方',
        'auth.signup_now': '今すぐ登録',
        'auth.login_now': 'ログイン',
        'auth.password_placeholder': 'パスワードを入力',
        'auth.basic_info': '基本情報',
        'auth.username': 'ユーザー名',
        'auth.full_name': '氏名',
        'auth.phone': '電話番号',
        'auth.confirm_password': 'パスワード確認',
        'auth.confirm_password_placeholder': 'パスワードを再入力',
        'auth.account_type': 'アカウントタイプを選択',
        'auth.role_buyer': '購入者',
        'auth.role_buyer_desc': 'NFTアート作品を購入・収集',
        'auth.role_seller': '販売者',
        'auth.role_seller_desc': 'NFTアート作品を販売・取引',
        'auth.role_artist': 'アーティスト',
        'auth.role_artist_desc': '作品を登録しNFTとしてミント',
        'auth.role_expert': '専門家',
        'auth.role_expert_desc': '作品を評価しETH報酬を獲得',
        'auth.role_expert_reward': '評価ごとに0.01-0.1 ETH報酬',
        'auth.role_museum': '美術館',
        'auth.role_museum_desc': '展覧会を企画し作品をキュレーション',
        'auth.role_gallery': 'ギャラリー',
        'auth.role_gallery_desc': '作品を展示し取引を仲介',
        'auth.forgot_title': 'パスワードをお忘れですか',
        'auth.forgot_desc': '登録されたメールアドレスを入力してください',
        'auth.forgot_info': '入力されたメールアドレスにパスワードリセットリンクが送信されます。',
        'auth.send_reset_link': 'リセットリンクを送信',
        'auth.back_to_login': 'ログインに戻る',
        'auth.reset_title': 'パスワードをリセット',
        'auth.reset_desc': '新しいパスワードを入力してください',
        'auth.new_password': '新しいパスワード',
        'auth.password_min': '最低8文字以上',
        'auth.change_password': 'パスワードを変更',
        
        // Recommendations
        'recommendations.title': 'あなたにおすすめの作品',
        'recommendations.subtitle': 'AIベースの推薦アルゴリズムで好みに合った作品を発見',
        'recommendations.tab_personalized': 'あなたへのおすすめ',
        'recommendations.tab_trending': '急上昇',
        'recommendations.tab_new': '新着作品',
        'recommendations.loading': 'おすすめ作品を分析中...',
        'recommendations.algorithm_name': 'ハイブリッド推薦',
        'recommendations.algorithm_desc': 'あなたの好みと行動パターンを分析して最適な作品を推薦します',
        'recommendations.count_label': 'おすすめ作品',
        'recommendations.empty_title': 'まだおすすめの作品がありません',
        'recommendations.empty_desc': 'ギャラリーを見て、いいねを押して好みを教えてください！',
        'recommendations.view_gallery': 'ギャラリーを見る',
        
        // Buttons
        'btn.buy': '今すぐ購入',
        'btn.bid': '入札',
        'btn.view_more': 'もっと見る',
        'btn.view_all': '全て表示',
        'btn.go_back': '戻る',
        'btn.download': 'ダウンロード',
        'btn.upload': 'アップロード',
        
        // Messages
        'msg.loading': '読み込み中...',
        'msg.success': '成功',
        'msg.error': 'エラーが発生しました',
        'msg.no_data': 'データがありません',
        'msg.coming_soon': '近日公開',
      }
    };
  }

  // ===== Translation Methods =====
  
  t(key, params = {}) {
    // Get translation for current language
    let translation = this.translations[this.currentLanguage]?.[key];
    
    // Fallback to default language
    if (!translation) {
      translation = this.translations[this.fallbackLanguage]?.[key];
    }
    
    // Fallback to key itself
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  }

  // ===== Language Switching =====
  
  setLanguage(lang) {
    if (!this.isLanguageSupported(lang)) {
      console.error(`Language not supported: ${lang}`);
      return false;
    }
    
    this.currentLanguage = lang;
    localStorage.setItem('gallerypia_language', lang);
    
    this.applyLanguage(lang);
    
    // Emit language change event
    document.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
    
    console.log(`🌍 Language changed to: ${lang}`);
    return true;
  }

  applyLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update dir attribute for RTL languages (future: Arabic)
    document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
    
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    
    // Auto-translate all page content (without data-i18n attributes)
    this.translateAllContent();
  }
  
  translateAllContent() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.translateAllContent());
      return;
    }
    
    try {
      // Helper function to safely update text
      const updateText = (selector, key) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el) el.textContent = this.t(key);
        });
      };
      
      // === Hero Section ===
      // Update hero subtitle lines
      const heroSubtitles = document.querySelectorAll('.text-xl.md\\:text-2xl.text-gray-400');
      if (heroSubtitles[0]) {
        const lines = heroSubtitles[0].innerHTML.split('<br');
        if (lines.length >= 2) {
          heroSubtitles[0].innerHTML = this.t('hero.subtitle') + '<br class="hidden sm:block"/>' + this.t('hero.subtitle2');
        }
      }
      
      // === Main Action Buttons ===
      // Update NFT Collection button
      const exploreBtn = document.querySelector('a[href="/gallery"] span.text-white');
      if (exploreBtn) exploreBtn.textContent = this.t('main.explore');
      
      // Update Valuation System button
      const valuationBtn = document.querySelector('a[href="/valuation"] span.text-white');
      if (valuationBtn) valuationBtn.textContent = this.t('main.valuation');
      
      // Update System Guide button
      const guideBtn = document.querySelector('a[href="/valuation-system"]');
      if (guideBtn) {
        const iconEl = guideBtn.querySelector('i');
        const iconHTML = iconEl ? iconEl.outerHTML + ' ' : '';
        guideBtn.innerHTML = iconHTML + this.t('main.system_guide');
      }
      
      // Update Expert Apply button
      const expertBtn = document.querySelector('a[href="/expert/apply"] span.text-white');
      if (expertBtn) expertBtn.textContent = this.t('main.expert_apply');
      
      // Update Partnership text
      const partnershipBtns = document.querySelectorAll('a[href="/signup"].group span.text-white');
      partnershipBtns.forEach(btn => {
        if (btn && btn.textContent === 'Partnership') {
          btn.textContent = this.t('main.partnership');
        }
      });
      
      // Update Partnership subtitle
      const partnershipSub = document.querySelector('a[href="/signup"].group span.text-amber-300');
      if (partnershipSub) partnershipSub.textContent = this.t('main.partnership_sub');
      
      // Update Sign up buttons
      const signupBtns = document.querySelectorAll('a[href="/signup"]:not(.group) span');
      signupBtns.forEach(btn => {
        if (btn) btn.textContent = this.t('main.signup');
      });
      
      // Update Install app button
      const installBtn = document.querySelector('#pwa-install-hero-button span');
      if (installBtn) installBtn.textContent = this.t('main.install');
      
      // Update Mint NFT button
      const mintBtn = document.querySelector('a[href="/mint"] span');
      if (mintBtn) mintBtn.textContent = this.t('main.mint');
      
      // Update Wallet button
      const walletBtn = document.getElementById('walletTextMain');
      if (walletBtn) walletBtn.textContent = this.t('main.wallet');
      
      // === Stats Cards ===
      const statsLabels = document.querySelectorAll('.text-gray-300.font-semibold.text-xs');
      statsLabels.forEach((label, index) => {
        const text = label.textContent.trim();
        if (text.includes('NFT') || text.includes('작품') || text.includes('Artworks')) {
          label.textContent = this.t('main.artworks');
        } else if (text.includes('아티스트') || text.includes('Artists')) {
          label.textContent = this.t('main.artists');
        } else if (text.includes('민팅') || text.includes('Minted')) {
          label.textContent = this.t('main.minted');
        } else if (text.includes('총') || text.includes('가치') || text.includes('Value')) {
          label.textContent = this.t('main.total_value');
        }
      });
      
      // === Features Section ===
      // Update features badge
      const featureBadge = document.querySelector('.text-gradient.font-bold.text-sm');
      if (featureBadge && featureBadge.textContent.includes('혁신')) {
        featureBadge.textContent = this.t('features.badge');
      }
      
      // Update features title
      const featureTitles = document.querySelectorAll('.text-5xl.md\\:text-6xl.font-black span');
      if (featureTitles[0] && featureTitles[0].textContent.includes('플랫폼')) {
        featureTitles[0].textContent = this.t('features.title1');
      }
      if (featureTitles[1] && featureTitles[1].classList.contains('text-gradient')) {
        featureTitles[1].textContent = this.t('features.title2');
      }
      
      // Update features subtitle
      const featureSubtitle = document.querySelector('.text-xl.text-gray-400.max-w-3xl');
      if (featureSubtitle && featureSubtitle.innerHTML.includes('AI 기반')) {
        featureSubtitle.innerHTML = this.t('features.subtitle1') + '<br/>' + this.t('features.subtitle2');
      }
      
      // Update Feature 1: AI Authentication
      const feature1Title = document.querySelectorAll('.text-2xl.font-bold.text-white')[0];
      if (feature1Title && feature1Title.textContent.includes('진위')) {
        feature1Title.textContent = this.t('feature1.title');
      }
      
      const feature1Desc = document.querySelectorAll('.text-gray-400.mb-6.leading-relaxed')[0];
      if (feature1Desc && feature1Desc.textContent.includes('딥러닝')) {
        feature1Desc.textContent = this.t('feature1.desc');
      }
      
      const feature1Items = document.querySelectorAll('.text-sm.text-gray-300 span');
      if (feature1Items[0] && feature1Items[0].textContent.includes('위조품')) {
        feature1Items[0].textContent = this.t('feature1.item1');
      }
      if (feature1Items[1] && feature1Items[1].textContent.includes('블록체인')) {
        feature1Items[1].textContent = this.t('feature1.item2');
      }
      if (feature1Items[2] && feature1Items[2].textContent.includes('전문가')) {
        feature1Items[2].textContent = this.t('feature1.item3');
      }
      
      // Update Feature 2: Auto Royalty
      const feature2Title = document.querySelectorAll('.text-2xl.font-bold.text-white')[1];
      if (feature2Title && feature2Title.textContent.includes('로열티')) {
        feature2Title.textContent = this.t('feature2.title');
      }
      
      const feature2Desc = document.querySelectorAll('.text-gray-400.mb-6.leading-relaxed')[1];
      if (feature2Desc && feature2Desc.textContent.includes('스마트')) {
        feature2Desc.textContent = this.t('feature2.desc');
      }
      
      if (feature1Items[3] && feature1Items[3].textContent.includes('저작권')) {
        feature1Items[3].textContent = this.t('feature2.item1');
      }
      if (feature1Items[4] && feature1Items[4].textContent.includes('정산')) {
        feature1Items[4].textContent = this.t('feature2.item2');
      }
      if (feature1Items[5] && feature1Items[5].textContent.includes('투명')) {
        feature1Items[5].textContent = this.t('feature2.item3');
      }
      
      // Update Feature 3: Global Partnership
      const feature3Title = document.querySelectorAll('.text-2xl.font-bold.text-white')[2];
      if (feature3Title && feature3Title.textContent.includes('파트너십')) {
        feature3Title.textContent = this.t('feature3.title');
      }
      
      const feature3Desc = document.querySelectorAll('.text-gray-400.mb-6.leading-relaxed')[2];
      if (feature3Desc && feature3Desc.textContent.includes('미술관')) {
        feature3Desc.textContent = this.t('feature3.desc');
      }
      
      if (feature1Items[6] && feature1Items[6].textContent.includes('검증된')) {
        feature1Items[6].textContent = this.t('feature3.item1');
      }
      if (feature1Items[7] && feature1Items[7].textContent.includes('큐레이터')) {
        feature1Items[7].textContent = this.t('feature3.item2');
      }
      if (feature1Items[8] && feature1Items[8].textContent.includes('마켓')) {
        feature1Items[8].textContent = this.t('feature3.item3');
      }
      
      // Update "Learn More" links
      const learnMoreLinks = document.querySelectorAll('.text-purple-400.hover\\:text-purple-300.font-semibold');
      learnMoreLinks.forEach(link => {
        if (link.textContent.includes('자세히')) {
          link.textContent = this.t('feature1.link');
        }
      });
      
      // === Search Section ===
      const searchInput = document.querySelector('input[placeholder*="작품"]');
      if (searchInput) searchInput.placeholder = this.t('search.placeholder');
      
      const voiceButton = document.querySelector('button[title*="음성"]');
      if (voiceButton) voiceButton.title = this.t('search.voice');
      
      const aiSearchButton = document.querySelector('button[title*="AI"]');
      if (aiSearchButton) aiSearchButton.title = this.t('search.ai');
      
      // === Quick Categories ===
      updateText('a[href*="/gallery?category=painting"]', 'category.painting');
      updateText('a[href*="/gallery?category=digital"]', 'category.digital');
      updateText('a[href*="/gallery?category=photo"]', 'category.photo');
      updateText('a[href*="/gallery?category=sculpture"]', 'category.sculpture');
      
      // === VR Gallery ===
      const vrTour = document.querySelector('.text-white.font-bold');
      if (vrTour && vrTour.textContent.includes('VR')) {
        vrTour.textContent = this.t('vr.tour');
      }
      const vrExperience = document.querySelector('.text-gray-400');
      if (vrExperience && vrExperience.textContent.includes('360')) {
        vrExperience.textContent = this.t('vr.experience');
      }
      updateText('a[href="/gallery"] span.text-white', 'vr.goGallery');
      
      // === Innovation Features Section (3대 신기능) ===
      const innovationBadge = document.querySelector('.text-gradient');
      if (innovationBadge && innovationBadge.textContent.includes('3대')) {
        innovationBadge.textContent = this.t('innovation.badge');
      }
      const innovationTitle = document.querySelector('.text-4xl');
      if (innovationTitle && innovationTitle.textContent.includes('혁신')) {
        innovationTitle.textContent = this.t('innovation.title');
      }
      const innovationSubtitle = document.querySelector('.text-xl.text-gray-400');
      if (innovationSubtitle && innovationSubtitle.textContent.includes('AI 기반')) {
        innovationSubtitle.textContent = this.t('innovation.subtitle');
      }
      
      // === AI Verification Feature ===
      const aiFeatureTitle = document.querySelector('.text-2xl');
      if (aiFeatureTitle && aiFeatureTitle.textContent.includes('AI 진위')) {
        aiFeatureTitle.textContent = this.t('feature.ai.title');
      }
      const aiFeatureDesc = document.querySelector('.text-gray-400.leading-relaxed');
      if (aiFeatureDesc && aiFeatureDesc.textContent.includes('딥러닝')) {
        aiFeatureDesc.textContent = this.t('feature.ai.desc');
      }
      const aiFeatureItems = document.querySelectorAll('.text-sm.text-gray-300');
      if (aiFeatureItems[0] && aiFeatureItems[0].textContent.includes('위조품')) {
        aiFeatureItems[0].textContent = this.t('feature.ai.item1');
      }
      if (aiFeatureItems[1] && aiFeatureItems[1].textContent.includes('블록체인')) {
        aiFeatureItems[1].textContent = this.t('feature.ai.item2');
      }
      if (aiFeatureItems[2] && aiFeatureItems[2].textContent.includes('전문가')) {
        aiFeatureItems[2].textContent = this.t('feature.ai.item3');
      }
      const aiFeatureLink = document.querySelector('a[href*="/verification"]');
      if (aiFeatureLink) aiFeatureLink.textContent = this.t('feature.ai.link');
      
      // === Auto Royalty Feature ===
      const royaltyTitle = document.querySelectorAll('.text-2xl')[1];
      if (royaltyTitle && royaltyTitle.textContent.includes('로열티')) {
        royaltyTitle.textContent = this.t('feature.royalty.title');
      }
      const royaltyDesc = document.querySelectorAll('.text-gray-400.leading-relaxed')[1];
      if (royaltyDesc && royaltyDesc.textContent.includes('스마트')) {
        royaltyDesc.textContent = this.t('feature.royalty.desc');
      }
      
      // === Global Partnership Feature ===
      const partnershipTitle = document.querySelectorAll('.text-2xl')[2];
      if (partnershipTitle && partnershipTitle.textContent.includes('파트너십')) {
        partnershipTitle.textContent = this.t('feature.partnership.title');
      }
      const partnershipDesc = document.querySelectorAll('.text-gray-400.leading-relaxed')[2];
      if (partnershipDesc && partnershipDesc.textContent.includes('미술관')) {
        partnershipDesc.textContent = this.t('feature.partnership.desc');
      }
      
      // === Artwork Sections ===
      const artworkSectionTitles = document.querySelectorAll('h2.text-3xl.font-bold');
      artworkSectionTitles.forEach(title => {
        if (title.textContent.includes('추천 작품')) {
          title.textContent = this.t('section.recommended');
        } else if (title.textContent.includes('인기 작품')) {
          title.textContent = this.t('section.popular');
        } else if (title.textContent.includes('신규 작품')) {
          title.textContent = this.t('section.new');
        }
      });
      
      const noRecommended = document.querySelector('.text-center.text-gray-400');
      if (noRecommended && noRecommended.textContent.includes('추천 작품이 없습니다')) {
        noRecommended.textContent = this.t('section.recommendedDesc');
      }
      const noPopular = document.querySelectorAll('.text-center.text-gray-400')[1];
      if (noPopular && noPopular.textContent.includes('인기 작품이 없습니다')) {
        noPopular.textContent = this.t('section.popularDesc');
      }
      
      // === AI Recommendations ===
      const aiRecommendations = document.querySelector('.text-2xl.font-bold');
      if (aiRecommendations && aiRecommendations.textContent.includes('AI RECOMMENDATIONS')) {
        aiRecommendations.textContent = this.t('ai.recommendations');
      }
      const aiForYou = document.querySelector('.text-xl');
      if (aiForYou && aiForYou.textContent.includes('당신을 위한')) {
        aiForYou.textContent = this.t('ai.forYou');
      }
      const aiAnalyzing = document.querySelector('.text-gray-400');
      if (aiAnalyzing && aiAnalyzing.textContent.includes('분석하는 중')) {
        aiAnalyzing.textContent = this.t('ai.analyzing');
      }
      
      // === Artwork Card ===
      const estimatedValue = document.querySelectorAll('.text-xs.text-gray-400');
      estimatedValue.forEach(el => {
        if (el.textContent.includes('산정가')) {
          el.textContent = this.t('card.estimatedValue');
        }
      });
      
      // === Auction Section ===
      const auctionInfo = document.querySelector('.text-center');
      if (auctionInfo && auctionInfo.textContent.includes('경매 정보')) {
        auctionInfo.textContent = this.t('auction.info');
      }
      const auctionEnded = document.querySelector('.badge');
      if (auctionEnded && auctionEnded.textContent.includes('경매 종료')) {
        auctionEnded.textContent = this.t('auction.ended');
      }
      
      // === Valuation System ===
      const valuationTitle = document.querySelector('.text-3xl.font-bold');
      if (valuationTitle && valuationTitle.textContent.includes('작품분석')) {
        valuationTitle.textContent = this.t('valuation.title');
      }
      const valuationSubtitle = document.querySelector('.text-gray-400');
      if (valuationSubtitle && valuationSubtitle.textContent.includes('평가 완료 후')) {
        valuationSubtitle.textContent = this.t('valuation.subtitle');
      }
      
      // === Upload Section ===
      const uploadTitle = document.querySelector('.text-2xl.font-bold');
      if (uploadTitle && uploadTitle.textContent.includes('NFT 작품 업로드')) {
        uploadTitle.textContent = this.t('upload.title');
      }
      const uploadSubtitle = document.querySelector('.text-gray-400');
      if (uploadSubtitle && uploadSubtitle.textContent.includes('작품을 업로드하고')) {
        uploadSubtitle.textContent = this.t('upload.subtitle');
      }
      const uploadDragDrop = document.querySelector('.text-center.text-gray-400');
      if (uploadDragDrop && uploadDragDrop.textContent.includes('드래그')) {
        uploadDragDrop.textContent = this.t('upload.dragDrop');
      }
      
      // === Common Navigation & UI Elements (All Pages) ===
      // Language Selection
      const langSelection = document.querySelector('h3.text-sm');
      if (langSelection && langSelection.textContent.includes('언어 선택')) {
        langSelection.textContent = this.t('nav.language_selection');
      }
      
      // Notifications
      const notifications = document.querySelectorAll('h3.text-lg');
      notifications.forEach(el => {
        if (el.textContent.includes('알림')) {
          el.textContent = this.t('nav.notifications');
        }
      });
      
      // Loading notifications
      document.querySelectorAll('.text-center').forEach(el => {
        if (el.textContent.includes('알림을 불러오는 중')) {
          el.textContent = this.t('nav.loading_notifications');
        } else if (el.textContent.includes('새로운 알림이 없습니다')) {
          el.textContent = this.t('nav.no_notifications');
        }
      });
      
      // Main Navigation - translate ALL navigation items
      const navLinks = document.querySelectorAll('nav a, header a');
      navLinks.forEach(link => {
        const text = link.textContent.trim();
        // Map Korean text to translation keys
        const navMap = {
          '갤러리': 'nav.gallery',
          '추천': 'nav.recommendations',
          '아티스트': 'nav.artists',
          '가치산정': 'valuation.title',
          '큐레이션': 'nav.curation',
          '아카데미': 'nav.academy',
          '소개': 'nav.about',
          '회원가입': 'auth.signup',
          '로그인': 'auth.login',
          '로그아웃': 'auth.logout',
          '사용자': 'nav.user',
          '대시보드': 'mypage.dashboard',
          '프로필': 'mypage.profile',
          '설정': 'mypage.settings',
          '튜토리얼 다시보기': 'nav.tutorial_replay',
          '지갑연결': 'nav.wallet_connect'
        };
        
        if (navMap[text]) {
          link.textContent = this.t(navMap[text]);
        }
      });
      
      // Gallery Page - Category Tabs
      const categoryButtons = document.querySelectorAll('button, a');
      categoryButtons.forEach(btn => {
        const text = btn.textContent.trim();
        const categoryMap = {
          '전체': 'gallery.all',
          '회화': 'gallery.painting',
          '조각': 'gallery.sculpture',
          '사진': 'gallery.photo',
          '디지털아트': 'gallery.digital',
          '혼합매체': 'gallery.mixed',
          '설치미술': 'gallery.installation',
          '공예': 'gallery.craft',
          '디자인': 'gallery.design',
          '판화': 'gallery.print',
          '미디어아트': 'gallery.media'
        };
        
        if (categoryMap[text]) {
          btn.textContent = this.t(categoryMap[text]);
        }
      });
      
      // Common Buttons - translate button texts
      document.querySelectorAll('button, a.btn, .button').forEach(btn => {
        const text = btn.textContent.trim();
        const buttonMap = {
          '닫기': 'common.close',
          '제출': 'common.submit',
          '초기화': 'common.reset',
          '필터': 'common.filter',
          '정렬': 'common.sort',
          '적용': 'common.apply',
          '지우기': 'common.clear',
          '구매하기': 'btn.buy',
          '입찰하기': 'btn.bid',
          '더 보기': 'btn.view_more',
          '전체 보기': 'btn.view_all',
          '뒤로 가기': 'btn.go_back',
          '다운로드': 'btn.download',
          '업로드': 'btn.upload'
        };
        
        if (buttonMap[text]) {
          btn.textContent = this.t(buttonMap[text]);
        }
      });
      
      // Search inputs - translate placeholders
      document.querySelectorAll('input[type="search"], input[type="text"]').forEach(input => {
        const placeholder = input.placeholder;
        if (placeholder.includes('작품명') || placeholder.includes('작가명')) {
          input.placeholder = this.t('gallery.search_placeholder');
        } else if (placeholder.includes('검색')) {
          input.placeholder = this.t('search.title');
        }
      });
      
      // Page-specific content
      const pageTitle = document.title;
      
      // Gallery Page specific
      if (pageTitle.includes('Gallery') || window.location.pathname.includes('/gallery')) {
        document.querySelectorAll('.text-sm, .text-xs').forEach(el => {
          const text = el.textContent.trim();
          if (text.includes('조회') && !text.includes('수')) {
            el.textContent = this.t('artwork.views');
          } else if (text.includes('좋아요')) {
            el.textContent = this.t('artwork.likes');
          } else if (text.includes('산정가')) {
            el.textContent = this.t('artwork.estimated_price');
          }
        });
      }
      
      // Messages
      document.querySelectorAll('.text-center, .text-gray-400, .text-gray-500').forEach(el => {
        const text = el.textContent.trim();
        const messageMap = {
          '로딩 중...': 'msg.loading',
          '로드 중...': 'msg.loading',
          '불러오는 중...': 'msg.loading',
          '성공했습니다': 'msg.success',
          '오류가 발생했습니다': 'msg.error',
          '데이터가 없습니다': 'msg.no_data',
          '곧 출시됩니다': 'msg.coming_soon'
        };
        
        if (messageMap[text]) {
          el.textContent = this.t(messageMap[text]);
        }
      });
      
      // === Additional Text Replacement for Server-Rendered Content ===
      // Replace ALL text nodes containing Korean text
      const replaceTextInElement = (element, searchText, replaceText) => {
        if (element.childNodes) {
          element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(searchText)) {
              node.textContent = node.textContent.replace(searchText, replaceText);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              replaceTextInElement(node, searchText, replaceText);
            }
          });
        }
      };
      
      // Comprehensive text replacement map
      const textReplacements = {
        // Gallery Page
        '가격 높은순': this.t('gallery.sort_price_high'),
        '가격 낮은순': this.t('gallery.sort_price_low'),
        '최신순': this.t('gallery.sort_latest'),
        '인기순': this.t('gallery.sort_popular'),
        '검색 결과가 없습니다': this.t('gallery.no_results'),
        '데이터를 불러오는데 실패했습니다': this.t('msg.error'),
        '등록된 컬렉션이 없습니다': this.t('msg.no_data'),
        
        // Common UI
        '메인 콘텐츠로 바로가기': this.t('nav.skip_to_content'),
        '사용자': this.t('nav.user'),
        '대시보드': this.t('mypage.dashboard'),
        '로그아웃': this.t('auth.logout'),
        '로그인': this.t('auth.login'),
        '회원가입': this.t('auth.signup'),
        '검색': this.t('search.title'),
        '갤러리': this.t('nav.gallery'),
        '추천': this.t('nav.recommendations'),
        '아티스트': this.t('nav.artists'),
        '가치산정': this.t('valuation.title'),
        '소개': this.t('nav.about'),
        '도움말': this.t('support.help'),
        '문의하기': this.t('support.contact'),
        '갤러리로 이동': this.t('vr.goGallery'),
        
        // Login Page
        '갤러리피아에 오신 것을 환영합니다': this.t('nav.home'),
        '또는 이메일로 로그인': this.t('auth.login'),
        '로그인 상태 유지': 'Remember me',
        '비밀번호 찾기': this.t('auth.forgot_password'),
        
        // Categories
        '디지털아트': this.t('gallery.digital'),
        '사진': this.t('gallery.photo'),
        '회화': this.t('gallery.painting'),
        '조각': this.t('gallery.sculpture'),
        '혼합매체': this.t('gallery.mixed'),
        '공예': this.t('gallery.craft'),
        '판화': this.t('gallery.print'),
        '설치미술': this.t('gallery.installation'),
        '디자인': this.t('gallery.design'),
        '미디어아트': this.t('gallery.media'),
        '전체': this.t('gallery.all'),
        
        // Messages
        '새로운 알림이 없습니다': this.t('nav.no_notifications'),
        '알림을 불러오는 중': this.t('nav.loading_notifications'),
        
        // Buttons
        '리셋': this.t('common.reset'),
        '닫기': this.t('common.close'),
        
        // Footer
        '개인정보보호': this.t('footer.privacy'),
        '가치산정 시스템': this.t('valuation.system_title'),
        
        // Accessibility
        '키보드 단축키': 'Keyboard Shortcuts',
        '접근성': 'Accessibility',
        '단축키 도움말': 'Shortcut Help',
        '링크/버튼 활성화': 'Activate Link/Button',
        '모달/메뉴 닫기': 'Close Modal/Menu',
        '사이트 이용하기': 'Navigate Site',
        '배경음악': 'Background Music',
        
        // Mobile
        '모바일 기기로 QR 코드를 스캔하세요': 'Scan QR code with mobile device',
        '모바일 기기에서 카메라를 통해 실제 공간에 작품을 배치해보세요': 'Place artwork in real space through camera on mobile device',
        '모바일에서 직접 열기': 'Open directly on mobile',
        
        // Misc
        '새로운 버전이 있습니다': 'New version available',
        '미민팅': 'Unminted',
        '산정가': this.t('artwork.estimated_price'),
        '액션': 'Actions'
      };
      
      // Apply all text replacements
      Object.keys(textReplacements).forEach(searchText => {
        replaceTextInElement(document.body, searchText, textReplacements[searchText]);
      });
      
      console.log('✅ All main page content translated');
    } catch (error) {
      console.warn('Translation warning:', error);
    }
  }

  isRTL(lang) {
    return ['ar', 'he', 'fa'].includes(lang);
  }

  // ===== Formatting Methods =====
  
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
  }

  formatCurrency(amount, currency = 'KRW') {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(
      this.currentLanguage,
      { ...defaultOptions, ...options }
    ).format(new Date(date));
  }

  formatRelativeTime(date) {
    const now = Date.now();
    const diff = new Date(date).getTime() - now;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    
    if (Math.abs(days) > 0) return rtf.format(days, 'day');
    if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
    if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
    return rtf.format(seconds, 'second');
  }

  // ===== Language Info =====
  
  getLanguageInfo() {
    const languages = {
      ko: { name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
      en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
      zh: { name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
      ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
    };
    
    return languages[this.currentLanguage] || languages.ko;
  }

  getAllLanguages() {
    return [
      { code: 'ko', name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
    ];
  }
}

// Initialize on page load
let i18n;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18n = new I18n();
    window.i18n = i18n;
  });
} else {
  i18n = new I18n();
  window.i18n = i18n;
}
