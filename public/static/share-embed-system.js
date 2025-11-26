/**
 * GALLERYPIA - Share & Embed System
 * Phase 12: Social Features
 * Social Sharing & Artwork Embedding
 */

class ShareEmbedSystem {
  constructor() {
    this.shareStats = new Map();
    this.init();
  }

  init() {
    console.log('🔗 Share & Embed System initializing...');
  }

  async shareArtwork(artworkData, platform) {
    console.log(`🔗 Sharing artwork to ${platform}...`);

    const shareUrl = this.getArtworkUrl(artworkData);
    const shareText = this.generateShareText(artworkData);
    const shareImage = artworkData.image_url;

    const platforms = {
      twitter: () => this.shareToTwitter(shareText, shareUrl),
      facebook: () => this.shareToFacebook(shareUrl),
      telegram: () => this.shareToTelegram(shareText, shareUrl),
      whatsapp: () => this.shareToWhatsApp(shareText, shareUrl),
      linkedin: () => this.shareToLinkedIn(shareText, shareUrl),
      pinterest: () => this.shareToPinterest(shareText, shareUrl, shareImage),
      reddit: () => this.shareToReddit(shareText, shareUrl),
      email: () => this.shareViaEmail(artworkData),
      copy: () => this.copyToClipboard(shareUrl),
      native: () => this.shareViaWebShare(artworkData)
    };

    const shareFn = platforms[platform];
    if (shareFn) {
      const success = await shareFn();
      if (success) {
        this.recordShare(artworkData.id, platform);
        this.trackUsage('share', { platform, artwork_id: artworkData.id });
      }
      return success;
    }

    console.error('❌ Unsupported platform:', platform);
    return false;
  }

  shareToTwitter(text, url) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=GALLERYPIA,NFT,Art`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    return true;
  }

  shareToFacebook(url) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    return true;
  }

  shareToTelegram(text, url) {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'width=550,height=420');
    return true;
  }

  shareToWhatsApp(text, url) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank', 'width=550,height=420');
    return true;
  }

  shareToLinkedIn(text, url) {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=550,height=420');
    return true;
  }

  shareToPinterest(text, url, imageUrl) {
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`;
    window.open(pinterestUrl, '_blank', 'width=750,height=550');
    return true;
  }

  shareToReddit(text, url) {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    window.open(redditUrl, '_blank', 'width=850,height=600');
    return true;
  }

  shareViaEmail(artworkData) {
    const subject = `Check out "${artworkData.title}" on GALLERYPIA`;
    const body = `I found this amazing artwork on GALLERYPIA!\n\n${artworkData.title} by ${artworkData.artist_name}\n\n${this.getArtworkUrl(artworkData)}`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    return true;
  }

  async copyToClipboard(url) {
    try {
      await navigator.clipboard.writeText(url);
      console.log('✅ Link copied to clipboard');
      
      // Show notification
      if (window.liveNotifications) {
        window.liveNotifications.show({
          type: 'success',
          message: 'Link copied to clipboard!',
          duration: 2000
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to copy:', error);
      return false;
    }
  }

  async shareViaWebShare(artworkData) {
    if (!navigator.share) {
      console.warn('⚠️ Web Share API not supported');
      return false;
    }

    try {
      await navigator.share({
        title: artworkData.title,
        text: this.generateShareText(artworkData),
        url: this.getArtworkUrl(artworkData)
      });

      console.log('✅ Shared via Web Share API');
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Web Share failed:', error);
      }
      return false;
    }
  }

  generateEmbedCode(artworkData, options = {}) {
    console.log('🔗 Generating embed code...');

    const {
      width = 400,
      height = 500,
      showInfo = true,
      theme = 'light'
    } = options;

    const embedUrl = `${window.location.origin}/embed/artwork/${artworkData.id}`;
    
    const iframeCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allowfullscreen
  style="border-radius: 8px;"
  title="${artworkData.title} - GALLERYPIA"
></iframe>`;

    return {
      iframe: iframeCode,
      url: embedUrl,
      preview: this.generateEmbedPreview(artworkData, width, height)
    };
  }

  generateEmbedPreview(artworkData, width, height) {
    return `
      <div style="width: ${width}px; height: ${height}px; border-radius: 8px; overflow: hidden; background: #f5f5f5;">
        <img src="${artworkData.image_url}" style="width: 100%; height: ${height - 100}px; object-fit: cover;" />
        <div style="padding: 10px; background: white;">
          <h3 style="margin: 0; font-size: 16px;">${artworkData.title}</h3>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">by ${artworkData.artist_name}</p>
        </div>
      </div>
    `;
  }

  getArtworkUrl(artworkData) {
    return `${window.location.origin}/artwork-detail.html?id=${artworkData.id}`;
  }

  generateShareText(artworkData) {
    return `Check out "${artworkData.title}" by ${artworkData.artist_name} on GALLERYPIA! 🎨`;
  }

  async getShareStats(artworkId) {
    console.log(`📊 Getting share stats for artwork ${artworkId}...`);

    try {
      const response = await fetch(`/api/artworks/${artworkId}/share-stats`);
      const result = await response.json();

      if (result.success) {
        return {
          total_shares: result.total_shares,
          by_platform: result.by_platform,
          recent_shares: result.recent_shares
        };
      }
    } catch (error) {
      console.error('❌ Failed to get share stats:', error);
    }

    return {
      total_shares: 0,
      by_platform: {},
      recent_shares: []
    };
  }

  recordShare(artworkId, platform) {
    const key = `${artworkId}_${platform}`;
    const count = (this.shareStats.get(key) || 0) + 1;
    this.shareStats.set(key, count);

    // 서버에 기록
    fetch('/api/artworks/record-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artwork_id: artworkId,
        platform: platform
      })
    }).catch(error => {
      console.error('❌ Failed to record share:', error);
    });
  }

  getSupportedPlatforms() {
    return [
      { id: 'twitter', name: 'Twitter', icon: '🐦' },
      { id: 'facebook', name: 'Facebook', icon: '📘' },
      { id: 'telegram', name: 'Telegram', icon: '✈️' },
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
      { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
      { id: 'pinterest', name: 'Pinterest', icon: '📌' },
      { id: 'reddit', name: 'Reddit', icon: '🤖' },
      { id: 'email', name: 'Email', icon: '📧' },
      { id: 'copy', name: 'Copy Link', icon: '🔗' },
      { id: 'native', name: 'Share', icon: '📤', native: true }
    ].filter(platform => {
      // 네이티브 공유는 지원되는 경우에만
      if (platform.native) {
        return !!navigator.share;
      }
      return true;
    });
  }

  isWebShareSupported() {
    return !!navigator.share;
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'share_embed_usage', {
        event_category: 'Social',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.ShareEmbedSystem = ShareEmbedSystem;
window.shareEmbed = null;

// 초기화 함수
window.initShareEmbed = function() {
  if (!window.shareEmbed) {
    window.shareEmbed = new ShareEmbedSystem();
    console.log('✅ Share & Embed System initialized');
  }
  return window.shareEmbed;
};

// 편의 함수
window.shareArtwork = async function(artworkData, platform) {
  if (!window.shareEmbed) window.initShareEmbed();
  return await window.shareEmbed.shareArtwork(artworkData, platform);
};

window.getEmbedCode = function(artworkData, options = {}) {
  if (!window.shareEmbed) window.initShareEmbed();
  return window.shareEmbed.generateEmbedCode(artworkData, options);
};

console.log('📦 Share & Embed System module loaded');
