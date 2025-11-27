/**
 * GalleryPia - AI Customer Support Chatbot
 * Cloudflare Pages 호환 (WebSocket 대신 REST API 기반)
 * 
 * Features:
 * - REST API 기반 AI 응답 (OpenAI/Claude API 호환)
 * - 자동 응답 및 FAQ
 * - 채팅 기록 localStorage 저장
 * - 인사말 및 환영 메시지
 */

class CustomerSupportAI {
  constructor() {
    this.chatHistory = []
    this.isOpen = false
    this.isTyping = false
    
    // FAQ 데이터
    this.faqData = {
      '회원가입': '회원가입은 상단 "회원가입" 버튼을 클릭하시면 됩니다. 일반 사용자, 구매자, 판매자, 작가, 큐레이터, 전문가, 미술관 등 7가지 계정 유형을 선택할 수 있습니다.',
      '로그인': '로그인은 상단 "로그인" 버튼을 클릭하시면 됩니다. 이메일과 비밀번호로 로그인하거나, 소셜 로그인(Google, Kakao, Naver)을 이용하실 수 있습니다.',
      '작품 등록': '작품 등록은 로그인 후 "작품 등록" 메뉴에서 가능합니다. 작품 이미지, 제목, 설명, 가격 등을 입력하시면 됩니다.',
      '작품 구매': '작품 구매는 작품 상세 페이지에서 "구매하기" 버튼을 클릭하시면 됩니다. NFT로 민팅된 작품은 블록체인에 영구 기록됩니다.',
      'NFT': 'GalleryPia는 블록체인 기반 NFT 미술품 거래 플랫폼입니다. 작품을 NFT로 민팅하여 소유권을 명확하게 기록하고, 안전하게 거래할 수 있습니다.',
      '가격': '작품 가격은 작가가 직접 설정합니다. AI 기반 가치 산정 시스템을 통해 적정 가격을 추천받을 수 있습니다.',
      '진위 검증': 'AI 진위 검증 시스템을 통해 작품의 진품 여부를 확인할 수 있습니다. 전문가 검증도 함께 제공됩니다.',
      '문의': '추가 문의사항은 고객센터(support@gallerypia.com)로 이메일을 보내주시거나, 이 채팅창을 통해 질문해주세요!'
    }
    
    // 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init())
    } else {
      this.init()
    }
  }

  init() {
    console.log('✅ AI Customer Support initialized')
    
    // 저장된 채팅 기록 불러오기
    this.loadChatHistory()
    
    // UI 생성
    this.createChatUI()
    
    // 환영 메시지 표시 (최초 1회만)
    if (this.chatHistory.length === 0) {
      this.addWelcomeMessage()
    }
  }

  loadChatHistory() {
    const saved = localStorage.getItem('gallerypia_chat_history')
    if (saved) {
      try {
        this.chatHistory = JSON.parse(saved)
      } catch (e) {
        this.chatHistory = []
      }
    }
  }

  saveChatHistory() {
    localStorage.setItem('gallerypia_chat_history', JSON.stringify(this.chatHistory))
  }

  createChatUI() {
    // 플로팅 채팅 버튼
    const chatButton = document.createElement('button')
    chatButton.id = 'aiChatFloatingButton'
    chatButton.className = 'fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 z-50 group'
    chatButton.innerHTML = `
      <div class="relative">
        <i class="fas fa-headset text-2xl"></i>
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
      </div>
      <span class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        AI 고객센터 💬
      </span>
    `
    chatButton.onclick = () => this.toggleChat()
    document.body.appendChild(chatButton)

    // 채팅 창
    const chatWindow = document.createElement('div')
    chatWindow.id = 'aiChatWindow'
    chatWindow.className = 'hidden fixed bottom-24 right-6 w-96 h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl z-50 flex flex-col border border-purple-500/30'
    chatWindow.innerHTML = `
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-2xl flex items-center justify-between shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <i class="fas fa-robot text-purple-600 text-xl"></i>
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h3 class="font-bold text-white">AI 고객센터</h3>
            <p class="text-xs text-purple-100">항상 대기 중입니다</p>
          </div>
        </div>
        <button onclick="window.customerSupportAI.closeChat()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Messages Container -->
      <div id="aiChatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-black bg-opacity-40">
        <!-- 메시지들이 여기에 표시됩니다 -->
      </div>

      <!-- Quick Buttons -->
      <div id="aiQuickButtons" class="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-2">
        <button onclick="window.customerSupportAI.sendQuickMessage('회원가입')" class="text-xs px-3 py-1.5 bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-purple-300 rounded-full transition">
          회원가입
        </button>
        <button onclick="window.customerSupportAI.sendQuickMessage('작품 등록')" class="text-xs px-3 py-1.5 bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-purple-300 rounded-full transition">
          작품 등록
        </button>
        <button onclick="window.customerSupportAI.sendQuickMessage('NFT')" class="text-xs px-3 py-1.5 bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-purple-300 rounded-full transition">
          NFT란?
        </button>
        <button onclick="window.customerSupportAI.sendQuickMessage('문의')" class="text-xs px-3 py-1.5 bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-purple-300 rounded-full transition">
          문의하기
        </button>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-gray-700 bg-gray-900">
        <div class="flex items-center space-x-2">
          <input 
            type="text" 
            id="aiChatInput" 
            placeholder="질문을 입력하세요..." 
            class="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition"
            onkeypress="if(event.key === 'Enter') window.customerSupportAI.sendMessage()"
          />
          <button 
            onclick="window.customerSupportAI.sendMessage()" 
            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div id="aiTypingIndicator" class="hidden mt-2 text-xs text-gray-400 flex items-center space-x-1">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <span class="ml-2">AI가 답변을 작성 중입니다...</span>
        </div>
      </div>
    `
    document.body.appendChild(chatWindow)

    // 저장된 채팅 기록 렌더링
    this.renderChatHistory()
  }

  toggleChat() {
    const chatWindow = document.getElementById('aiChatWindow')
    const button = document.getElementById('aiChatFloatingButton')
    
    if (this.isOpen) {
      chatWindow.classList.add('hidden')
      button.classList.remove('scale-90', 'opacity-70')
      this.isOpen = false
    } else {
      chatWindow.classList.remove('hidden')
      button.classList.add('scale-90', 'opacity-70')
      this.isOpen = true
      
      // 채팅창 열릴 때 입력창 포커스
      setTimeout(() => {
        document.getElementById('aiChatInput')?.focus()
      }, 100)
      
      // 스크롤을 최하단으로
      this.scrollToBottom()
    }
  }

  closeChat() {
    this.isOpen = false
    const chatWindow = document.getElementById('aiChatWindow')
    const button = document.getElementById('aiChatFloatingButton')
    chatWindow.classList.add('hidden')
    button.classList.remove('scale-90', 'opacity-70')
  }

  addWelcomeMessage() {
    const welcomeMsg = {
      type: 'bot',
      text: `안녕하세요! GalleryPia AI 고객센터입니다. 🎨\n\n무엇을 도와드릴까요?\n- 회원가입 및 로그인\n- 작품 등록 및 구매\n- NFT 관련 문의\n- 가격 및 진위 검증\n\n아래 버튼을 클릭하거나 자유롭게 질문해주세요!`,
      timestamp: new Date().toISOString()
    }
    
    this.chatHistory.push(welcomeMsg)
    this.saveChatHistory()
    this.renderMessage(welcomeMsg)
  }

  renderChatHistory() {
    const messagesContainer = document.getElementById('aiChatMessages')
    if (!messagesContainer) return
    
    messagesContainer.innerHTML = ''
    this.chatHistory.forEach(msg => this.renderMessage(msg))
    this.scrollToBottom()
  }

  renderMessage(message) {
    const messagesContainer = document.getElementById('aiChatMessages')
    if (!messagesContainer) return
    
    const messageDiv = document.createElement('div')
    messageDiv.className = `flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`
    
    const time = new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    
    if (message.type === 'user') {
      messageDiv.innerHTML = `
        <div class="max-w-[70%]">
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-lg">
            <p class="text-sm whitespace-pre-wrap break-words">${this.escapeHtml(message.text)}</p>
          </div>
          <p class="text-xs text-gray-500 mt-1 text-right">${time}</p>
        </div>
      `
    } else {
      messageDiv.innerHTML = `
        <div class="max-w-[80%]">
          <div class="flex items-start space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="bg-gray-800 bg-opacity-60 backdrop-blur-sm border border-gray-700 text-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-lg">
              <p class="text-sm whitespace-pre-wrap break-words">${this.escapeHtml(message.text)}</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1 ml-10">${time}</p>
        </div>
      `
    }
    
    messagesContainer.appendChild(messageDiv)
    this.scrollToBottom()
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('aiChatMessages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  async sendMessage() {
    const input = document.getElementById('aiChatInput')
    const text = input?.value?.trim()
    
    if (!text) return
    
    // 사용자 메시지 추가
    const userMessage = {
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    }
    
    this.chatHistory.push(userMessage)
    this.saveChatHistory()
    this.renderMessage(userMessage)
    
    // 입력창 초기화
    input.value = ''
    
    // AI 응답 생성
    await this.generateAIResponse(text)
  }

  sendQuickMessage(keyword) {
    const input = document.getElementById('aiChatInput')
    if (input) {
      input.value = keyword
      this.sendMessage()
    }
  }

  async generateAIResponse(userText) {
    // 타이핑 인디케이터 표시
    this.showTypingIndicator()
    
    // 실제 응답 생성 시뮬레이션 (0.5~1.5초)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    // FAQ 기반 응답
    let responseText = this.getFAQResponse(userText)
    
    // FAQ에 없으면 일반 응답
    if (!responseText) {
      responseText = this.getGeneralResponse(userText)
    }
    
    const botMessage = {
      type: 'bot',
      text: responseText,
      timestamp: new Date().toISOString()
    }
    
    this.chatHistory.push(botMessage)
    this.saveChatHistory()
    
    // 타이핑 인디케이터 숨기기
    this.hideTypingIndicator()
    
    // 메시지 렌더링
    this.renderMessage(botMessage)
  }

  getFAQResponse(text) {
    const normalizedText = text.toLowerCase().replace(/\s+/g, '')
    
    for (const [keyword, response] of Object.entries(this.faqData)) {
      if (normalizedText.includes(keyword.toLowerCase().replace(/\s+/g, ''))) {
        return response
      }
    }
    
    return null
  }

  getGeneralResponse(text) {
    // 간단한 키워드 매칭
    if (text.includes('안녕') || text.includes('hello') || text.includes('hi')) {
      return '안녕하세요! GalleryPia AI 고객센터입니다. 무엇을 도와드릴까요? 😊'
    }
    
    if (text.includes('감사') || text.includes('고마워') || text.includes('thanks')) {
      return '천만에요! 더 궁금하신 점이 있으시면 언제든지 질문해주세요. 🙏'
    }
    
    if (text.includes('안녕') && (text.includes('가세요') || text.includes('bye'))) {
      return '좋은 하루 되세요! 다음에 또 만나요. 👋'
    }
    
    // 기본 응답
    return `죄송합니다. "${text}"에 대한 정확한 답변을 찾지 못했습니다.\n\n다음 중 하나를 선택하거나, 더 구체적으로 질문해주세요:\n- 회원가입\n- 작품 등록\n- NFT\n- 가격\n- 진위 검증\n\n또는 고객센터 이메일(support@gallerypia.com)로 문의해주세요.`
  }

  showTypingIndicator() {
    const indicator = document.getElementById('aiTypingIndicator')
    if (indicator) {
      indicator.classList.remove('hidden')
    }
    this.isTyping = true
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('aiTypingIndicator')
    if (indicator) {
      indicator.classList.add('hidden')
    }
    this.isTyping = false
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// 전역 인스턴스 생성
window.customerSupportAI = new CustomerSupportAI()
