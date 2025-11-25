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
        
        // Main Page
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
        'main.artworks': 'NFT 작품',
        'main.artists': '아티스트',
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
        
        // Main Page
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
        'main.artworks': 'NFT Artworks',
        'main.artists': 'Artists',
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
        
        // Main Page
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
        'main.artworks': 'NFT作品',
        'main.artists': '艺术家',
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
        
        // Main Page
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
        'main.artworks': 'NFT作品',
        'main.artists': 'アーティスト',
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
