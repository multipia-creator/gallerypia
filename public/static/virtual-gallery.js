/**
 * GALLERYPIA - 3D Virtual Gallery System
 * Phase 9: Metaverse Integration
 * A-Frame + Three.js based Virtual Art Museum
 */

class VirtualGallery {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.artworks = [];
    this.currentRoom = 'main';
    this.rooms = {
      main: { name: 'Main Gallery', capacity: 20 },
      premium: { name: 'Premium Collection', capacity: 10 },
      auction: { name: 'Live Auction Room', capacity: 15 },
      studio: { name: 'Artist Studio', capacity: 8 }
    };
    this.init();
  }

  init() {
    console.log('🏛️ Virtual Gallery initializing...');
    this.loadAFrameIfNeeded();
    this.setupEventListeners();
  }

  loadAFrameIfNeeded() {
    if (typeof AFRAME === 'undefined') {
      console.log('⏳ Loading A-Frame library...');
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
      script.onload = () => {
        console.log('✅ A-Frame loaded');
        this.loadARjs();
      };
      document.head.appendChild(script);
    } else {
      this.loadARjs();
    }
  }

  loadARjs() {
    if (typeof ARjs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
      script.onload = () => {
        console.log('✅ AR.js loaded');
        this.initScene();
      };
      document.head.appendChild(script);
    } else {
      this.initScene();
    }
  }

  setupEventListeners() {
    // VR 모드 진입/탈출
    window.addEventListener('enter-vr', () => {
      console.log('🥽 Entered VR mode');
      this.trackEvent('vr_mode_enter');
    });

    window.addEventListener('exit-vr', () => {
      console.log('👁️ Exited VR mode');
      this.trackEvent('vr_mode_exit');
    });
  }

  initScene() {
    console.log('🎬 Initializing 3D scene...');
    
    // A-Frame 씬이 이미 있는지 확인
    let aScene = document.querySelector('a-scene');
    
    if (!aScene) {
      // 새로운 A-Frame 씬 생성
      aScene = document.createElement('a-scene');
      aScene.setAttribute('embedded', '');
      aScene.setAttribute('vr-mode-ui', 'enabled: true');
      
      // 갤러리 컨테이너에 추가
      const container = document.getElementById('virtual-gallery-container');
      if (container) {
        container.appendChild(aScene);
      } else {
        document.body.appendChild(aScene);
      }
    }

    this.scene = aScene;
    this.createGalleryEnvironment();
  }

  createGalleryEnvironment() {
    console.log('🏗️ Creating gallery environment...');

    // 하늘 (배경)
    const sky = document.createElement('a-sky');
    sky.setAttribute('color', '#ECECEC');
    this.scene.appendChild(sky);

    // 바닥
    const floor = document.createElement('a-plane');
    floor.setAttribute('position', '0 0 -4');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '100');
    floor.setAttribute('height', '100');
    floor.setAttribute('color', '#7BC8A4');
    this.scene.appendChild(floor);

    // 벽 (4면)
    this.createWalls();

    // 조명
    this.createLighting();

    // 카메라 및 컨트롤
    this.createCamera();

    // 작품 로드
    this.loadArtworks();
  }

  createWalls() {
    // 정면 벽
    const frontWall = document.createElement('a-box');
    frontWall.setAttribute('position', '0 2.5 -10');
    frontWall.setAttribute('width', '20');
    frontWall.setAttribute('height', '5');
    frontWall.setAttribute('depth', '0.1');
    frontWall.setAttribute('color', '#FFF');
    this.scene.appendChild(frontWall);

    // 좌측 벽
    const leftWall = document.createElement('a-box');
    leftWall.setAttribute('position', '-10 2.5 0');
    leftWall.setAttribute('rotation', '0 90 0');
    leftWall.setAttribute('width', '20');
    leftWall.setAttribute('height', '5');
    leftWall.setAttribute('depth', '0.1');
    leftWall.setAttribute('color', '#FFF');
    this.scene.appendChild(leftWall);

    // 우측 벽
    const rightWall = document.createElement('a-box');
    rightWall.setAttribute('position', '10 2.5 0');
    rightWall.setAttribute('rotation', '0 90 0');
    rightWall.setAttribute('width', '20');
    rightWall.setAttribute('height', '5');
    rightWall.setAttribute('depth', '0.1');
    rightWall.setAttribute('color', '#FFF');
    this.scene.appendChild(rightWall);
  }

  createLighting() {
    // 주 조명
    const mainLight = document.createElement('a-light');
    mainLight.setAttribute('type', 'directional');
    mainLight.setAttribute('position', '0 10 0');
    mainLight.setAttribute('intensity', '0.8');
    this.scene.appendChild(mainLight);

    // 앰비언트 조명
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('intensity', '0.5');
    this.scene.appendChild(ambientLight);

    // 스포트라이트 (작품 강조용)
    for (let i = 0; i < 5; i++) {
      const spotlight = document.createElement('a-light');
      spotlight.setAttribute('type', 'spot');
      spotlight.setAttribute('position', `${-8 + i * 4} 4 -9`);
      spotlight.setAttribute('target', `#artwork-${i}`);
      spotlight.setAttribute('intensity', '1.2');
      spotlight.setAttribute('angle', '30');
      this.scene.appendChild(spotlight);
    }
  }

  createCamera() {
    // 카메라 리그 (이동 가능한 카메라)
    const cameraRig = document.createElement('a-entity');
    cameraRig.setAttribute('id', 'cameraRig');
    cameraRig.setAttribute('position', '0 1.6 5');

    // 카메라
    const camera = document.createElement('a-camera');
    camera.setAttribute('look-controls', 'enabled: true');
    camera.setAttribute('wasd-controls', 'enabled: true');
    
    cameraRig.appendChild(camera);
    this.scene.appendChild(cameraRig);

    this.camera = camera;
  }

  async loadArtworks() {
    console.log('🎨 Loading artworks into virtual gallery...');

    try {
      const response = await fetch('/api/artworks?featured=true&limit=10');
      const result = await response.json();

      if (result.success && result.artworks) {
        this.artworks = result.artworks;
        this.displayArtworks();
      }
    } catch (error) {
      console.error('❌ Failed to load artworks:', error);
      // 데모 작품 표시
      this.displayDemoArtworks();
    }
  }

  displayArtworks() {
    const startX = -8;
    const spacing = 4;
    const wallZ = -9.5;

    this.artworks.slice(0, 5).forEach((artwork, index) => {
      const frame = this.createArtworkFrame(
        artwork,
        startX + (index * spacing),
        2.5,
        wallZ
      );
      this.scene.appendChild(frame);
    });
  }

  createArtworkFrame(artwork, x, y, z) {
    // 프레임 그룹
    const frameGroup = document.createElement('a-entity');
    frameGroup.setAttribute('id', `artwork-${artwork.id}`);
    frameGroup.setAttribute('position', `${x} ${y} ${z}`);

    // 액자
    const frame = document.createElement('a-box');
    frame.setAttribute('width', '2.5');
    frame.setAttribute('height', '2.5');
    frame.setAttribute('depth', '0.1');
    frame.setAttribute('color', '#8B7355');
    frameGroup.appendChild(frame);

    // 작품 이미지
    const artImage = document.createElement('a-image');
    artImage.setAttribute('src', artwork.image_url || 'https://via.placeholder.com/512');
    artImage.setAttribute('width', '2.2');
    artImage.setAttribute('height', '2.2');
    artImage.setAttribute('position', '0 0 0.06');
    frameGroup.appendChild(artImage);

    // 작품 정보 텍스트
    const infoText = document.createElement('a-text');
    infoText.setAttribute('value', `${artwork.title}\n${artwork.artist_name}`);
    infoText.setAttribute('align', 'center');
    infoText.setAttribute('position', '0 -1.5 0.06');
    infoText.setAttribute('width', '2');
    infoText.setAttribute('color', '#333');
    frameGroup.appendChild(infoText);

    // 가격 텍스트
    const priceText = document.createElement('a-text');
    priceText.setAttribute('value', `${artwork.price} ETH`);
    priceText.setAttribute('align', 'center');
    priceText.setAttribute('position', '0 -1.8 0.06');
    priceText.setAttribute('width', '2');
    priceText.setAttribute('color', '#0066FF');
    frameGroup.appendChild(priceText);

    // 인터랙션 (클릭)
    frameGroup.setAttribute('class', 'clickable');
    frameGroup.addEventListener('click', () => {
      this.onArtworkClick(artwork);
    });

    // 호버 효과
    frameGroup.setAttribute('animation__mouseenter', {
      property: 'scale',
      to: '1.1 1.1 1.1',
      dur: 200,
      startEvents: 'mouseenter'
    });
    frameGroup.setAttribute('animation__mouseleave', {
      property: 'scale',
      to: '1 1 1',
      dur: 200,
      startEvents: 'mouseleave'
    });

    return frameGroup;
  }

  displayDemoArtworks() {
    console.log('🎭 Displaying demo artworks...');

    const demoArtworks = [
      { id: 1, title: 'Abstract #1', artist_name: 'Demo Artist', price: 1.5, image_url: 'https://via.placeholder.com/512/FF6B6B/FFFFFF?text=Art+1' },
      { id: 2, title: 'Portrait #2', artist_name: 'Demo Artist', price: 2.0, image_url: 'https://via.placeholder.com/512/4ECDC4/FFFFFF?text=Art+2' },
      { id: 3, title: 'Landscape #3', artist_name: 'Demo Artist', price: 1.8, image_url: 'https://via.placeholder.com/512/45B7D1/FFFFFF?text=Art+3' },
      { id: 4, title: 'Digital #4', artist_name: 'Demo Artist', price: 2.5, image_url: 'https://via.placeholder.com/512/FFA07A/FFFFFF?text=Art+4' },
      { id: 5, title: 'Modern #5', artist_name: 'Demo Artist', price: 3.0, image_url: 'https://via.placeholder.com/512/98D8C8/FFFFFF?text=Art+5' }
    ];

    this.artworks = demoArtworks;
    this.displayArtworks();
  }

  onArtworkClick(artwork) {
    console.log('🖼️ Artwork clicked:', artwork.title);
    
    // 작품 상세 정보 모달 표시
    this.showArtworkDetail(artwork);
    
    // 이벤트 추적
    this.trackEvent('artwork_view_3d', {
      artwork_id: artwork.id,
      artwork_title: artwork.title,
      room: this.currentRoom
    });
  }

  showArtworkDetail(artwork) {
    // 2D UI 오버레이로 상세 정보 표시
    const modal = document.createElement('div');
    modal.className = 'vr-artwork-modal';
    modal.innerHTML = `
      <div class="vr-modal-content">
        <button class="vr-modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        <img src="${artwork.image_url}" alt="${artwork.title}">
        <h2>${artwork.title}</h2>
        <p>Artist: ${artwork.artist_name}</p>
        <p class="price">${artwork.price} ETH</p>
        <button class="btn-primary" onclick="window.location.href='/artwork-detail.html?id=${artwork.id}'">
          View Details
        </button>
        <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  changeRoom(roomName) {
    if (!this.rooms[roomName]) {
      console.error('❌ Invalid room:', roomName);
      return;
    }

    console.log(`🚪 Changing to ${this.rooms[roomName].name}...`);
    this.currentRoom = roomName;

    // 방 전환 애니메이션
    this.fadeTransition(() => {
      this.loadRoomArtworks(roomName);
    });

    this.trackEvent('room_change', { room: roomName });
  }

  fadeTransition(callback) {
    // 페이드 아웃
    const fadeOut = document.createElement('a-entity');
    fadeOut.setAttribute('geometry', 'primitive: plane; width: 100; height: 100');
    fadeOut.setAttribute('material', 'color: black; opacity: 0');
    fadeOut.setAttribute('position', '0 0 -1');
    fadeOut.setAttribute('animation', {
      property: 'material.opacity',
      to: 1,
      dur: 500,
      easing: 'linear'
    });

    this.camera.appendChild(fadeOut);

    setTimeout(() => {
      callback();
      
      // 페이드 인
      fadeOut.setAttribute('animation', {
        property: 'material.opacity',
        to: 0,
        dur: 500,
        easing: 'linear'
      });

      setTimeout(() => {
        fadeOut.remove();
      }, 500);
    }, 500);
  }

  loadRoomArtworks(roomName) {
    // 기존 작품 제거
    const oldArtworks = this.scene.querySelectorAll('[id^="artwork-"]');
    oldArtworks.forEach(artwork => artwork.remove());

    // 새 작품 로드 (방별로 다른 필터)
    const filters = {
      main: '?featured=true&limit=10',
      premium: '?min_price=5&limit=10',
      auction: '?status=auction&limit=10',
      studio: '?sort=newest&limit=10'
    };

    fetch(`/api/artworks${filters[roomName] || ''}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.artworks = result.artworks;
          this.displayArtworks();
        }
      })
      .catch(error => {
        console.error('❌ Failed to load room artworks:', error);
        this.displayDemoArtworks();
      });
  }

  enterVRMode() {
    if (this.scene) {
      this.scene.enterVR();
      console.log('🥽 Entering VR mode...');
    }
  }

  exitVRMode() {
    if (this.scene) {
      this.scene.exitVR();
      console.log('👁️ Exiting VR mode...');
    }
  }

  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Virtual_Gallery',
        ...data
      });
    }
  }

  destroy() {
    if (this.scene) {
      this.scene.remove();
      this.scene = null;
    }
    console.log('🗑️ Virtual Gallery destroyed');
  }
}

// 글로벌 인스턴스
window.VirtualGallery = VirtualGallery;
window.virtualGallery = null;

// 초기화 함수
window.initVirtualGallery = function() {
  if (!window.virtualGallery) {
    window.virtualGallery = new VirtualGallery();
    console.log('✅ Virtual Gallery initialized');
  }
  return window.virtualGallery;
};

console.log('📦 Virtual Gallery module loaded');
