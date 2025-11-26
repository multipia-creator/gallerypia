/**
 * GALLERYPIA - Metaverse Expansion
 * Phase 20: Decentraland, Sandbox, VR Exhibition, 3D Avatar
 */

class MetaverseExpansion {
  constructor() {
    this.connected = false;
    this.platform = null;
    this.userAvatar = null;
    this.vrMode = false;
    this.supportedPlatforms = ['decentraland', 'sandbox', 'vr'];
    this.init();
  }

  async init() {
    console.log('🌐 Metaverse Expansion initializing...');
    this.checkVRSupport();
    this.loadAvatarSettings();
  }

  // Decentraland Integration
  async connectDecentraland() {
    console.log('🏙️ Connecting to Decentraland...');
    
    try {
      // Decentraland SDK 로드
      if (typeof dcl === 'undefined') {
        await this.loadDecentralandSDK();
      }

      // 사용자 정보 가져오기
      const userData = await dcl.getUserData();
      
      if (userData) {
        this.connected = true;
        this.platform = 'decentraland';
        
        const connection = {
          platform: 'decentraland',
          wallet: userData.publicKey,
          username: userData.displayName,
          avatar: userData.avatar,
          parcels: userData.parcels || []
        };

        this.trackEvent('decentraland_connected');
        console.log('✅ Decentraland connected');
        
        return connection;
      }
    } catch (error) {
      console.error('❌ Decentraland connection failed:', error);
      throw error;
    }
  }

  async loadDecentralandSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.decentraland.org/@dcl/sdk/latest/sdk.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async deployToDecentraland(galleryData) {
    console.log('🏗️ Deploying gallery to Decentraland...');
    
    try {
      const response = await fetch('/api/metaverse/deploy-decentraland', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gallery: galleryData,
          parcel_coords: galleryData.parcelCoords,
          artworks: galleryData.artworks
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('gallery_deployed_decentraland', {
          parcel: galleryData.parcelCoords
        });
        
        return {
          deployment_url: result.url,
          parcel_coords: result.coords,
          ipfs_hash: result.ipfs_hash,
          explorer_url: `https://play.decentraland.org/?position=${result.coords}`
        };
      }
    } catch (error) {
      console.error('❌ Decentraland deployment failed:', error);
      throw error;
    }
  }

  // The Sandbox Integration
  async connectSandbox() {
    console.log('🏖️ Connecting to The Sandbox...');
    
    try {
      // The Sandbox Game Maker API
      if (typeof SandboxAPI === 'undefined') {
        await this.loadSandboxSDK();
      }

      const connection = await SandboxAPI.connect();
      
      if (connection.success) {
        this.connected = true;
        this.platform = 'sandbox';
        
        this.trackEvent('sandbox_connected');
        console.log('✅ Sandbox connected');
        
        return {
          platform: 'sandbox',
          wallet: connection.wallet,
          lands: connection.lands || [],
          assets: connection.assets || []
        };
      }
    } catch (error) {
      console.error('❌ Sandbox connection failed:', error);
      throw error;
    }
  }

  async loadSandboxSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://api.sandbox.game/sdk/sandbox-api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createSandboxExperience(experienceData) {
    console.log('🎮 Creating Sandbox experience...');
    
    try {
      const response = await fetch('/api/metaverse/create-sandbox-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: experienceData.name,
          description: experienceData.description,
          artworks: experienceData.artworks,
          land_coords: experienceData.landCoords,
          interactive_elements: experienceData.interactiveElements
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('sandbox_experience_created', {
          name: experienceData.name
        });
        
        return {
          experience_id: result.id,
          play_url: result.play_url,
          assets_created: result.assets,
          publish_status: result.status
        };
      }
    } catch (error) {
      console.error('❌ Sandbox experience creation failed:', error);
      throw error;
    }
  }

  // VR Exhibition
  async enterVRMode() {
    console.log('🥽 Entering VR mode...');
    
    if (!this.isVRSupported()) {
      throw new Error('VR not supported');
    }

    try {
      // Request VR session
      const xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'layers']
      });

      this.vrMode = true;
      this.setupVRScene(xrSession);
      
      this.trackEvent('vr_mode_entered');
      console.log('✅ VR mode activated');
      
      return xrSession;
    } catch (error) {
      console.error('❌ VR mode failed:', error);
      throw error;
    }
  }

  setupVRScene(xrSession) {
    console.log('🎨 Setting up VR scene...');
    
    // A-Frame 씬 초기화 (이미 로드되어 있다고 가정)
    const scene = document.querySelector('a-scene');
    
    if (scene) {
      // VR 컨트롤러 설정
      this.setupVRControllers(scene);
      
      // VR 전시회 레이아웃
      this.loadVRGalleryLayout(scene);
      
      // VR 상호작용
      this.enableVRInteractions(scene);
    }
  }

  setupVRControllers(scene) {
    // 왼손 컨트롤러
    const leftHand = document.createElement('a-entity');
    leftHand.setAttribute('oculus-touch-controls', 'hand: left');
    leftHand.setAttribute('laser-controls', '');
    scene.appendChild(leftHand);

    // 오른손 컨트롤러
    const rightHand = document.createElement('a-entity');
    rightHand.setAttribute('oculus-touch-controls', 'hand: right');
    rightHand.setAttribute('laser-controls', '');
    scene.appendChild(rightHand);
  }

  loadVRGalleryLayout(scene) {
    console.log('🏛️ Loading VR gallery layout...');
    
    // 갤러리 벽
    const gallery = document.createElement('a-entity');
    gallery.setAttribute('id', 'vr-gallery');
    
    // 작품들을 원형으로 배치
    const artworkPositions = this.calculateCircularLayout(10, 5); // 10개 작품, 반경 5m
    
    artworkPositions.forEach((pos, index) => {
      const artwork = this.createVRArtwork({
        position: pos,
        id: `artwork-${index}`,
        imageUrl: `/api/artworks/${index}/image`
      });
      gallery.appendChild(artwork);
    });

    scene.appendChild(gallery);
  }

  createVRArtwork(config) {
    const artwork = document.createElement('a-entity');
    
    // 작품 프레임
    const frame = document.createElement('a-plane');
    frame.setAttribute('width', '2');
    frame.setAttribute('height', '2');
    frame.setAttribute('position', config.position);
    frame.setAttribute('material', `src: ${config.imageUrl}; shader: flat`);
    frame.setAttribute('class', 'vr-artwork');
    frame.setAttribute('data-artwork-id', config.id);
    
    // 정보 패널
    const info = document.createElement('a-text');
    info.setAttribute('value', config.title || 'Artwork');
    info.setAttribute('position', `${config.position.split(' ')[0]} ${parseFloat(config.position.split(' ')[1]) - 1.2} ${config.position.split(' ')[2]}`);
    info.setAttribute('align', 'center');
    info.setAttribute('color', '#FFF');
    info.setAttribute('width', '3');
    
    artwork.appendChild(frame);
    artwork.appendChild(info);
    
    return artwork;
  }

  calculateCircularLayout(count, radius) {
    const positions = [];
    const angleStep = (Math.PI * 2) / count;
    
    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(`${x.toFixed(2)} 1.6 ${z.toFixed(2)}`); // 1.6m height (eye level)
    }
    
    return positions;
  }

  enableVRInteractions(scene) {
    console.log('🎮 Enabling VR interactions...');
    
    // 작품 클릭 이벤트
    scene.addEventListener('click', (event) => {
      const artwork = event.target.closest('.vr-artwork');
      if (artwork) {
        const artworkId = artwork.getAttribute('data-artwork-id');
        this.showVRArtworkDetails(artworkId);
        this.trackEvent('vr_artwork_clicked', { artwork_id: artworkId });
      }
    });

    // 텔레포트 기능
    this.enableVRTeleportation(scene);
  }

  enableVRTeleportation(scene) {
    const teleportMarker = document.createElement('a-entity');
    teleportMarker.setAttribute('id', 'teleport-marker');
    teleportMarker.setAttribute('geometry', 'primitive: cylinder; height: 0.1; radius: 0.5');
    teleportMarker.setAttribute('material', 'color: #4CC3D9; opacity: 0.7');
    teleportMarker.setAttribute('visible', 'false');
    scene.appendChild(teleportMarker);
  }

  showVRArtworkDetails(artworkId) {
    console.log(`📋 Showing VR artwork details: ${artworkId}`);
    
    // VR 내 정보 패널 표시
    const detailPanel = document.createElement('a-entity');
    detailPanel.setAttribute('id', 'vr-detail-panel');
    detailPanel.setAttribute('position', '0 1.6 -2');
    
    // 구현...
    this.trackEvent('vr_details_shown', { artwork_id: artworkId });
  }

  async exitVRMode() {
    console.log('🚪 Exiting VR mode...');
    
    if (this.vrMode) {
      this.vrMode = false;
      // VR session end
      this.trackEvent('vr_mode_exited');
      console.log('✅ VR mode exited');
    }
  }

  // 3D Avatar System
  async create3DAvatar(options = {}) {
    console.log('👤 Creating 3D avatar...');
    
    try {
      const response = await fetch('/api/metaverse/create-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_model: options.baseModel || 'human',
          customizations: options.customizations || {},
          wearables: options.wearables || []
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.userAvatar = {
          id: result.avatar_id,
          model_url: result.model_url,
          thumbnail: result.thumbnail,
          wearables: result.wearables
        };

        this.saveAvatarSettings();
        this.trackEvent('avatar_created');
        
        console.log('✅ 3D avatar created');
        return this.userAvatar;
      }
    } catch (error) {
      console.error('❌ Avatar creation failed:', error);
      throw error;
    }
  }

  async customizeAvatar(customizations) {
    console.log('✨ Customizing avatar...');
    
    if (!this.userAvatar) {
      throw new Error('No avatar to customize');
    }

    try {
      const response = await fetch(`/api/metaverse/avatar/${this.userAvatar.id}/customize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customizations)
      });

      const result = await response.json();
      
      if (result.success) {
        this.userAvatar.model_url = result.model_url;
        this.saveAvatarSettings();
        
        this.trackEvent('avatar_customized', {
          changes: Object.keys(customizations)
        });
        
        console.log('✅ Avatar customized');
        return this.userAvatar;
      }
    } catch (error) {
      console.error('❌ Avatar customization failed:', error);
      throw error;
    }
  }

  async addWearable(wearableId) {
    console.log(`👕 Adding wearable: ${wearableId}`);
    
    if (!this.userAvatar) {
      throw new Error('No avatar');
    }

    try {
      const response = await fetch(`/api/metaverse/avatar/${this.userAvatar.id}/wearables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wearable_id: wearableId })
      });

      const result = await response.json();
      
      if (result.success) {
        this.userAvatar.wearables.push(result.wearable);
        this.saveAvatarSettings();
        
        this.trackEvent('wearable_added', { wearable_id: wearableId });
        console.log('✅ Wearable added');
        
        return result.wearable;
      }
    } catch (error) {
      console.error('❌ Wearable add failed:', error);
      throw error;
    }
  }

  loadAvatarSettings() {
    try {
      const settings = localStorage.getItem('metaverse_avatar');
      if (settings) {
        this.userAvatar = JSON.parse(settings);
        console.log('✅ Avatar settings loaded');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load avatar settings');
    }
  }

  saveAvatarSettings() {
    try {
      localStorage.setItem('metaverse_avatar', JSON.stringify(this.userAvatar));
    } catch (error) {
      console.warn('⚠️ Failed to save avatar settings');
    }
  }

  // Cross-Platform Features
  async shareToMetaverse(artworkId, platforms = []) {
    console.log(`🌐 Sharing artwork #${artworkId} to metaverse platforms...`);
    
    const results = {};
    
    for (const platform of platforms) {
      try {
        if (platform === 'decentraland') {
          results.decentraland = await this.shareToDecentraland(artworkId);
        } else if (platform === 'sandbox') {
          results.sandbox = await this.shareToSandbox(artworkId);
        }
      } catch (error) {
        console.error(`❌ Share to ${platform} failed:`, error);
        results[platform] = { success: false, error: error.message };
      }
    }

    this.trackEvent('artwork_shared_metaverse', {
      artwork_id: artworkId,
      platforms: platforms.join(',')
    });
    
    return results;
  }

  async shareToDecentraland(artworkId) {
    const response = await fetch('/api/metaverse/share-decentraland', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artwork_id: artworkId })
    });

    return await response.json();
  }

  async shareToSandbox(artworkId) {
    const response = await fetch('/api/metaverse/share-sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artwork_id: artworkId })
    });

    return await response.json();
  }

  // VR Support Check
  checkVRSupport() {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          console.log('✅ VR supported');
          this.trackEvent('vr_supported');
        } else {
          console.log('❌ VR not supported');
        }
      });
    } else {
      console.log('❌ WebXR not available');
    }
  }

  isVRSupported() {
    return 'xr' in navigator;
  }

  isVRMode() {
    return this.vrMode;
  }

  getPlatform() {
    return this.platform;
  }

  getAvatar() {
    return this.userAvatar;
  }

  trackEvent(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'metaverse_' + action, {
        event_category: 'Metaverse',
        platform: this.platform,
        vr_mode: this.vrMode,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.MetaverseExpansion = MetaverseExpansion;
window.metaverse = null;

// 초기화 함수
window.initMetaverse = function() {
  if (!window.metaverse) {
    window.metaverse = new MetaverseExpansion();
    console.log('✅ Metaverse Expansion initialized');
  }
  return window.metaverse;
};

console.log('📦 Metaverse Expansion module loaded');
