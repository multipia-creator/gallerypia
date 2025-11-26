/**
 * GALLERYPIA - AR Artwork Viewer
 * Phase 9: AR/VR Integration
 * WebXR + AR.js based Augmented Reality Experience
 */

class ARArtworkViewer {
  constructor() {
    this.arScene = null;
    this.camera = null;
    this.markers = [];
    this.currentArtwork = null;
    this.isARSupported = false;
    this.init();
  }

  init() {
    console.log('📱 AR Artwork Viewer initializing...');
    this.checkARSupport();
    this.loadLibraries();
  }

  checkARSupport() {
    // WebXR 지원 확인
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        this.isARSupported = supported;
        console.log(`📱 AR Support: ${supported ? '✅' : '❌'}`);
      });
    } else {
      console.log('⚠️ WebXR not supported, fallback to AR.js');
      this.isARSupported = true; // AR.js 사용
    }
  }

  loadLibraries() {
    // A-Frame 로드
    if (typeof AFRAME === 'undefined') {
      const aframeScript = document.createElement('script');
      aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
      aframeScript.onload = () => {
        console.log('✅ A-Frame loaded for AR');
        this.loadARjs();
      };
      document.head.appendChild(aframeScript);
    } else {
      this.loadARjs();
    }
  }

  loadARjs() {
    // AR.js 로드
    if (typeof ARjs === 'undefined') {
      const arjsScript = document.createElement('script');
      arjsScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
      arjsScript.onload = () => {
        console.log('✅ AR.js loaded');
        this.setupARScene();
      };
      document.head.appendChild(arjsScript);
    } else {
      this.setupARScene();
    }
  }

  setupARScene() {
    console.log('🎬 Setting up AR scene...');
    
    // AR 씬 생성
    const arScene = document.createElement('a-scene');
    arScene.setAttribute('embedded', '');
    arScene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');
    arScene.setAttribute('vr-mode-ui', 'enabled: false');

    // AR 카메라
    const camera = document.createElement('a-entity');
    camera.setAttribute('camera', '');
    arScene.appendChild(camera);

    // 컨테이너에 추가
    const container = document.getElementById('ar-viewer-container');
    if (container) {
      container.appendChild(arScene);
    } else {
      document.body.appendChild(arScene);
    }

    this.arScene = arScene;
    this.camera = camera;

    console.log('✅ AR scene ready');
  }

  createMarkerBasedAR(artworkId) {
    console.log(`🎯 Creating marker-based AR for artwork ${artworkId}...`);

    // 마커 기반 AR
    const marker = document.createElement('a-marker');
    marker.setAttribute('preset', 'hiro');
    marker.setAttribute('id', `marker-${artworkId}`);

    // 마커 감지 이벤트
    marker.addEventListener('markerFound', () => {
      console.log('✅ Marker detected!');
      this.onMarkerFound(artworkId);
    });

    marker.addEventListener('markerLost', () => {
      console.log('❌ Marker lost');
      this.onMarkerLost(artworkId);
    });

    this.arScene.appendChild(marker);
    this.markers.push(marker);

    return marker;
  }

  displayArtworkInAR(artwork, marker) {
    console.log(`🖼️ Displaying ${artwork.title} in AR...`);

    // 작품 프레임 그룹
    const artworkGroup = document.createElement('a-entity');
    artworkGroup.setAttribute('id', `ar-artwork-${artwork.id}`);

    // 3D 액자
    const frame = document.createElement('a-box');
    frame.setAttribute('position', '0 0 0');
    frame.setAttribute('width', '1.2');
    frame.setAttribute('height', '1.2');
    frame.setAttribute('depth', '0.05');
    frame.setAttribute('color', '#8B7355');
    artworkGroup.appendChild(frame);

    // 작품 이미지
    const artImage = document.createElement('a-image');
    artImage.setAttribute('src', artwork.image_url);
    artImage.setAttribute('position', '0 0 0.03');
    artImage.setAttribute('width', '1.1');
    artImage.setAttribute('height', '1.1');
    artworkGroup.appendChild(artImage);

    // 작품 정보 (3D 텍스트)
    const infoText = document.createElement('a-text');
    infoText.setAttribute('value', `${artwork.title}\n${artwork.artist_name}\n${artwork.price} ETH`);
    infoText.setAttribute('align', 'center');
    infoText.setAttribute('position', '0 -0.7 0.03');
    infoText.setAttribute('width', '1.5');
    infoText.setAttribute('color', '#000');
    infoText.setAttribute('background', '#FFF');
    artworkGroup.appendChild(infoText);

    // 회전 애니메이션
    artworkGroup.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      loop: true,
      dur: 10000,
      easing: 'linear'
    });

    // 마커에 추가
    marker.appendChild(artworkGroup);

    return artworkGroup;
  }

  createLocationBasedAR(artwork, latitude, longitude) {
    console.log(`📍 Creating location-based AR for ${artwork.title}...`);

    // 위치 기반 AR (GPS)
    const gpsEntity = document.createElement('a-entity');
    gpsEntity.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
    gpsEntity.setAttribute('id', `gps-artwork-${artwork.id}`);

    // 작품 모델
    const model = this.create3DArtworkModel(artwork);
    gpsEntity.appendChild(model);

    this.arScene.appendChild(gpsEntity);

    return gpsEntity;
  }

  create3DArtworkModel(artwork) {
    // 3D 작품 모델 생성
    const modelGroup = document.createElement('a-entity');

    // 베이스 (받침대)
    const base = document.createElement('a-cylinder');
    base.setAttribute('position', '0 0.5 0');
    base.setAttribute('radius', '0.3');
    base.setAttribute('height', '1');
    base.setAttribute('color', '#666');
    modelGroup.appendChild(base);

    // 작품 이미지 (평면)
    const artPlane = document.createElement('a-plane');
    artPlane.setAttribute('position', '0 1.5 0');
    artPlane.setAttribute('width', '1');
    artPlane.setAttribute('height', '1');
    artPlane.setAttribute('src', artwork.image_url);
    modelGroup.appendChild(artPlane);

    // 조명 효과
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('position', '0 2.5 0');
    light.setAttribute('intensity', '1.5');
    light.setAttribute('color', '#FFF');
    modelGroup.appendChild(light);

    // 정보 패널
    const infoPanel = document.createElement('a-plane');
    infoPanel.setAttribute('position', '0 0.3 0.4');
    infoPanel.setAttribute('width', '0.8');
    infoPanel.setAttribute('height', '0.3');
    infoPanel.setAttribute('color', '#000');
    infoPanel.setAttribute('opacity', '0.7');
    modelGroup.appendChild(infoPanel);

    const infoText = document.createElement('a-text');
    infoText.setAttribute('value', `${artwork.title}\n${artwork.price} ETH`);
    infoText.setAttribute('align', 'center');
    infoText.setAttribute('position', '0 0.3 0.41');
    infoText.setAttribute('width', '0.7');
    infoText.setAttribute('color', '#FFF');
    modelGroup.appendChild(infoText);

    // 회전 애니메이션
    modelGroup.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      loop: true,
      dur: 20000,
      easing: 'linear'
    });

    return modelGroup;
  }

  onMarkerFound(artworkId) {
    console.log(`✅ Marker found for artwork ${artworkId}`);
    
    // 작품 정보 로드
    this.loadArtworkForAR(artworkId);

    // 이벤트 추적
    this.trackEvent('ar_marker_found', { artwork_id: artworkId });
  }

  onMarkerLost(artworkId) {
    console.log(`❌ Marker lost for artwork ${artworkId}`);
    
    this.trackEvent('ar_marker_lost', { artwork_id: artworkId });
  }

  async loadArtworkForAR(artworkId) {
    try {
      const response = await fetch(`/api/artworks/${artworkId}`);
      const result = await response.json();

      if (result.success && result.artwork) {
        this.currentArtwork = result.artwork;
        
        // 마커 찾기
        const marker = document.getElementById(`marker-${artworkId}`);
        if (marker) {
          this.displayArtworkInAR(result.artwork, marker);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load artwork for AR:', error);
    }
  }

  enableImageTracking(imageUrl, artwork) {
    console.log('🔍 Enabling image tracking...');

    // 이미지 마커
    const imageMarker = document.createElement('a-nft');
    imageMarker.setAttribute('type', 'nft');
    imageMarker.setAttribute('url', imageUrl);
    imageMarker.setAttribute('smooth', 'true');
    imageMarker.setAttribute('smoothCount', '10');
    imageMarker.setAttribute('smoothTolerance', '0.01');
    imageMarker.setAttribute('smoothThreshold', '5');

    // 작품 모델 추가
    const model = this.create3DArtworkModel(artwork);
    imageMarker.appendChild(model);

    this.arScene.appendChild(imageMarker);

    return imageMarker;
  }

  captureARPhoto() {
    console.log('📸 Capturing AR photo...');

    const canvas = this.arScene.components.screenshot.getCanvas('perspective');
    const dataURL = canvas.toDataURL('image/png');

    // 다운로드
    const link = document.createElement('a');
    link.download = `gallerypia-ar-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    this.trackEvent('ar_photo_captured');

    return dataURL;
  }

  shareAR() {
    console.log('🔗 Sharing AR experience...');

    const shareData = {
      title: `${this.currentArtwork?.title || 'Artwork'} in AR`,
      text: `Check out this artwork in Augmented Reality on GALLERYPIA!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('✅ Shared successfully');
          this.trackEvent('ar_shared', { method: 'native' });
        })
        .catch(error => {
          console.error('❌ Share failed:', error);
        });
    } else {
      // Fallback: 클립보드 복사
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
          this.trackEvent('ar_shared', { method: 'clipboard' });
        });
    }
  }

  enableHandTracking() {
    console.log('✋ Enabling hand tracking...');

    // WebXR Hand Tracking API
    if ('xr' in navigator) {
      navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hand-tracking']
      }).then(session => {
        console.log('✅ Hand tracking session started');
        
        session.requestReferenceSpace('local').then(refSpace => {
          // 손 추적 로직
          this.setupHandTracking(session, refSpace);
        });
      }).catch(error => {
        console.error('❌ Hand tracking not supported:', error);
      });
    }
  }

  setupHandTracking(session, refSpace) {
    // 손 제스처 인식
    session.addEventListener('inputsourceschange', (event) => {
      event.added.forEach(inputSource => {
        if (inputSource.hand) {
          console.log('✋ Hand detected');
          this.processHandGestures(inputSource.hand);
        }
      });
    });
  }

  processHandGestures(hand) {
    // 간단한 제스처: 엄지와 검지 터치 = 선택
    const thumbTip = hand.get('thumb-tip');
    const indexTip = hand.get('index-finger-tip');

    if (thumbTip && indexTip) {
      const distance = this.calculateDistance(thumbTip, indexTip);
      
      if (distance < 0.02) { // 2cm 이내
        console.log('👌 Pinch gesture detected');
        this.onPinchGesture();
      }
    }
  }

  calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  onPinchGesture() {
    // Pinch 제스처로 작품 선택/구매
    if (this.currentArtwork) {
      console.log(`🎯 Selected: ${this.currentArtwork.title}`);
      this.showARPurchaseDialog(this.currentArtwork);
    }
  }

  showARPurchaseDialog(artwork) {
    // AR 내 구매 다이얼로그
    const dialog = document.createElement('a-entity');
    dialog.setAttribute('position', '0 1.5 -2');
    
    const panel = document.createElement('a-plane');
    panel.setAttribute('width', '2');
    panel.setAttribute('height', '1');
    panel.setAttribute('color', '#FFF');
    dialog.appendChild(panel);

    const text = document.createElement('a-text');
    text.setAttribute('value', `Purchase ${artwork.title}?\n${artwork.price} ETH`);
    text.setAttribute('align', 'center');
    text.setAttribute('position', '0 0.2 0.01');
    text.setAttribute('color', '#000');
    dialog.appendChild(text);

    // 구매 버튼
    const buyButton = document.createElement('a-box');
    buyButton.setAttribute('position', '-0.5 -0.3 0.01');
    buyButton.setAttribute('width', '0.8');
    buyButton.setAttribute('height', '0.3');
    buyButton.setAttribute('depth', '0.05');
    buyButton.setAttribute('color', '#0066FF');
    buyButton.setAttribute('class', 'clickable');
    buyButton.addEventListener('click', () => {
      this.purchaseInAR(artwork);
    });
    dialog.appendChild(buyButton);

    const buyText = document.createElement('a-text');
    buyText.setAttribute('value', 'Buy Now');
    buyText.setAttribute('align', 'center');
    buyText.setAttribute('position', '-0.5 -0.3 0.06');
    buyText.setAttribute('color', '#FFF');
    buyText.setAttribute('width', '0.7');
    dialog.appendChild(buyText);

    // 취소 버튼
    const cancelButton = document.createElement('a-box');
    cancelButton.setAttribute('position', '0.5 -0.3 0.01');
    cancelButton.setAttribute('width', '0.8');
    cancelButton.setAttribute('height', '0.3');
    cancelButton.setAttribute('depth', '0.05');
    cancelButton.setAttribute('color', '#999');
    cancelButton.setAttribute('class', 'clickable');
    cancelButton.addEventListener('click', () => {
      dialog.remove();
    });
    dialog.appendChild(cancelButton);

    const cancelText = document.createElement('a-text');
    cancelText.setAttribute('value', 'Cancel');
    cancelText.setAttribute('align', 'center');
    cancelText.setAttribute('position', '0.5 -0.3 0.06');
    cancelText.setAttribute('color', '#FFF');
    cancelText.setAttribute('width', '0.7');
    dialog.appendChild(cancelText);

    this.camera.appendChild(dialog);
  }

  async purchaseInAR(artwork) {
    console.log(`💳 Purchasing ${artwork.title} in AR...`);

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artwork_id: artwork.id,
          source: 'ar_viewer'
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showARSuccessMessage('Purchase successful!');
        this.trackEvent('ar_purchase', { artwork_id: artwork.id });
      } else {
        this.showARErrorMessage('Purchase failed');
      }
    } catch (error) {
      console.error('❌ AR purchase error:', error);
      this.showARErrorMessage('Network error');
    }
  }

  showARSuccessMessage(message) {
    // AR 공간에 성공 메시지 표시
    const successMsg = document.createElement('a-text');
    successMsg.setAttribute('value', `✅ ${message}`);
    successMsg.setAttribute('align', 'center');
    successMsg.setAttribute('position', '0 2 -3');
    successMsg.setAttribute('color', '#00FF00');
    successMsg.setAttribute('width', '3');
    
    this.arScene.appendChild(successMsg);

    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  }

  showARErrorMessage(message) {
    const errorMsg = document.createElement('a-text');
    errorMsg.setAttribute('value', `❌ ${message}`);
    errorMsg.setAttribute('align', 'center');
    errorMsg.setAttribute('position', '0 2 -3');
    errorMsg.setAttribute('color', '#FF0000');
    errorMsg.setAttribute('width', '3');
    
    this.arScene.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.remove();
    }, 3000);
  }

  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'AR_Viewer',
        ...data
      });
    }
  }

  destroy() {
    if (this.arScene) {
      this.arScene.remove();
      this.arScene = null;
    }
    this.markers = [];
    console.log('🗑️ AR Viewer destroyed');
  }
}

// 글로벌 인스턴스
window.ARArtworkViewer = ARArtworkViewer;
window.arViewer = null;

// 초기화 함수
window.initARViewer = function() {
  if (!window.arViewer) {
    window.arViewer = new ARArtworkViewer();
    console.log('✅ AR Viewer initialized');
  }
  return window.arViewer;
};

console.log('📦 AR Artwork Viewer module loaded');
