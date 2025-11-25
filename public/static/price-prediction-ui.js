// AI 가격 예측 UI
class PricePredictionModal {
  constructor() {
    this.modal = null;
    this.createModal();
  }
  
  createModal() {
    const modalHTML = `
    <div id="pricePredictionModal" class="fixed inset-0 bg-black bg-opacity-75 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div class="p-6 border-b border-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <i class="fas fa-robot text-3xl text-purple-500"></i>
              <h2 class="text-2xl font-bold text-white">AI 가격 예측</h2>
            </div>
            <button onclick="closePricePredictionModal()" class="text-gray-400 hover:text-white">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
        <div id="predictionContent" class="p-6">
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p class="text-gray-400">AI가 가격을 분석하고 있습니다...</p>
          </div>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  async show(artworkId) {
    const modal = document.getElementById('pricePredictionModal');
    modal.classList.remove('hidden');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/price-prediction/artwork/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.displayPrediction(response.data.prediction);
    } catch (error) {
      this.displayError(error);
    }
  }
  
  displayPrediction(prediction) {
    const content = `
      <div class="space-y-6">
        <div class="text-center p-8 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl border border-purple-500/30">
          <p class="text-gray-400 mb-2">예상 가격</p>
          <div class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            ${prediction.predicted_price.toFixed(2)} ETH
          </div>
          <div class="mt-4 flex items-center justify-center space-x-4 text-sm">
            <span class="text-gray-400">범위: ${prediction.price_range.min.toFixed(2)} - ${prediction.price_range.max.toFixed(2)} ETH</span>
          </div>
        </div>
        
        <div class="p-6 bg-gray-800 rounded-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white">신뢰도</h3>
            <span class="text-2xl font-bold ${prediction.confidence_score >= 0.8 ? 'text-green-500' : prediction.confidence_score >= 0.6 ? 'text-yellow-500' : 'text-red-500'}">
              ${(prediction.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3">
            <div class="h-3 rounded-full ${prediction.confidence_score >= 0.8 ? 'bg-green-500' : prediction.confidence_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}" 
                 style="width: ${prediction.confidence_score * 100}%"></div>
          </div>
        </div>
        
        <div class="p-6 bg-gray-800 rounded-xl">
          <h3 class="text-lg font-bold text-white mb-4">가격 영향 요인</h3>
          <div class="space-y-3">
            ${prediction.factors.map(factor => `
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-gray-300">${factor.name}</span>
                  <span class="text-purple-400 font-bold">${factor.impact}</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                  <div class="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" 
                       style="width: ${factor.impact}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="p-6 bg-blue-900/20 rounded-xl border border-blue-500/30">
          <h3 class="text-lg font-bold text-white mb-2">AI 추천</h3>
          <p class="text-gray-300 leading-relaxed">${prediction.recommendation}</p>
        </div>
      </div>
    `;
    
    document.getElementById('predictionContent').innerHTML = content;
  }
  
  displayError(error) {
    document.getElementById('predictionContent').innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p class="text-xl text-white mb-2">예측 실패</p>
        <p class="text-gray-400">${error.response?.data?.error || '다시 시도해주세요'}</p>
      </div>
    `;
  }
}

// 전역 함수
let pricePredictionModal;

function showPricePrediction(artworkId) {
  if (!pricePredictionModal) {
    pricePredictionModal = new PricePredictionModal();
  }
  pricePredictionModal.show(artworkId);
}

function closePricePredictionModal() {
  document.getElementById('pricePredictionModal').classList.add('hidden');
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePricePredictionModal();
  }
});
