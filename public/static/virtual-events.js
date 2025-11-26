/**
 * GALLERYPIA - Virtual Events System
 * Phase 9: Metaverse Integration
 * Virtual Exhibition, Curation, and Live Events in 3D Space
 */

class VirtualEventsSystem {
  constructor() {
    this.events = [];
    this.currentEvent = null;
    this.participants = [];
    this.eventSpace = null;
    this.avatars = new Map();
    this.init();
  }

  init() {
    console.log('🎭 Virtual Events System initializing...');
    this.loadUpcomingEvents();
    this.setupWebSocket();
  }

  setupWebSocket() {
    // 실시간 이벤트 동기화
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/virtual-events`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 Virtual Events WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleEventUpdate(data);
      };

      this.ws.onerror = () => {
        console.log('⚠️ WebSocket error, using polling fallback');
        this.setupPolling();
      };
    } catch (error) {
      console.log('⚠️ WebSocket not available, using polling');
      this.setupPolling();
    }
  }

  setupPolling() {
    // WebSocket 대체: 폴링
    setInterval(() => {
      this.loadUpcomingEvents();
    }, 30000); // 30초마다
  }

  handleEventUpdate(data) {
    switch (data.type) {
      case 'participant_joined':
        this.onParticipantJoined(data.participant);
        break;
      case 'participant_left':
        this.onParticipantLeft(data.participant);
        break;
      case 'event_started':
        this.onEventStarted(data.event);
        break;
      case 'event_ended':
        this.onEventEnded(data.event);
        break;
      case 'curator_action':
        this.onCuratorAction(data.action);
        break;
      default:
        console.log('Unknown event update:', data.type);
    }
  }

  async loadUpcomingEvents() {
    console.log('📅 Loading upcoming virtual events...');

    try {
      const response = await fetch('/api/virtual-events?status=upcoming&limit=20');
      const result = await response.json();

      if (result.success && result.events) {
        this.events = result.events;
        this.displayEventCalendar();
      }
    } catch (error) {
      console.error('❌ Failed to load events:', error);
      this.loadDemoEvents();
    }
  }

  loadDemoEvents() {
    this.events = [
      {
        id: 1,
        title: 'Digital Art Revolution',
        description: 'Explore the future of digital art',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        duration: 120,
        type: 'exhibition',
        curator: 'John Curator',
        max_participants: 100
      },
      {
        id: 2,
        title: 'NFT Masterclass Live',
        description: 'Learn from top NFT artists',
        start_time: new Date(Date.now() + 7200000).toISOString(),
        duration: 90,
        type: 'workshop',
        curator: 'Sarah Artist',
        max_participants: 50
      }
    ];
    this.displayEventCalendar();
  }

  displayEventCalendar() {
    console.log(`📅 ${this.events.length} upcoming events loaded`);
    
    // 이벤트 목록 UI 업데이트 (2D)
    const eventList = document.getElementById('virtual-events-list');
    if (eventList) {
      eventList.innerHTML = this.events.map(event => `
        <div class="virtual-event-card" onclick="window.virtualEvents.joinEvent(${event.id})">
          <h3>${event.title}</h3>
          <p>${event.description}</p>
          <p class="event-time">${new Date(event.start_time).toLocaleString()}</p>
          <p class="event-curator">Curator: ${event.curator}</p>
          <p class="event-participants">${event.max_participants} max participants</p>
          <button class="btn-join-event">Join Virtual Event</button>
        </div>
      `).join('');
    }
  }

  async joinEvent(eventId) {
    console.log(`🚪 Joining event ${eventId}...`);

    try {
      const response = await fetch(`/api/virtual-events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.currentEvent = result.event;
        this.createEventSpace(result.event);
        this.trackEvent('event_joined', { event_id: eventId });
      } else {
        alert(result.message || 'Failed to join event');
      }
    } catch (error) {
      console.error('❌ Failed to join event:', error);
      // 데모 모드로 진입
      this.createDemoEventSpace(eventId);
    }
  }

  createEventSpace(event) {
    console.log(`🏗️ Creating event space: ${event.title}...`);

    // 이벤트 전용 3D 공간 생성
    const eventSpace = document.createElement('a-scene');
    eventSpace.setAttribute('id', `event-space-${event.id}`);
    eventSpace.setAttribute('embedded', '');

    // 환경 설정
    this.setupEventEnvironment(eventSpace, event);

    // 아바타 시스템
    this.createAvatarSystem(eventSpace);

    // 큐레이션 포인트
    this.createCurationPoints(eventSpace, event);

    // 인터랙션 영역
    this.createInteractionZones(eventSpace, event);

    // 컨테이너에 추가
    const container = document.getElementById('event-space-container');
    if (container) {
      container.innerHTML = ''; // 기존 공간 제거
      container.appendChild(eventSpace);
    }

    this.eventSpace = eventSpace;
  }

  createDemoEventSpace(eventId) {
    const demoEvent = this.events.find(e => e.id === eventId) || this.events[0];
    this.currentEvent = demoEvent;
    this.createEventSpace(demoEvent);
  }

  setupEventEnvironment(space, event) {
    // 하늘
    const sky = document.createElement('a-sky');
    sky.setAttribute('color', event.type === 'exhibition' ? '#87CEEB' : '#1a1a2e');
    space.appendChild(sky);

    // 바닥
    const floor = document.createElement('a-plane');
    floor.setAttribute('position', '0 0 0');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '50');
    floor.setAttribute('height', '50');
    floor.setAttribute('color', '#2a2a3e');
    floor.setAttribute('roughness', '0.8');
    space.appendChild(floor);

    // 중앙 무대
    const stage = document.createElement('a-cylinder');
    stage.setAttribute('position', '0 0.1 -10');
    stage.setAttribute('radius', '5');
    stage.setAttribute('height', '0.2');
    stage.setAttribute('color', '#8B4513');
    space.appendChild(stage);

    // 조명
    this.setupEventLighting(space, event);

    // 카메라
    const cameraRig = document.createElement('a-entity');
    cameraRig.setAttribute('position', '0 1.6 10');
    
    const camera = document.createElement('a-camera');
    camera.setAttribute('look-controls', 'enabled: true');
    camera.setAttribute('wasd-controls', 'enabled: true');
    cameraRig.appendChild(camera);
    
    space.appendChild(cameraRig);
  }

  setupEventLighting(space, event) {
    // 주 조명
    const mainLight = document.createElement('a-light');
    mainLight.setAttribute('type', 'directional');
    mainLight.setAttribute('position', '5 15 5');
    mainLight.setAttribute('intensity', '1.0');
    space.appendChild(mainLight);

    // 앰비언트
    const ambient = document.createElement('a-light');
    ambient.setAttribute('type', 'ambient');
    ambient.setAttribute('intensity', '0.6');
    ambient.setAttribute('color', event.type === 'exhibition' ? '#FFF' : '#9370DB');
    space.appendChild(ambient);

    // 무대 스포트라이트
    for (let i = 0; i < 4; i++) {
      const spotlight = document.createElement('a-light');
      spotlight.setAttribute('type', 'spot');
      spotlight.setAttribute('position', `${-10 + i * 7} 8 -10`);
      spotlight.setAttribute('target', '#stage');
      spotlight.setAttribute('intensity', '1.5');
      spotlight.setAttribute('angle', '45');
      space.appendChild(spotlight);
    }
  }

  createAvatarSystem(space) {
    console.log('👤 Creating avatar system...');

    // 자신의 아바타
    const myAvatar = this.createAvatar({
      id: 'me',
      name: localStorage.getItem('username') || 'Guest',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      position: { x: 0, y: 0, z: 5 }
    });

    space.appendChild(myAvatar);
    this.avatars.set('me', myAvatar);

    // 다른 참가자 아바타 (데모)
    this.createDemoAvatars(space);
  }

  createAvatar(participant) {
    const avatar = document.createElement('a-entity');
    avatar.setAttribute('id', `avatar-${participant.id}`);
    avatar.setAttribute('position', `${participant.position.x} ${participant.position.y} ${participant.position.z}`);

    // 몸체 (캡슐 모양)
    const body = document.createElement('a-cylinder');
    body.setAttribute('position', '0 0.8 0');
    body.setAttribute('radius', '0.3');
    body.setAttribute('height', '1.6');
    body.setAttribute('color', participant.color);
    avatar.appendChild(body);

    // 머리
    const head = document.createElement('a-sphere');
    head.setAttribute('position', '0 1.8 0');
    head.setAttribute('radius', '0.25');
    head.setAttribute('color', participant.color);
    avatar.appendChild(head);

    // 이름표
    const nameTag = document.createElement('a-text');
    nameTag.setAttribute('value', participant.name);
    nameTag.setAttribute('align', 'center');
    nameTag.setAttribute('position', '0 2.3 0');
    nameTag.setAttribute('width', '2');
    nameTag.setAttribute('color', '#FFF');
    nameTag.setAttribute('background', '#000');
    avatar.appendChild(nameTag);

    // 이동 애니메이션 (자연스러운 움직임)
    avatar.setAttribute('animation__float', {
      property: 'position',
      to: `${participant.position.x} ${participant.position.y + 0.1} ${participant.position.z}`,
      dir: 'alternate',
      loop: true,
      dur: 2000,
      easing: 'easeInOutSine'
    });

    return avatar;
  }

  createDemoAvatars(space) {
    const demoParticipants = [
      { id: 'p1', name: 'Alice', color: '#FF6B6B', position: { x: -3, y: 0, z: -5 } },
      { id: 'p2', name: 'Bob', color: '#4ECDC4', position: { x: 3, y: 0, z: -5 } },
      { id: 'p3', name: 'Charlie', color: '#FFD93D', position: { x: -5, y: 0, z: 0 } },
      { id: 'p4', name: 'Diana', color: '#95E1D3', position: { x: 5, y: 0, z: 0 } }
    ];

    demoParticipants.forEach(p => {
      const avatar = this.createAvatar(p);
      space.appendChild(avatar);
      this.avatars.set(p.id, avatar);
    });
  }

  createCurationPoints(space, event) {
    console.log('🎨 Creating curation points...');

    // 큐레이션 포인트: 큐레이터가 설명하는 작품 위치
    const curationPoints = [
      { position: '-8 1.5 -8', title: 'Featured Collection' },
      { position: '8 1.5 -8', title: 'Rising Stars' },
      { position: '-8 1.5 -12', title: 'Digital Pioneers' },
      { position: '8 1.5 -12', title: 'Abstract Masters' }
    ];

    curationPoints.forEach((point, index) => {
      const marker = document.createElement('a-entity');
      marker.setAttribute('position', point.position);

      // 마커 실린더
      const cylinder = document.createElement('a-cylinder');
      cylinder.setAttribute('radius', '0.5');
      cylinder.setAttribute('height', '2.5');
      cylinder.setAttribute('color', '#FFD700');
      cylinder.setAttribute('opacity', '0.5');
      marker.appendChild(cylinder);

      // 타이틀
      const title = document.createElement('a-text');
      title.setAttribute('value', point.title);
      title.setAttribute('align', 'center');
      title.setAttribute('position', '0 1.5 0');
      title.setAttribute('width', '3');
      title.setAttribute('color', '#FFF');
      title.setAttribute('background', '#000');
      marker.appendChild(title);

      // 회전 애니메이션
      marker.setAttribute('animation', {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 10000,
        easing: 'linear'
      });

      // 클릭 이벤트
      marker.setAttribute('class', 'clickable');
      marker.addEventListener('click', () => {
        this.onCurationPointClick(index, point);
      });

      space.appendChild(marker);
    });
  }

  createInteractionZones(space, event) {
    console.log('⚡ Creating interaction zones...');

    // 소셜 존 (참가자들이 모일 수 있는 공간)
    const socialZone = document.createElement('a-entity');
    socialZone.setAttribute('position', '0 0 15');

    const socialMarker = document.createElement('a-ring');
    socialMarker.setAttribute('radius-inner', '3');
    socialMarker.setAttribute('radius-outer', '3.5');
    socialMarker.setAttribute('color', '#00FF00');
    socialMarker.setAttribute('rotation', '-90 0 0');
    socialMarker.setAttribute('position', '0 0.05 0');
    socialZone.appendChild(socialMarker);

    const socialText = document.createElement('a-text');
    socialText.setAttribute('value', 'Social Zone\nChat & Network');
    socialText.setAttribute('align', 'center');
    socialText.setAttribute('position', '0 0.1 0');
    socialText.setAttribute('rotation', '-90 0 0');
    socialText.setAttribute('width', '5');
    socialText.setAttribute('color', '#00FF00');
    socialZone.appendChild(socialText);

    space.appendChild(socialZone);

    // 퀴즈 존 (이벤트 관련 퀴즈)
    const quizZone = document.createElement('a-entity');
    quizZone.setAttribute('position', '-15 0 -10');

    const quizMarker = document.createElement('a-ring');
    quizMarker.setAttribute('radius-inner', '2');
    quizMarker.setAttribute('radius-outer', '2.5');
    quizMarker.setAttribute('color', '#FF00FF');
    quizMarker.setAttribute('rotation', '-90 0 0');
    quizMarker.setAttribute('position', '0 0.05 0');
    quizZone.appendChild(quizMarker);

    const quizText = document.createElement('a-text');
    quizText.setAttribute('value', 'Quiz Zone\nTest Your Knowledge');
    quizText.setAttribute('align', 'center');
    quizText.setAttribute('position', '0 0.1 0');
    quizText.setAttribute('rotation', '-90 0 0');
    quizText.setAttribute('width', '4');
    quizText.setAttribute('color', '#FF00FF');
    quizZone.appendChild(quizText);

    quizZone.setAttribute('class', 'clickable');
    quizZone.addEventListener('click', () => {
      this.startEventQuiz();
    });

    space.appendChild(quizZone);

    // NFT 민팅 존
    const mintZone = document.createElement('a-entity');
    mintZone.setAttribute('position', '15 0 -10');

    const mintMarker = document.createElement('a-ring');
    mintMarker.setAttribute('radius-inner', '2');
    mintMarker.setAttribute('radius-outer', '2.5');
    mintMarker.setAttribute('color', '#FFA500');
    mintMarker.setAttribute('rotation', '-90 0 0');
    mintMarker.setAttribute('position', '0 0.05 0');
    mintZone.appendChild(mintMarker);

    const mintText = document.createElement('a-text');
    mintText.setAttribute('value', 'Minting Zone\nCreate Your NFT');
    mintText.setAttribute('align', 'center');
    mintText.setAttribute('position', '0 0.1 0');
    mintText.setAttribute('rotation', '-90 0 0');
    mintText.setAttribute('width', '4');
    mintText.setAttribute('color', '#FFA500');
    mintZone.appendChild(mintText);

    mintZone.setAttribute('class', 'clickable');
    mintZone.addEventListener('click', () => {
      window.location.href = '/mint-nft.html';
    });

    space.appendChild(mintZone);
  }

  onCurationPointClick(index, point) {
    console.log(`🎨 Curation point ${index} clicked: ${point.title}`);

    // 큐레이터 설명 표시
    this.showCuratorNarration(point);

    this.trackEvent('curation_point_clicked', {
      point_index: index,
      point_title: point.title
    });
  }

  showCuratorNarration(point) {
    // 큐레이터 음성/텍스트 설명
    const narration = document.createElement('div');
    narration.className = 'curator-narration-overlay';
    narration.innerHTML = `
      <div class="curator-narration-content">
        <h3>🎤 Curator's Note</h3>
        <h2>${point.title}</h2>
        <p>This collection showcases the finest examples of ${point.title.toLowerCase()}...</p>
        <p>Each piece has been carefully selected for its unique artistic vision and technical excellence.</p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(narration);
  }

  startEventQuiz() {
    console.log('🎯 Starting event quiz...');

    const quiz = {
      questions: [
        {
          question: 'What does NFT stand for?',
          options: ['Non-Fungible Token', 'New Finance Technology', 'Network File Transfer'],
          correct: 0
        },
        {
          question: 'Which blockchain is most popular for NFTs?',
          options: ['Bitcoin', 'Ethereum', 'Litecoin'],
          correct: 1
        }
      ]
    };

    // 퀴즈 UI 표시
    this.displayQuizUI(quiz);
  }

  displayQuizUI(quiz) {
    const quizOverlay = document.createElement('div');
    quizOverlay.className = 'event-quiz-overlay';
    quizOverlay.innerHTML = `
      <div class="quiz-content">
        <h2>📝 Event Quiz</h2>
        <div id="quiz-questions"></div>
        <button onclick="window.virtualEvents.submitQuiz()">Submit</button>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;

    const questionsDiv = quizOverlay.querySelector('#quiz-questions');
    quiz.questions.forEach((q, i) => {
      questionsDiv.innerHTML += `
        <div class="quiz-question">
          <p><strong>Q${i + 1}:</strong> ${q.question}</p>
          ${q.options.map((opt, j) => `
            <label>
              <input type="radio" name="q${i}" value="${j}">
              ${opt}
            </label>
          `).join('')}
        </div>
      `;
    });

    document.body.appendChild(quizOverlay);
  }

  submitQuiz() {
    console.log('✅ Quiz submitted');
    alert('Quiz submitted! You earned 10 points.');
    this.trackEvent('quiz_completed');
  }

  onParticipantJoined(participant) {
    console.log(`👋 ${participant.name} joined the event`);

    // 새 아바타 생성
    const avatar = this.createAvatar(participant);
    this.eventSpace.appendChild(avatar);
    this.avatars.set(participant.id, avatar);

    // 알림
    this.showNotification(`${participant.name} joined the event`);
  }

  onParticipantLeft(participant) {
    console.log(`👋 ${participant.name} left the event`);

    // 아바타 제거
    const avatar = this.avatars.get(participant.id);
    if (avatar) {
      avatar.remove();
      this.avatars.delete(participant.id);
    }

    this.showNotification(`${participant.name} left the event`);
  }

  onEventStarted(event) {
    console.log(`🎬 Event started: ${event.title}`);
    this.showNotification(`Event "${event.title}" has started!`, 'success');
  }

  onEventEnded(event) {
    console.log(`🏁 Event ended: ${event.title}`);
    this.showNotification(`Event "${event.title}" has ended. Thank you for participating!`, 'info');
  }

  onCuratorAction(action) {
    console.log('🎨 Curator action:', action.type);

    switch (action.type) {
      case 'highlight_artwork':
        this.highlightArtwork(action.artwork_id);
        break;
      case 'start_tour':
        this.startGuidedTour(action.tour_data);
        break;
      case 'enable_chat':
        this.enableEventChat();
        break;
    }
  }

  highlightArtwork(artworkId) {
    // 작품 하이라이트 효과
    const artwork = this.eventSpace.querySelector(`#artwork-${artworkId}`);
    if (artwork) {
      artwork.setAttribute('animation__highlight', {
        property: 'scale',
        to: '1.2 1.2 1.2',
        dur: 500,
        dir: 'alternate',
        loop: 3
      });
    }
  }

  startGuidedTour(tourData) {
    console.log('🚶 Starting guided tour...');
    // 가이드 투어 시작
    this.showNotification('Guided tour starting...', 'info');
  }

  enableEventChat() {
    console.log('💬 Event chat enabled');
    // 이벤트 채팅 활성화
    this.showNotification('Event chat is now enabled', 'success');
  }

  showNotification(message, type = 'info') {
    // 간단한 토스트 알림
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  leaveEvent() {
    console.log('🚪 Leaving event...');

    if (this.currentEvent) {
      fetch(`/api/virtual-events/${this.currentEvent.id}/leave`, {
        method: 'POST'
      }).catch(err => console.error(err));

      this.trackEvent('event_left', { event_id: this.currentEvent.id });
    }

    if (this.eventSpace) {
      this.eventSpace.remove();
      this.eventSpace = null;
    }

    this.avatars.clear();
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
    if (this.ws) {
      this.ws.close();
    }
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
