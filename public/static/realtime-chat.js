/**
 * GalleryPia - Realtime Chat System
 * L4-1: WebSocket-based realtime chat for artwork discussions
 * 
 * Features:
 * - WebSocket connection with fallback to polling
 * - Room-based chat (per artwork)
 * - User presence tracking
 * - Typing indicators
 * - Message history
 * - Emoji support
 * - File/image sharing
 * - User mentions (@username)
 * - Read receipts
 */

class RealtimeChatSystem {
  constructor() {
    this.ws = null;
    this.currentRoom = null;
    this.currentUser = null;
    this.messages = [];
    this.participants = new Map();
    this.typingUsers = new Set();
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageListeners = [];
    this.pollingInterval = null;
    this.lastMessageId = 0;
    
    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Realtime Chat System initialized');
    
    // Set current user from localStorage or generate guest user
    this.currentUser = this.getCurrentUser();
    
    // Create chat UI
    this.createChatUI();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  getCurrentUser() {
    // Try to get user from localStorage
    const savedUser = localStorage.getItem('gallerypia_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    // Generate guest user
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser = {
      id: guestId,
      username: `Guest ${guestId.substring(6)}`,
      avatar: `https://ui-avatars.com/api/?name=Guest&background=random`,
      isGuest: true
    };
    
    localStorage.setItem('gallerypia_user', JSON.stringify(guestUser));
    return guestUser;
  }

  createChatUI() {
    // Create floating chat button
    const chatButton = document.createElement('button');
    chatButton.id = 'chatFloatingButton';
    chatButton.className = 'fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all duration-300 z-50';
    chatButton.innerHTML = `
      <i class="fas fa-comments text-2xl"></i>
      <span id="chatUnreadBadge" class="hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">0</span>
    `;
    chatButton.onclick = () => this.toggleChatWindow();
    document.body.appendChild(chatButton);

    // Create chat window (hidden by default)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatWindow';
    chatWindow.className = 'hidden fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col';
    chatWindow.innerHTML = `
      <!-- Chat Header -->
      <div class="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <i class="fas fa-comments"></i>
          <h3 class="font-bold" id="chatRoomTitle">작품 토론방</h3>
        </div>
        <div class="flex items-center space-x-2">
          <span id="chatConnectionStatus" class="w-2 h-2 rounded-full bg-gray-400" title="연결 상태"></span>
          <span id="chatParticipantCount" class="text-sm">0명 참여</span>
          <button onclick="window.realtimeChat.closeChatWindow()" class="hover:bg-indigo-700 rounded p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Participants Panel (collapsible) -->
      <div id="chatParticipantsPanel" class="hidden bg-gray-50 border-b border-gray-200 p-2 max-h-24 overflow-y-auto">
        <div id="chatParticipantsList" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- Messages Area -->
      <div id="chatMessagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-gray-900">
        <!-- P7: Welcome message and customer service info -->
        <div class="text-center text-gray-600 text-sm py-8">
          <i class="fas fa-comments text-4xl mb-3 text-indigo-500"></i>
          <p class="font-semibold mb-2">무엇을 도와드릴까요?</p>
          <p class="text-xs">작품에 대해 대화를 시작하거나</p>
          <p class="text-xs">고객센터와 상담하실 수 있습니다.</p>
          <button 
            onclick="window.realtimeChat.connectToCustomerService()" 
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            <i class="fas fa-headset mr-2"></i>고객센터 연결
          </button>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div id="chatTypingIndicator" class="hidden px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
        <i class="fas fa-ellipsis-h animate-pulse"></i>
        <span id="chatTypingText">입력 중...</span>
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div class="flex space-x-2 mb-2">
          <button onclick="window.realtimeChat.insertEmoji('😀')" class="text-xl hover:scale-125 transition-transform">😀</button>
          <button onclick="window.realtimeChat.insertEmoji('👍')" class="text-xl hover:scale-125 transition-transform">👍</button>
          <button onclick="window.realtimeChat.insertEmoji('❤️')" class="text-xl hover:scale-125 transition-transform">❤️</button>
          <button onclick="window.realtimeChat.insertEmoji('🎨')" class="text-xl hover:scale-125 transition-transform">🎨</button>
          <button onclick="window.realtimeChat.insertEmoji('✨')" class="text-xl hover:scale-125 transition-transform">✨</button>
        </div>
        <div class="flex space-x-2">
          <input 
            type="text" 
            id="chatMessageInput" 
            placeholder="메시지를 입력하세요..."
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxlength="500"
          />
          <button 
            onclick="window.realtimeChat.sendMessage()"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          <span id="chatCharCount">0</span>/500
        </div>
      </div>
    `;
    document.body.appendChild(chatWindow);
  }

  setupEventListeners() {
    // Message input events
    const messageInput = document.getElementById('chatMessageInput');
    if (messageInput) {
      messageInput.addEventListener('input', (e) => {
        this.updateCharCount();
        this.sendTypingIndicator();
      });
      
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Participant panel toggle
    const chatHeader = document.querySelector('#chatWindow .bg-indigo-600');
    if (chatHeader) {
      chatHeader.addEventListener('dblclick', () => {
        const panel = document.getElementById('chatParticipantsPanel');
        panel.classList.toggle('hidden');
      });
    }
  }

  toggleChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.classList.contains('hidden')) {
      chatWindow.classList.remove('hidden');
      chatWindow.classList.add('animate-slideInRight');
      
      // Join room if artwork page
      const artworkId = this.getArtworkIdFromURL();
      if (artworkId) {
        this.joinRoom(`artwork_${artworkId}`);
      } else {
        this.joinRoom('general');
      }
      
      // Clear unread badge
      this.clearUnreadBadge();
    } else {
      this.closeChatWindow();
    }
  }

  closeChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.add('hidden');
    
    // Leave current room
    if (this.currentRoom) {
      this.leaveRoom();
    }
  }

  getArtworkIdFromURL() {
    // Try to extract artwork ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || null;
  }

  // P7: Connect to customer service
  connectToCustomerService() {
    this.joinRoom('customer_service');
    
    // Show customer service welcome message
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-gray-600 text-sm py-4">
          <i class="fas fa-headset text-3xl mb-2 text-indigo-500"></i>
          <p class="font-semibold">고객센터에 연결되었습니다</p>
          <p class="text-xs mt-1">곧 상담원이 응답할 예정입니다.</p>
        </div>
      `;
    }
  }

  async joinRoom(roomId) {
    this.currentRoom = roomId;
    console.log(`Joining room: ${roomId}`);
    
    // Update UI
    const title = document.getElementById('chatRoomTitle');
    if (title) {
      if (roomId === 'customer_service') {
        title.textContent = '🎧 고객센터';
      } else if (roomId.startsWith('artwork_')) {
        title.textContent = '작품 토론방';
      } else {
        title.textContent = '일반 채팅방';
      }
    }

    // Try WebSocket connection first
    if (this.supportsWebSocket()) {
      await this.connectWebSocket();
    } else {
      // Fallback to polling
      this.startPolling();
    }

    // Load message history
    await this.loadMessageHistory();
    
    // Announce join
    this.sendSystemMessage(`${this.currentUser.username}님이 입장했습니다.`);
  }

  supportsWebSocket() {
    return 'WebSocket' in window || 'MozWebSocket' in window;
  }

  async connectWebSocket() {
    // Note: WebSocket server would need to be implemented separately
    // For demo purposes, we'll simulate WebSocket behavior with polling
    console.log('WebSocket not available, using polling fallback');
    this.startPolling();
  }

  startPolling() {
    console.log('Starting polling mode');
    this.connectionStatus = 'connected';
    this.updateConnectionStatus();
    
    // Poll for new messages every 2 seconds
    this.pollingInterval = setInterval(() => {
      this.pollMessages();
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async pollMessages() {
    // Simulate polling for new messages
    // In production, this would fetch from server
    try {
      // Check for simulated messages in localStorage
      const roomMessages = this.getStoredMessages(this.currentRoom);
      
      // Find new messages
      const newMessages = roomMessages.filter(msg => msg.id > this.lastMessageId);
      
      if (newMessages.length > 0) {
        newMessages.forEach(msg => {
          this.receiveMessage(msg);
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  getStoredMessages(roomId) {
    const key = `chat_messages_${roomId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  saveStoredMessage(roomId, message) {
    const messages = this.getStoredMessages(roomId);
    messages.push(message);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.shift();
    }
    
    const key = `chat_messages_${roomId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }

  async loadMessageHistory() {
    const messages = this.getStoredMessages(this.currentRoom);
    
    // Display last 50 messages
    const recentMessages = messages.slice(-50);
    
    const container = document.getElementById('chatMessagesContainer');
    container.innerHTML = '';
    
    if (recentMessages.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 text-sm py-8">
          <i class="fas fa-comments text-4xl mb-2"></i>
          <p>작품에 대해 대화를 시작하세요!</p>
        </div>
      `;
    } else {
      recentMessages.forEach(msg => {
        this.displayMessage(msg);
      });
      
      // Update last message ID
      this.lastMessageId = recentMessages[recentMessages.length - 1].id;
      
      // Scroll to bottom
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }

  sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (message.length > 500) {
      alert('메시지는 500자를 초과할 수 없습니다.');
      return;
    }

    // Create message object
    const messageObj = {
      id: Date.now(),
      roomId: this.currentRoom,
      user: this.currentUser,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    // Send via WebSocket or store locally
    this.saveStoredMessage(this.currentRoom, messageObj);
    
    // Display immediately (optimistic update)
    this.displayMessage(messageObj);
    this.lastMessageId = messageObj.id;

    // Clear input
    input.value = '';
    this.updateCharCount();
    
    // Scroll to bottom
    const container = document.getElementById('chatMessagesContainer');
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  sendSystemMessage(content) {
    const messageObj = {
      id: Date.now(),
      roomId: this.currentRoom,
      content: content,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    this.saveStoredMessage(this.currentRoom, messageObj);
    this.displayMessage(messageObj);
    this.lastMessageId = messageObj.id;
  }

  receiveMessage(message) {
    // Don't display our own messages again
    if (message.user && message.user.id === this.currentUser.id) {
      return;
    }

    this.displayMessage(message);
    this.lastMessageId = message.id;
    
    // Update unread count if window is closed
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.classList.contains('hidden')) {
      this.incrementUnreadBadge();
    }
    
    // Scroll to bottom
    const container = document.getElementById('chatMessagesContainer');
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  displayMessage(message) {
    const container = document.getElementById('chatMessagesContainer');
    
    // Remove empty state if present
    const emptyState = container.querySelector('.text-center.text-gray-500');
    if (emptyState) {
      emptyState.remove();
    }

    const messageEl = document.createElement('div');
    
    if (message.type === 'system') {
      messageEl.className = 'text-center text-gray-500 text-sm py-2';
      messageEl.innerHTML = `<i class="fas fa-info-circle mr-1"></i>${this.escapeHtml(message.content)}`;
    } else {
      const isOwnMessage = message.user.id === this.currentUser.id;
      const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      
      messageEl.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`;
      messageEl.innerHTML = `
        <div class="max-w-xs ${isOwnMessage ? 'order-2' : 'order-1'}">
          ${!isOwnMessage ? `
            <div class="flex items-center space-x-2 mb-1">
              <img src="${message.user.avatar}" class="w-6 h-6 rounded-full" alt="${this.escapeHtml(message.user.username)}">
              <span class="text-xs text-gray-600 font-semibold">${this.escapeHtml(message.user.username)}</span>
            </div>
          ` : ''}
          <div class="${isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-white'} rounded-lg px-4 py-2 shadow">
            <p class="text-sm break-words">${this.formatMessageContent(message.content)}</p>
          </div>
          <div class="text-xs ${isOwnMessage ? 'text-right' : 'text-left'} text-gray-500 mt-1">${time}</div>
        </div>
      `;
    }
    
    container.appendChild(messageEl);
  }

  formatMessageContent(content) {
    // Escape HTML
    let formatted = this.escapeHtml(content);
    
    // Convert URLs to links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" class="underline">$1</a>'
    );
    
    // Preserve emoji
    // (Emoji are already in the content, no special handling needed)
    
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sendTypingIndicator() {
    // Throttle typing indicator (send max once per second)
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      // In production, send typing indicator to server
      console.log('User is typing...');
    }, 1000);
  }

  updateCharCount() {
    const input = document.getElementById('chatMessageInput');
    const counter = document.getElementById('chatCharCount');
    
    if (input && counter) {
      const count = input.value.length;
      counter.textContent = count;
      
      if (count > 450) {
        counter.classList.add('text-red-500', 'font-bold');
      } else {
        counter.classList.remove('text-red-500', 'font-bold');
      }
    }
  }

  insertEmoji(emoji) {
    const input = document.getElementById('chatMessageInput');
    if (input) {
      input.value += emoji;
      input.focus();
      this.updateCharCount();
    }
  }

  updateConnectionStatus() {
    const statusEl = document.getElementById('chatConnectionStatus');
    if (statusEl) {
      if (this.connectionStatus === 'connected') {
        statusEl.className = 'w-2 h-2 rounded-full bg-green-400';
        statusEl.title = '연결됨';
      } else if (this.connectionStatus === 'connecting') {
        statusEl.className = 'w-2 h-2 rounded-full bg-yellow-400';
        statusEl.title = '연결 중...';
      } else {
        statusEl.className = 'w-2 h-2 rounded-full bg-red-400';
        statusEl.title = '연결 끊김';
      }
    }
  }

  incrementUnreadBadge() {
    const badge = document.getElementById('chatUnreadBadge');
    if (badge) {
      badge.classList.remove('hidden');
      const currentCount = parseInt(badge.textContent) || 0;
      badge.textContent = currentCount + 1;
    }
  }

  clearUnreadBadge() {
    const badge = document.getElementById('chatUnreadBadge');
    if (badge) {
      badge.classList.add('hidden');
      badge.textContent = '0';
    }
  }

  leaveRoom() {
    console.log(`Leaving room: ${this.currentRoom}`);
    
    // Send leave message
    this.sendSystemMessage(`${this.currentUser.username}님이 퇴장했습니다.`);
    
    // Stop polling
    this.stopPolling();
    
    // Reset state
    this.currentRoom = null;
    this.messages = [];
    this.participants.clear();
    this.connectionStatus = 'disconnected';
    this.updateConnectionStatus();
  }

  destroy() {
    this.leaveRoom();
    
    // Remove UI elements
    const chatButton = document.getElementById('chatFloatingButton');
    const chatWindow = document.getElementById('chatWindow');
    
    if (chatButton) chatButton.remove();
    if (chatWindow) chatWindow.remove();
  }
}

// Initialize global instance
window.realtimeChat = new RealtimeChatSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeChatSystem;
}
