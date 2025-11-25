/**
 * GalleryPia First-Visit Tutorial
 * P3: First-visit tutorial only (i18n handled by existing i18n.js)
 */

// First-Visit Tutorial
function showFirstVisitTutorial() {
  // Check if already shown
  if (localStorage.getItem('gallerypia_tutorial_shown') === 'true') {
    return;
  }

  // Create tutorial modal
  const modal = document.createElement('div');
  modal.id = 'tutorialModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4';
  modal.style.animation = 'fadeIn 0.3s ease-out';

  modal.innerHTML = `
    <div class="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl max-w-3xl w-full p-8 md:p-12 shadow-2xl border border-purple-500/30" style="animation: slideUp 0.5s ease-out;">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-magic text-white text-4xl"></i>
        </div>
        <h2 class="text-4xl font-black text-white mb-4">
          <span class="text-gradient">GalleryPia</span>에 오신 것을 환영합니다!
        </h2>
        <p class="text-gray-300 text-lg">
          학술 논문 기반 NFT 미술품 가치산정 플랫폼
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white bg-opacity-5 rounded-2xl p-6 border border-purple-500/20">
          <div class="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
            <i class="fas fa-chart-line text-purple-400 text-2xl"></i>
          </div>
          <h3 class="text-white font-bold mb-2">과학적 가치산정</h3>
          <p class="text-gray-400 text-sm">83개 변수 기반 정량적 평가</p>
        </div>

        <div class="bg-white bg-opacity-5 rounded-2xl p-6 border border-cyan-500/20">
          <div class="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-4">
            <i class="fas fa-robot text-cyan-400 text-2xl"></i>
          </div>
          <h3 class="text-white font-bold mb-2">AI 진위 검증</h3>
          <p class="text-gray-400 text-sm">딥러닝 기반 자동 검증 시스템</p>
        </div>

        <div class="bg-white bg-opacity-5 rounded-2xl p-6 border border-green-500/20">
          <div class="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
            <i class="fas fa-cube text-green-400 text-2xl"></i>
          </div>
          <h3 class="text-white font-bold mb-2">NFT 민팅</h3>
          <p class="text-gray-400 text-sm">블록체인 기반 안전한 발행</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          onclick="closeTutorial(true)"
          class="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold text-lg rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          시작하기
        </button>
        <button 
          onclick="closeTutorial(false)"
          class="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all"
        >
          다시 보지 않기
        </button>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(modal);
}

// Close tutorial
window.closeTutorial = function(markAsShown) {
  if (markAsShown) {
    localStorage.setItem('gallerypia_tutorial_shown', 'true');
  }
  const modal = document.getElementById('tutorialModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => modal.remove(), 300);
  }
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTutorial);
} else {
  // DOM already loaded
  initTutorial();
}

function initTutorial() {
  try {
    console.log('[P3] 첫 방문 튜토리얼 시스템 초기화');
    
    // Show tutorial only on first visit and only on homepage
    if (window.location.pathname === '/') {
      setTimeout(() => {
        showFirstVisitTutorial();
      }, 2000);
    }
  } catch (err) {
    console.error('[P3] 튜토리얼 초기화 오류:', err);
  }
}
