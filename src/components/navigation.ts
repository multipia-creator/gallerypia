/**
 * GalleryPia v9.0 - Unified Navigation Component
 * 
 * Purpose: Consistent navigation with authentication state awareness
 * Features: Desktop/mobile responsive, user menu, active states
 */

export interface NavigationProps {
  currentPath: string
  user?: {
    id: number
    name: string
    email: string
    role: string
    profile_image?: string
  }
}

export function renderNavigation(props: NavigationProps): string {
  const { currentPath, user } = props
  const isAuthenticated = !!user

  return `
    <!-- Skip Navigation for Accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black">
      Skip to main content
    </a>

    <!-- Main Navigation -->
    <nav class="nav-container" role="navigation" aria-label="Main navigation">
      <div class="nav-wrapper">
        
        <!-- Logo -->
        <div class="nav-logo">
          <a href="/" class="logo-link" aria-label="GalleryPia Home">
            <img src="/static/logo.png" alt="GalleryPia" class="logo-image">
            <span class="logo-text">갤러리피아</span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-links desktop-only" id="nav-menu">
          ${renderNavLinks(currentPath, isAuthenticated)}
        </div>

        <!-- Right Section -->
        <div class="nav-actions">
          ${isAuthenticated ? renderUserMenu(user!) : renderAuthButtons()}
          
          <!-- Mobile Menu Toggle -->
          <button 
            class="mobile-menu-toggle mobile-only" 
            id="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
            aria-expanded="false"
            aria-controls="mobile-nav">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="mobile-nav hidden" id="mobile-nav" aria-hidden="true">
        ${renderNavLinks(currentPath, isAuthenticated, true)}
        ${isAuthenticated ? renderMobileUserMenu(user!) : renderMobileAuthButtons()}
      </div>
    </nav>

    <style>
      /* Navigation Styles */
      .nav-container {
        background: var(--nav-bg, #1f2937);
        border-bottom: 1px solid var(--border-color, #374151);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .nav-wrapper {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
      }

      .nav-logo {
        display: flex;
        align-items: center;
      }

      .logo-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: white;
        transition: opacity 0.2s;
      }

      .logo-link:hover {
        opacity: 0.8;
      }

      .logo-link:focus {
        outline: 2px solid var(--focus-color, #3b82f6);
        outline-offset: 2px;
        border-radius: 4px;
      }

      .logo-image {
        height: 32px;
        width: auto;
      }

      .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex: 1;
      }

      .nav-link {
        color: var(--text-secondary, #9ca3af);
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        transition: all 0.2s;
        font-weight: 500;
      }

      .nav-link:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
      }

      .nav-link:focus {
        outline: 2px solid var(--focus-color, #3b82f6);
        outline-offset: 2px;
      }

      .nav-link.active {
        color: var(--primary-color, #3b82f6);
        background: rgba(59, 130, 246, 0.1);
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      /* User Menu Dropdown */
      .user-menu {
        position: relative;
      }

      .user-menu-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        color: white;
        transition: background 0.2s;
      }

      .user-menu-trigger:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-menu-trigger:focus {
        outline: 2px solid var(--focus-color, #3b82f6);
        outline-offset: 2px;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--border-color, #374151);
      }

      .user-menu-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        min-width: 200px;
        background: var(--dropdown-bg, #374151);
        border: 1px solid var(--border-color, #4b5563);
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s;
        z-index: 50;
      }

      .user-menu-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .user-menu-item {
        display: block;
        padding: 0.75rem 1rem;
        color: var(--text-primary, #f3f4f6);
        text-decoration: none;
        transition: background 0.2s;
        border-bottom: 1px solid var(--border-color, #4b5563);
      }

      .user-menu-item:last-child {
        border-bottom: none;
      }

      .user-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-menu-item:focus {
        background: rgba(255, 255, 255, 0.15);
        outline: none;
      }

      .user-menu-item.danger {
        color: var(--danger-color, #ef4444);
      }

      .user-menu-item.danger:hover {
        background: rgba(239, 68, 68, 0.1);
      }

      /* Mobile Styles */
      .mobile-menu-toggle {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.375rem;
        transition: background 0.2s;
      }

      .mobile-menu-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .mobile-menu-toggle:focus {
        outline: 2px solid var(--focus-color, #3b82f6);
        outline-offset: 2px;
      }

      .mobile-nav {
        padding: 1rem 1.5rem;
        background: var(--nav-bg-mobile, #111827);
        border-top: 1px solid var(--border-color, #374151);
      }

      .mobile-nav.hidden {
        display: none;
      }

      .mobile-nav .nav-link {
        display: block;
        padding: 0.75rem 0;
      }

      /* Responsive */
      .desktop-only {
        display: flex;
      }

      .mobile-only {
        display: none;
      }

      @media (max-width: 768px) {
        .desktop-only {
          display: none;
        }

        .mobile-only {
          display: block;
        }

        .nav-wrapper {
          padding: 1rem;
        }
      }

      /* Screen Reader Only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    </style>

    <script>
      // Mobile menu toggle
      document.getElementById('mobile-menu-toggle')?.addEventListener('click', function() {
        const mobileNav = document.getElementById('mobile-nav');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        mobileNav.classList.toggle('hidden');
        mobileNav.setAttribute('aria-hidden', isExpanded);
      });

      // User menu dropdown toggle
      document.getElementById('user-menu-trigger')?.addEventListener('click', function() {
        const dropdown = document.getElementById('user-menu-dropdown');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        dropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(event.target)) {
          const trigger = document.getElementById('user-menu-trigger');
          const dropdown = document.getElementById('user-menu-dropdown');
          if (trigger && dropdown) {
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('active');
          }
        }
      });

      // Keyboard navigation for user menu
      document.getElementById('user-menu-trigger')?.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          const dropdown = document.getElementById('user-menu-dropdown');
          this.setAttribute('aria-expanded', 'false');
          dropdown.classList.remove('active');
          this.focus();
        }
      });
    </script>
  `
}

function renderNavLinks(currentPath: string, isAuthenticated: boolean, isMobile: boolean = false): string {
  const links = [
    { href: '/', label: '홈', icon: 'fas fa-home' },
    { href: '/gallery', label: '갤러리', icon: 'fas fa-images' },
    { href: '/artists', label: '아티스트', icon: 'fas fa-palette' },
    { href: '/valuation-system', label: '가치산정', icon: 'fas fa-chart-line' },
    ...(isAuthenticated ? [
      { href: '/mint', label: 'NFT 발행', icon: 'fas fa-plus-circle' },
      { href: '/dashboard', label: '대시보드', icon: 'fas fa-tachometer-alt' },
    ] : []),
  ]

  return links.map(link => `
    <a 
      href="${link.href}" 
      class="nav-link ${currentPath === link.href ? 'active' : ''}"
      aria-current="${currentPath === link.href ? 'page' : undefined}">
      ${isMobile ? `<i class="${link.icon}" aria-hidden="true"></i> ` : ''}
      ${link.label}
    </a>
  `).join('')
}

function renderUserMenu(user: NonNullable<NavigationProps['user']>): string {
  return `
    <div class="user-menu">
      <button 
        id="user-menu-trigger"
        class="user-menu-trigger"
        aria-label="User menu"
        aria-expanded="false"
        aria-haspopup="true">
        <img 
          src="${user.profile_image || '/static/default-avatar.png'}" 
          alt="${user.name}"
          class="user-avatar">
        <span class="desktop-only">${user.name}</span>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
      </button>

      <div 
        id="user-menu-dropdown"
        class="user-menu-dropdown"
        role="menu"
        aria-labelledby="user-menu-trigger">
        <a href="/profile" class="user-menu-item" role="menuitem">
          <i class="fas fa-user" aria-hidden="true"></i> 프로필
        </a>
        <a href="/settings" class="user-menu-item" role="menuitem">
          <i class="fas fa-cog" aria-hidden="true"></i> 설정
        </a>
        <a href="/my-collection" class="user-menu-item" role="menuitem">
          <i class="fas fa-images" aria-hidden="true"></i> 내 컬렉션
        </a>
        <a href="/logout" class="user-menu-item danger" role="menuitem">
          <i class="fas fa-sign-out-alt" aria-hidden="true"></i> 로그아웃
        </a>
      </div>
    </div>
  `
}

function renderAuthButtons(): string {
  return `
    <a href="/login" class="btn btn-secondary">
      <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
      <span>로그인</span>
    </a>
    <a href="/signup" class="btn btn-primary">
      <i class="fas fa-user-plus" aria-hidden="true"></i>
      <span>회원가입</span>
    </a>
  `
}

function renderMobileUserMenu(user: NonNullable<NavigationProps['user']>): string {
  return `
    <div class="mobile-user-menu" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color, #374151);">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
        <img 
          src="${user.profile_image || '/static/default-avatar.png'}" 
          alt="${user.name}"
          class="user-avatar">
        <div>
          <div style="color: white; font-weight: 600;">${user.name}</div>
          <div style="color: var(--text-secondary, #9ca3af); font-size: 0.875rem;">${user.email}</div>
        </div>
      </div>
      <a href="/profile" class="nav-link">프로필</a>
      <a href="/settings" class="nav-link">설정</a>
      <a href="/my-collection" class="nav-link">내 컬렉션</a>
      <a href="/logout" class="nav-link" style="color: var(--danger-color, #ef4444);">로그아웃</a>
    </div>
  `
}

function renderMobileAuthButtons(): string {
  return `
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color, #374151); display: flex; flex-direction: column; gap: 0.5rem;">
      <a href="/login" class="btn btn-secondary" style="width: 100%; text-align: center;">로그인</a>
      <a href="/signup" class="btn btn-primary" style="width: 100%; text-align: center;">회원가입</a>
    </div>
  `
}
