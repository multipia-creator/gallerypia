/**
 * GalleryPia - Share Buttons Component
 * 
 * TypeScript component for social media sharing
 * Server-side rendering support with Cloudflare Pages
 * 
 * Features:
 * - Multiple social platforms (Twitter, Facebook, LinkedIn, etc.)
 * - Copy link functionality
 * - QR code generation
 * - Share count tracking
 * - Custom share messages
 * - Email sharing
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

export interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  platforms?: SharePlatform[];
}

export type SharePlatform = 
  | 'twitter' 
  | 'facebook' 
  | 'linkedin' 
  | 'pinterest' 
  | 'reddit' 
  | 'telegram'
  | 'whatsapp'
  | 'email'
  | 'copy';

const DEFAULT_PLATFORMS: SharePlatform[] = [
  'twitter',
  'facebook',
  'linkedin',
  'copy'
];

/**
 * Render share buttons component
 */
export function renderShareButtons(props: ShareButtonsProps): string {
  const {
    url,
    title,
    description = '',
    image = '',
    hashtags = [],
    layout = 'horizontal',
    showLabels = true,
    platforms = DEFAULT_PLATFORMS
  } = props;

  const layoutClass = 
    layout === 'horizontal' ? 'flex flex-row gap-2' :
    layout === 'vertical' ? 'flex flex-col gap-2' :
    'grid grid-cols-2 gap-2';

  return `
    <div class="share-buttons ${layoutClass}" data-share-url="${url}" data-share-title="${title}">
      ${platforms.map(platform => renderShareButton(platform, { url, title, description, image, hashtags, showLabels })).join('')}
    </div>
  `;
}

/**
 * Render individual share button
 */
function renderShareButton(
  platform: SharePlatform,
  options: { url: string; title: string; description: string; image: string; hashtags: string[]; showLabels: boolean }
): string {
  const { url, title, description, image, hashtags, showLabels } = options;
  
  const configs: Record<SharePlatform, {
    icon: string;
    label: string;
    color: string;
    hoverColor: string;
  }> = {
    twitter: {
      icon: 'fa-brands fa-twitter',
      label: 'Twitter',
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600'
    },
    facebook: {
      icon: 'fa-brands fa-facebook-f',
      label: 'Facebook',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    linkedin: {
      icon: 'fa-brands fa-linkedin-in',
      label: 'LinkedIn',
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800'
    },
    pinterest: {
      icon: 'fa-brands fa-pinterest-p',
      label: 'Pinterest',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    },
    reddit: {
      icon: 'fa-brands fa-reddit-alien',
      label: 'Reddit',
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    },
    telegram: {
      icon: 'fa-brands fa-telegram',
      label: 'Telegram',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600'
    },
    whatsapp: {
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    email: {
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700'
    },
    copy: {
      icon: 'fa-solid fa-link',
      label: '링크 복사',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    }
  };

  const config = configs[platform];
  
  return `
    <button
      class="share-button share-${platform} ${config.color} ${config.hoverColor} text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showLabels ? '' : 'justify-center'}"
      onclick="shareContent('${platform}', '${encodeURIComponent(url)}', '${encodeURIComponent(title)}', '${encodeURIComponent(description)}', '${encodeURIComponent(image)}', ${JSON.stringify(hashtags)})"
      aria-label="${config.label}에 공유"
    >
      <i class="${config.icon}"></i>
      ${showLabels ? `<span>${config.label}</span>` : ''}
    </button>
  `;
}

/**
 * Render compact share buttons (icon only)
 */
export function renderCompactShareButtons(props: ShareButtonsProps): string {
  return renderShareButtons({
    ...props,
    showLabels: false,
    layout: 'horizontal'
  });
}

/**
 * Render share modal
 */
export function renderShareModal(props: ShareButtonsProps): string {
  const { url, title, description = '' } = props;
  
  return `
    <div class="share-modal fixed inset-0 bg-black/50 flex items-center justify-center z-[100] hidden" id="share-modal">
      <div class="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">
            <i class="fas fa-share-alt mr-2 text-purple-500"></i>
            공유하기
          </h3>
          <button onclick="closeShareModal()" class="text-gray-400 hover:text-white text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-300 text-sm mb-2">${title}</p>
          ${description ? `<p class="text-gray-500 text-xs">${description}</p>` : ''}
        </div>
        
        ${renderShareButtons({
          ...props,
          layout: 'grid',
          showLabels: true
        })}
        
        <div class="mt-6 pt-6 border-t border-gray-700">
          <label class="block text-gray-300 text-sm mb-2">링크 주소</label>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              value="${url}" 
              readonly 
              class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
              id="share-url-input"
            />
            <button 
              onclick="copyShareLink()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="링크 복사"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div class="mt-4">
          <button 
            onclick="generateQRCode('${url}')"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <i class="fas fa-qrcode"></i>
            <span>QR 코드 생성</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render floating share button
 */
export function renderFloatingShareButton(props: ShareButtonsProps): string {
  return `
    <button
      onclick="openShareModal()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
      aria-label="공유하기"
    >
      <i class="fas fa-share-alt text-xl"></i>
    </button>
    
    ${renderShareModal(props)}
  `;
}

/**
 * Render share count
 */
export function renderShareCount(count: number): string {
  if (count === 0) return '';
  
  return `
    <span class="share-count text-gray-400 text-sm ml-2">
      <i class="fas fa-share mr-1"></i>
      ${count > 1000 ? `${(count / 1000).toFixed(1)}K` : count}회 공유됨
    </span>
  `;
}

/**
 * Render artwork share card (Open Graph preview)
 */
export function renderArtworkShareCard(artwork: {
  id: number;
  title: string;
  artist_name: string;
  image_url: string;
  price_krw: number;
}): string {
  const url = `https://gallerypia.pages.dev/artwork/${artwork.id}`;
  const description = `${artwork.artist_name}의 작품 "${artwork.title}" - ${(artwork.price_krw / 10000).toFixed(0)}만원`;
  
  return `
    <div class="share-card bg-gray-800 rounded-xl overflow-hidden">
      <img 
        src="${artwork.image_url}" 
        alt="${artwork.title}"
        class="w-full h-48 object-cover"
      />
      <div class="p-4">
        <h4 class="text-white font-bold mb-2">${artwork.title}</h4>
        <p class="text-gray-400 text-sm mb-4">${description}</p>
        
        ${renderShareButtons({
          url,
          title: artwork.title,
          description,
          image: artwork.image_url,
          hashtags: ['NFT', 'Art', 'GalleryPia'],
          layout: 'horizontal',
          showLabels: false
        })}
      </div>
    </div>
  `;
}
