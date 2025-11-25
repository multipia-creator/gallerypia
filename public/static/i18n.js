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
        'rec.for_you': '당신을 위한 추천',
        'rec.similar': '유사한 작품',
        'rec.trending': '인기 작품',
        'rec.algorithm': '추천 알고리즘',
        'rec.confidence': '신뢰도',
        
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
