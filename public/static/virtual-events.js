/**
 * GALLERYPIA - Virtual Events System
 * Phase 9: Metaverse Integration
 * Virtual Exhibition & Live Curation Events
 */

class VirtualEventsSystem {
  constructor() {
    this.events = [];
    this.currentEvent = null;
    this.attendees = [];
    this.maxAttendees = 100;
    this.eventRoom = null;
    this.init();
  }

  init() {
    console.log('🎭 Virtual Events System initializing...');
    this.loadUpcomingEvents();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 이벤트 참가/퇴장 추적
    window.addEventListener('event-joined', (e) => {
      console.log('✅ Joined event:', e.detail.eventId);
      this.onEventJoined(e.detail);
    });

    window.addEventListener('event-left', (e) => {
      console.log('👋 Left event:', e.detail.eventId);
      this.onEventLeft(e.detail);
    });
  }

  async loadUpcomingEvents() {
    console.log('📅 Loading upcoming events...');

    try {
      const response = await fetch('/api/events?status=upcoming&limit=10');
      const result = await response.json();

      if (result.success && result.events) {
        this.events = result.events;
        console.log(`✅ Loaded ${this.events.length} upcoming events`);
        this.displayEvents();
      }
    } catch (error) {
      console.error('❌ Failed to load events:', error);
      this.loadDemoEvents();
    }
  }

  loadDemoEvents() {
    console.log('🎭 Loading demo events...');

    this.events = [
      {
        id: 1,
        title: 'Digital Art Renaissance',
        type: 'exhibition',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        duration: 120,
        curator: 'Jane Smith',
        artworks_count: 25,
        max_attendees: 100,
        description: 'Explore the latest in digital art innovation'
      },
      {
        id: 2,
        title: 'NFT Artist Showcase',
        type: 'live_auction',
        start_time: new Date(Date.now() + 7200000).toISOString(),
        duration: 90,
        curator: 'John Doe',
        artworks_count: 15,
        max_attendees: 50,
        description: 'Live auction featuring emerging NFT artists'
      },
      {
        id: 3,
        title: 'VR Gallery Tour',
        type: 'guided_tour',
        start_time: new Date(Date.now() + 10800000).toISOString(),
        duration: 60,
        curator: 'Alice Johnson',
        artworks_count: 30,
        max_attendees: 20,
        description: 'Immersive VR tour of our premium collection'
      }
    ];

    this.displayEvents();
  }

  displayEvents() {
    const container = document.getElementById('events-list');
    if (!container) return;

    container.innerHTML = this.events.map(event => this.createEventCard(event)).join('');
  }

  createEventCard(event) {
    const startTime = new Date(event.start_time);
    const timeUntil = this.getTimeUntil(startTime);

    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-header">
          <span class="event-type ${event.type}">${this.getEventTypeLabel(event.type)}</span>
          <span class="event-time">${timeUntil}</span>
        </div>
        <h3>${event.title}</h3>
        <p class="event-description">${event.description}</p>
        <div class="event-details">
          <span><i class="fas fa-user"></i> ${event.curator}</span>
          <span><i class="fas fa-palette"></i> ${event.artworks_count} artworks</span>
          <span><i class="fas fa-users"></i> ${event.current_attendees || 0}/${event.max_attendees}</span>
          <span><i class="fas fa-clock"></i> ${event.duration} min</span>
        </div>
        <div class="event-actions">
          <button class="btn-primary" onclick="window.virtualEvents.joinEvent(${event.id})">
            <i class="fas fa-door-open"></i> Join Event
          </button>
          <button class="btn-secondary" onclick="window.virtualEvents.setReminder(${event.id})">
            <i class="fas fa-bell"></i> Set Reminder
          </button>
        </div>
      </div>
    `;
  }

  getEventTypeLabel(type) {
    const labels = {
      'exhibition': '🎨 Exhibition',
      'live_auction': '🔨 Live Auction',
      'guided_tour': '🚶 Guided Tour',
      'artist_talk': '🎤 Artist Talk',
      'workshop': '🛠️ Workshop'
    };
    return labels[type] || '📅 Event';
  }

  getTimeUntil(eventTime) {
    const now = new Date();
    const diff = eventTime - now;

    if (diff < 0) return 'Live Now!';

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    } else {
      return `In ${minutes}m`;
    }
  }

  async joinEvent(eventId) {
    console.log(`🚪 Joining event ${eventId}...`);

    // 이벤트 정보 로드
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      console.error('❌ Event not found');
      return;
    }

    // 정원 확인
    if (event.current_attendees >= event.max_attendees) {
      alert('Sorry, this event is full!');
      return;
    }

    try {
      // 서버에 참가 요청
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.currentEvent = event;
        this.createEventRoom(event);
        this.trackEvent('event_joined', { event_id: eventId, event_type: event.type });
      } else {
        alert('Failed to join event: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Failed to join event:', error);
    }
  }

  createEventRoom(event) {
    console.log(`🏗️ Creating event room for: ${event.title}`);

    // 가상 갤러리 활용
    if (window.virtualGallery) {
      this.eventRoom = window.virtualGallery;
    } else {
      // 새로운 이벤트 전용 씬 생성
      this.eventRoom = this.createEventScene(event);
    }

    // 이벤트 타입별 설정
    switch (event.type) {
      case 'exhibition':
        this.setupExhibition(event);
        break;
      case 'live_auction':
        this.setupLiveAuction(event);
        break;
      case 'guided_tour':
        this.setupGuidedTour(event);
        break;
      case 'artist_talk':
        this.setupArtistTalk(event);
        break;
    }

    // 참석자 아바타 표시
    this.displayAttendees();

    // 라이브 채팅
    this.enableEventChat();
  }

  createEventScene(event) {
    const scene = document.createElement('a-scene');
    scene.setAttribute('id', 'event-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('vr-mode-ui', 'enabled: true');

    // 이벤트 전용 환경
    this.createEventEnvironment(scene, event);

    const container = document.getElementById('event-container');
    if (container) {
      container.appendChild(scene);
    }

    return scene;
  }

  createEventEnvironment(scene, event) {
    // 스카이박스
    const sky = document.createElement('a-sky');
    sky.setAttribute('color', event.type === 'live_auction' ? '#1A1A2E' : '#F0F0F0');
    scene.appendChild(sky);

    // 무대
    const stage = document.createElement('a-plane');
    stage.setAttribute('position', '0 0 -5');
    stage.setAttribute('rotation', '-90 0 0');
    stage.setAttribute('width', '15');
    stage.setAttribute('height', '15');
    stage.setAttribute('color', '#8B7355');
    scene.appendChild(stage);

    // 이벤트 배너
    const banner = document.createElement('a-text');
    banner.setAttribute('value', event.title.toUpperCase());
    banner.setAttribute('align', 'center');
    banner.setAttribute('position', '0 4 -10');
    banner.setAttribute('width', '10');
    banner.setAttribute('color', '#000');
    scene.appendChild(banner);

    // 조명
    const light = document.createElement('a-light');
    light.setAttribute('type', 'directional');
    light.setAttribute('position', '0 5 0');
    light.setAttribute('intensity', '1');
    scene.appendChild(light);
  }

  setupExhibition(event) {
    console.log('🎨 Setting up exhibition...');

    // 작품 로드 및 배치
    this.loadEventArtworks(event.id).then(artworks => {
      this.displayExhibitionArtworks(artworks);
    });

    // 전시 안내판
    this.createExhibitionGuide(event);
  }

  setupLiveAuction(event) {
    console.log('🔨 Setting up live auction...');

    // 경매 무대
    this.createAuctionStage();

    // 경매 아이템 로드
    this.loadAuctionItems(event.id);

    // 실시간 입찰 시스템
    if (window.realtimeAuction) {
      window.realtimeAuction.init();
    }
  }

  setupGuidedTour(event) {
    console.log('🚶 Setting up guided tour...');

    // 투어 경로 생성
    this.createTourPath(event);

    // 큐레이터 아바타
    this.createCuratorAvatar(event.curator);

    // 자동 이동 시스템
    this.enableAutoNavigation();
  }

  setupArtistTalk(event) {
    console.log('🎤 Setting up artist talk...');

    // 강연 무대
    this.createTalkStage();

    // 아티스트 아바타
    this.createSpeakerAvatar(event.curator);

    // Q&A 시스템
    this.enableQASystem();
  }

  async loadEventArtworks(eventId) {
    try {
      const response = await fetch(`/api/events/${eventId}/artworks`);
      const result = await response.json();
      return result.artworks || [];
    } catch (error) {
      console.error('❌ Failed to load event artworks:', error);
      return [];
    }
  }

  displayExhibitionArtworks(artworks) {
    // 원형 배치
    const radius = 8;
    const angleStep = (2 * Math.PI) / artworks.length;

    artworks.forEach((artwork, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const z = -10 + radius * Math.sin(angle);

      const frame = this.createArtworkFrame(artwork, x, 2, z, angle);
      this.eventRoom.appendChild(frame);
    });
  }

  createArtworkFrame(artwork, x, y, z, rotation) {
    const frame = document.createElement('a-entity');
    frame.setAttribute('position', `${x} ${y} ${z}`);
    frame.setAttribute('rotation', `0 ${(rotation * 180 / Math.PI) + 90} 0`);

    const box = document.createElement('a-box');
    box.setAttribute('width', '2');
    box.setAttribute('height', '2');
    box.setAttribute('depth', '0.1');
    box.setAttribute('color', '#8B7355');
    frame.appendChild(box);

    const image = document.createElement('a-image');
    image.setAttribute('src', artwork.image_url);
    image.setAttribute('width', '1.8');
    image.setAttribute('height', '1.8');
    image.setAttribute('position', '0 0 0.06');
    frame.appendChild(image);

    return frame;
  }

  createAuctionStage() {
    const stage = document.createElement('a-box');
    stage.setAttribute('position', '0 0.5 -8');
    stage.setAttribute('width', '5');
    stage.setAttribute('height', '1');
    stage.setAttribute('depth', '3');
    stage.setAttribute('color', '#2C3E50');
    this.eventRoom.appendChild(stage);

    // 경매 디스플레이
    const display = document.createElement('a-plane');
    display.setAttribute('position', '0 2 -8');
    display.setAttribute('width', '4');
    display.setAttribute('height', '3');
    display.setAttribute('color', '#000');
    this.eventRoom.appendChild(display);
  }

  async loadAuctionItems(eventId) {
    try {
      const response = await fetch(`/api/events/${eventId}/auction-items`);
      const result = await response.json();
      
      if (result.items) {
        this.displayAuctionItems(result.items);
      }
    } catch (error) {
      console.error('❌ Failed to load auction items:', error);
    }
  }

  displayAuctionItems(items) {
    // 현재 경매 중인 아이템 표시
    const currentItem = items[0];
    if (!currentItem) return;

    const itemDisplay = document.createElement('a-image');
    itemDisplay.setAttribute('src', currentItem.image_url);
    itemDisplay.setAttribute('position', '0 2 -7.9');
    itemDisplay.setAttribute('width', '3');
    itemDisplay.setAttribute('height', '3');
    this.eventRoom.appendChild(itemDisplay);

    // 현재 입찰가 표시
    const priceText = document.createElement('a-text');
    priceText.setAttribute('value', `Current Bid: ${currentItem.current_bid} ETH`);
    priceText.setAttribute('align', 'center');
    priceText.setAttribute('position', '0 0.5 -7.9');
    priceText.setAttribute('width', '5');
    priceText.setAttribute('color', '#FFD700');
    this.eventRoom.appendChild(priceText);
  }

  createTourPath(event) {
    // 투어 포인트 생성
    const tourPoints = [
      { x: 0, z: -5, label: 'Start' },
      { x: -5, z: -8, label: 'Section A' },
      { x: 5, z: -8, label: 'Section B' },
      { x: 0, z: -12, label: 'Main Gallery' },
      { x: 0, z: -5, label: 'End' }
    ];

    tourPoints.forEach((point, index) => {
      const marker = document.createElement('a-cylinder');
      marker.setAttribute('position', `${point.x} 0.1 ${point.z}`);
      marker.setAttribute('radius', '0.3');
      marker.setAttribute('height', '0.2');
      marker.setAttribute('color', '#0066FF');
      this.eventRoom.appendChild(marker);

      const label = document.createElement('a-text');
      label.setAttribute('value', `${index + 1}. ${point.label}`);
      label.setAttribute('align', 'center');
      label.setAttribute('position', `${point.x} 0.5 ${point.z}`);
      label.setAttribute('width', '2');
      this.eventRoom.appendChild(label);
    });

    this.tourPoints = tourPoints;
    this.currentTourPoint = 0;
  }

  createCuratorAvatar(curatorName) {
    const avatar = document.createElement('a-entity');
    avatar.setAttribute('id', 'curator-avatar');
    avatar.setAttribute('position', '0 1 -6');

    // 간단한 아바타 모델
    const body = document.createElement('a-cylinder');
    body.setAttribute('radius', '0.3');
    body.setAttribute('height', '1.5');
    body.setAttribute('color', '#333');
    avatar.appendChild(body);

    const head = document.createElement('a-sphere');
    head.setAttribute('position', '0 1 0');
    head.setAttribute('radius', '0.25');
    head.setAttribute('color', '#FFD700');
    avatar.appendChild(head);

    // 이름표
    const nameTag = document.createElement('a-text');
    nameTag.setAttribute('value', curatorName);
    nameTag.setAttribute('align', 'center');
    nameTag.setAttribute('position', '0 1.8 0');
    nameTag.setAttribute('width', '2');
    avatar.appendChild(nameTag);

    this.eventRoom.appendChild(avatar);
    return avatar;
  }

  enableAutoNavigation() {
    console.log('🚶 Enabling auto navigation...');

    let currentPoint = 0;
    const navigationInterval = setInterval(() => {
      if (currentPoint >= this.tourPoints.length) {
        clearInterval(navigationInterval);
        console.log('✅ Tour completed');
        this.onTourComplete();
        return;
      }

      const point = this.tourPoints[currentPoint];
      this.moveCameraTo(point.x, 1.6, point.z);
      
      currentPoint++;
    }, 15000); // 각 포인트마다 15초
  }

  moveCameraTo(x, y, z) {
    const camera = this.eventRoom.querySelector('#cameraRig') || 
                   this.eventRoom.querySelector('a-camera');
    
    if (camera) {
      camera.setAttribute('animation', {
        property: 'position',
        to: `${x} ${y} ${z}`,
        dur: 3000,
        easing: 'easeInOutQuad'
      });
    }
  }

  createTalkStage() {
    // 강연 무대
    const stage = document.createElement('a-box');
    stage.setAttribute('position', '0 0.5 -10');
    stage.setAttribute('width', '6');
    stage.setAttribute('height', '1');
    stage.setAttribute('depth', '4');
    stage.setAttribute('color', '#34495E');
    this.eventRoom.appendChild(stage);

    // 프레젠테이션 스크린
    const screen = document.createElement('a-plane');
    screen.setAttribute('position', '0 3 -12');
    screen.setAttribute('width', '8');
    screen.setAttribute('height', '4.5');
    screen.setAttribute('color', '#000');
    this.eventRoom.appendChild(screen);
  }

  createSpeakerAvatar(speakerName) {
    const avatar = document.createElement('a-entity');
    avatar.setAttribute('id', 'speaker-avatar');
    avatar.setAttribute('position', '-2 1 -10');

    const body = document.createElement('a-cylinder');
    body.setAttribute('radius', '0.3');
    body.setAttribute('height', '1.5');
    body.setAttribute('color', '#2C3E50');
    avatar.appendChild(body);

    const head = document.createElement('a-sphere');
    head.setAttribute('position', '0 1 0');
    head.setAttribute('radius', '0.25');
    head.setAttribute('color', '#E74C3C');
    avatar.appendChild(head);

    const nameTag = document.createElement('a-text');
    nameTag.setAttribute('value', speakerName);
    nameTag.setAttribute('align', 'center');
    nameTag.setAttribute('position', '0 1.8 0');
    nameTag.setAttribute('width', '2');
    avatar.appendChild(nameTag);

    this.eventRoom.appendChild(avatar);
    return avatar;
  }

  enableQASystem() {
    console.log('💬 Q&A system enabled');

    // 질문 UI
    const qaPanel = document.createElement('div');
    qaPanel.id = 'qa-panel';
    qaPanel.className = 'event-qa-panel';
    qaPanel.innerHTML = `
      <h3>Ask a Question</h3>
      <textarea id="qa-question" placeholder="Type your question here..."></textarea>
      <button onclick="window.virtualEvents.submitQuestion()">Submit</button>
      <div id="qa-list"></div>
    `;
    document.body.appendChild(qaPanel);
  }

  submitQuestion() {
    const questionInput = document.getElementById('qa-question');
    const question = questionInput.value.trim();

    if (!question) return;

    console.log('❓ Submitting question:', question);

    fetch(`/api/events/${this.currentEvent.id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        questionInput.value = '';
        this.loadQuestions();
      }
    });
  }

  async loadQuestions() {
    const response = await fetch(`/api/events/${this.currentEvent.id}/questions`);
    const result = await response.json();

    if (result.questions) {
      const qaList = document.getElementById('qa-list');
      qaList.innerHTML = result.questions.map(q => `
        <div class="qa-item">
          <p class="question">${q.question}</p>
          ${q.answer ? `<p class="answer">${q.answer}</p>` : ''}
        </div>
      `).join('');
    }
  }

  displayAttendees() {
    console.log('👥 Displaying attendees...');

    // 간단한 아바타 표시
    this.attendees.forEach((attendee, index) => {
      const avatar = this.createAttendeeAvatar(attendee, index);
      this.eventRoom.appendChild(avatar);
    });
  }

  createAttendeeAvatar(attendee, index) {
    const angle = (index * 2 * Math.PI) / this.maxAttendees;
    const radius = 12;
    const x = radius * Math.cos(angle);
    const z = -10 + radius * Math.sin(angle);

    const avatar = document.createElement('a-entity');
    avatar.setAttribute('position', `${x} 1 ${z}`);
    avatar.setAttribute('rotation', `0 ${-angle * 180 / Math.PI} 0`);

    const body = document.createElement('a-cylinder');
    body.setAttribute('radius', '0.2');
    body.setAttribute('height', '1.2');
    body.setAttribute('color', attendee.color || '#3498DB');
    avatar.appendChild(body);

    const head = document.createElement('a-sphere');
    head.setAttribute('position', '0 0.8 0');
    head.setAttribute('radius', '0.15');
    head.setAttribute('color', '#FFF');
    avatar.appendChild(head);

    return avatar;
  }

  enableEventChat() {
    console.log('💬 Event chat enabled');

    // 실시간 채팅 시스템
    if (window.realtimeChat) {
      window.realtimeChat.joinRoom(`event-${this.currentEvent.id}`);
    }
  }

  async setReminder(eventId) {
    console.log(`🔔 Setting reminder for event ${eventId}...`);

    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    try {
      const response = await fetch(`/api/events/${eventId}/reminder`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Reminder set for "${event.title}"`);
        this.trackEvent('reminder_set', { event_id: eventId });

        // 브라우저 알림 권한 요청
        if ('Notification' in window) {
          Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('❌ Failed to set reminder:', error);
    }
  }

  onEventJoined(data) {
    this.attendees.push(data.user);
    console.log(`✅ ${data.user.name} joined the event`);
  }

  onEventLeft(data) {
    this.attendees = this.attendees.filter(a => a.id !== data.user.id);
    console.log(`👋 ${data.user.name} left the event`);
  }

  onTourComplete() {
    console.log('🎉 Tour completed!');
    
    // 완료 배지
    this.awardBadge('tour_completed');
    
    this.trackEvent('tour_completed', { event_id: this.currentEvent.id });
  }

  awardBadge(badgeType) {
    fetch('/api/badges/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_type: badgeType })
    });
  }

  leaveEvent() {
    console.log('👋 Leaving event...');

    if (this.currentEvent) {
      fetch(`/api/events/${this.currentEvent.id}/leave`, {
        method: 'POST'
      });

      this.trackEvent('event_left', { event_id: this.currentEvent.id });
    }

    if (this.eventRoom) {
      this.eventRoom.remove();
      this.eventRoom = null;
    }

    this.currentEvent = null;
  }

  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Virtual_Events',
        ...data
      });
    }
  }

  destroy() {
    this.leaveEvent();
    this.events = [];
    console.log('🗑️ Virtual Events System destroyed');
  }
}

// 글로벌 인스턴스
window.VirtualEventsSystem = VirtualEventsSystem;
window.virtualEvents = null;

// 초기화 함수
window.initVirtualEvents = function() {
  if (!window.virtualEvents) {
    window.virtualEvents = new VirtualEventsSystem();
    console.log('✅ Virtual Events System initialized');
  }
  return window.virtualEvents;
};

console.log('📦 Virtual Events System module loaded');
