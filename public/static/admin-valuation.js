// 논문 기반 가치산정 시스템 UI
// 5개 모듈: 작가업적, 작품내용, 저작권인증, 전문가평가, 대중인기도

// ============================================
// 가치산정 모달 열기
// ============================================

async function openValuationModal(artworkId) {
  // 작품 정보 조회
  const response = await fetch(`/api/valuation/full-report/${artworkId}`);
  const data = await response.json();
  
  if (!data.success) {
    alert('작품 정보를 불러오지 못했습니다.');
    return;
  }
  
  const artwork = data.artwork;
  const contentEval = data.contentEvaluation || {};
  const certification = data.certification || {};
  const expertEvals = data.expertEvaluations || [];
  const popularity = data.popularity || {};
  const finalValuation = data.finalValuation || {};
  
  // 모달 HTML 생성
  const modalHTML = `
    <div id="valuationModal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-purple-500 border-opacity-30">
        
        <!-- 모달 헤더 -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                <i class="fas fa-calculator text-purple-500"></i>
                작품 가치산정 시스템
              </h2>
              <p class="text-gray-400 text-sm mt-1">${artwork.title} - ${artwork.artist_name}</p>
            </div>
            <button onclick="closeValuationModal()" class="text-gray-400 hover:text-white transition">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
          
          <!-- 탭 네비게이션 -->
          <div class="flex gap-2 mt-4 overflow-x-auto">
            <button onclick="switchValuationTab('summary')" id="tab-summary" class="valuation-tab px-4 py-2 rounded-lg bg-purple-500 bg-opacity-20 text-purple-400 whitespace-nowrap">
              <i class="fas fa-chart-pie mr-2"></i>종합 요약
            </button>
            <button onclick="switchValuationTab('module1')" id="tab-module1" class="valuation-tab px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-400 hover:text-white whitespace-nowrap">
              <i class="fas fa-trophy mr-2"></i>모듈1: 작가업적
            </button>
            <button onclick="switchValuationTab('module2')" id="tab-module2" class="valuation-tab px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-400 hover:text-white whitespace-nowrap">
              <i class="fas fa-palette mr-2"></i>모듈2: 작품평가
            </button>
            <button onclick="switchValuationTab('module3')" id="tab-module3" class="valuation-tab px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-400 hover:text-white whitespace-nowrap">
              <i class="fas fa-certificate mr-2"></i>모듈3: 저작권인증
            </button>
            <button onclick="switchValuationTab('module4')" id="tab-module4" class="valuation-tab px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-400 hover:text-white whitespace-nowrap">
              <i class="fas fa-users mr-2"></i>모듈4: 전문가평가
            </button>
            <button onclick="switchValuationTab('module5')" id="tab-module5" class="valuation-tab px-4 py-2 rounded-lg bg-white bg-opacity-5 text-gray-400 hover:text-white whitespace-nowrap">
              <i class="fas fa-fire mr-2"></i>모듈5: 대중인기도
            </button>
          </div>
        </div>
        
        <!-- 모달 바디 -->
        <div class="p-6">
          
          <!-- 종합 요약 탭 -->
          <div id="content-summary" class="valuation-content">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              <!-- 최종 가치 점수 -->
              <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div class="text-sm opacity-80 mb-2">최종 가치 점수</div>
                <div class="text-5xl font-bold mb-4">${(finalValuation.final_value_score || 0).toFixed(1)}<span class="text-2xl">/100</span></div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-white bg-opacity-20 rounded-lg p-3">
                    <div class="opacity-80">추천가격</div>
                    <div class="font-bold">${formatPrice(finalValuation.recommended_price_avg || 0)}</div>
                  </div>
                  <div class="bg-white bg-opacity-20 rounded-lg p-3">
                    <div class="opacity-80">AVI 지수</div>
                    <div class="font-bold">${(finalValuation.art_value_index || 0).toFixed(0)}</div>
                  </div>
                </div>
              </div>
              
              <!-- 모듈별 점수 레이더 차트 -->
              <div class="bg-gray-800 rounded-xl p-6">
                <div class="text-white font-bold mb-4">5개 모듈 평가 분포</div>
                <canvas id="radarChart" width="300" height="300"></canvas>
              </div>
            </div>
            
            <!-- 5개 모듈 점수 카드 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <i class="fas fa-trophy text-yellow-500"></i>
                  <span class="text-xs text-gray-400">25%</span>
                </div>
                <div class="text-2xl font-bold text-white">${(finalValuation.module1_artist_achievement || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400 mt-1">작가 업적</div>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <i class="fas fa-palette text-purple-500"></i>
                  <span class="text-xs text-gray-400">30%</span>
                </div>
                <div class="text-2xl font-bold text-white">${(finalValuation.module2_artwork_content || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400 mt-1">작품 평가</div>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <i class="fas fa-certificate text-blue-500"></i>
                  <span class="text-xs text-gray-400">20%</span>
                </div>
                <div class="text-2xl font-bold text-white">${(finalValuation.module3_certification || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400 mt-1">저작권 인증</div>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <i class="fas fa-users text-green-500"></i>
                  <span class="text-xs text-gray-400">15%</span>
                </div>
                <div class="text-2xl font-bold text-white">${(finalValuation.module4_expert_evaluation || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400 mt-1">전문가 평가</div>
              </div>
              
              <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <i class="fas fa-fire text-orange-500"></i>
                  <span class="text-xs text-gray-400">10%</span>
                </div>
                <div class="text-2xl font-bold text-white">${(finalValuation.module5_popularity || 0).toFixed(1)}</div>
                <div class="text-xs text-gray-400 mt-1">대중 인기도</div>
              </div>
            </div>
            
            <!-- 시장 투명도 -->
            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-bold">시장 투명도 지수</span>
                <span class="text-purple-400 font-bold">${finalValuation.market_transparency_index || 0}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-3">
                <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500" style="width: ${finalValuation.market_transparency_index || 0}%"></div>
              </div>
            </div>
            
            <!-- 추천 가격 범위 -->
            <div class="bg-gray-800 rounded-lg p-4 mt-4">
              <div class="text-white font-bold mb-3">추천 가격 범위</div>
              <div class="flex items-center justify-between text-sm">
                <div>
                  <div class="text-gray-400">최소</div>
                  <div class="text-white font-bold">${formatPrice(finalValuation.recommended_price_min || 0)}</div>
                </div>
                <div class="flex-1 mx-4">
                  <div class="relative h-2 bg-gray-700 rounded-full">
                    <div class="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-gray-400">최대</div>
                  <div class="text-white font-bold">${formatPrice(finalValuation.recommended_price_max || 0)}</div>
                </div>
              </div>
            </div>
            
            <!-- 계산 버튼 -->
            <div class="mt-6 flex gap-3">
              <button onclick="recalculateFinalValuation(${artworkId})" class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition">
                <i class="fas fa-calculator mr-2"></i>최종 가치 재계산
              </button>
              <button onclick="exportValuationReport(${artworkId})" class="bg-gray-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition">
                <i class="fas fa-file-pdf mr-2"></i>PDF 출력
              </button>
            </div>
          </div>
          
          <!-- 모듈1: 작가 업적 탭 -->
          <div id="content-module1" class="valuation-content hidden">
            ${getModule1HTML(artwork, finalValuation)}
          </div>
          
          <!-- 모듈2: 작품 평가 탭 -->
          <div id="content-module2" class="valuation-content hidden">
            ${getModule2HTML(artworkId, contentEval)}
          </div>
          
          <!-- 모듈3: 저작권 인증 탭 -->
          <div id="content-module3" class="valuation-content hidden">
            ${getModule3HTML(artworkId, certification)}
          </div>
          
          <!-- 모듈4: 전문가 평가 탭 -->
          <div id="content-module4" class="valuation-content hidden">
            ${getModule4HTML(artworkId, expertEvals)}
          </div>
          
          <!-- 모듈5: 대중 인기도 탭 -->
          <div id="content-module5" class="valuation-content hidden">
            ${getModule5HTML(artworkId, popularity)}
          </div>
          
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 레이더 차트 그리기
  drawRadarChart(finalValuation);
}

// 레이더 차트 그리기
function drawRadarChart(valuation) {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['작가업적 (25%)', '작품평가 (30%)', '저작권인증 (20%)', '전문가평가 (15%)', '인기도 (10%)'],
      datasets: [{
        label: '점수',
        data: [
          valuation.module1_artist_achievement || 0,
          valuation.module2_artwork_content || 0,
          valuation.module3_certification || 0,
          valuation.module4_expert_evaluation || 0,
          valuation.module5_popularity || 0
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
      }]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: '#9ca3af'
          },
          grid: {
            color: '#374151'
          },
          pointLabels: {
            color: '#fff',
            font: {
              size: 11
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// 모듈1 HTML
function getModule1HTML(artwork, valuation) {
  return `
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-trophy text-yellow-500 mr-2"></i>
          작가 업적 평가 (α1 = 0.25)
        </h3>
        <p class="text-gray-400 mb-6">
          작가업적점수 = ∑(전시점수 × 권위도가중치 × 최신성계수)
        </p>
        
        <div class="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white mb-6">
          <div class="text-sm opacity-80 mb-2">작가 업적 최종 점수</div>
          <div class="text-4xl font-bold">${(valuation.module1_artist_achievement || 0).toFixed(1)}<span class="text-xl">/100</span></div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-gray-400 text-sm">총 전시</div>
            <div class="text-white text-2xl font-bold">${artwork.artist_total_exhibitions || 0}회</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-gray-400 text-sm">개인전</div>
            <div class="text-white text-2xl font-bold">${artwork.artist_solo_exhibitions || 0}회</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-gray-400 text-sm">수상</div>
            <div class="text-white text-2xl font-bold">${artwork.artist_total_awards || 0}회</div>
          </div>
        </div>
        
        <button onclick="window.location.href='/admin/artists/${artwork.artist_id}'" class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
          <i class="fas fa-user-edit mr-2"></i>작가 정보 관리로 이동
        </button>
      </div>
    </div>
  `;
}

// 모듈2 HTML
function getModule2HTML(artworkId, contentEval) {
  return `
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-palette text-purple-500 mr-2"></i>
          작품 내용 평가 (α2 = 0.30)
        </h3>
        <p class="text-gray-400 mb-6">
          4가지 정성 지표: 내용성, 표현성, 독창성, 소장가치 (각 0~25점)
        </p>
        
        <form id="module2Form" class="space-y-6" onsubmit="saveModule2(event, ${artworkId})">
          
          <!-- 1) 내용성 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              1) 내용성 (주제 의식, 사회적 메시지 깊이)
            </label>
            <input type="range" min="0" max="25" value="${contentEval.content_depth_score || 0}" 
                   id="content_depth_score" class="w-full mb-2" oninput="updateScoreDisplay('content_depth', this.value)">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">0점</span>
              <span class="text-white font-bold" id="content_depth_display">${contentEval.content_depth_score || 0}점</span>
              <span class="text-gray-400">25점</span>
            </div>
            <textarea id="content_comment" rows="2" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="평가 코멘트...">${contentEval.content_comment || ''}</textarea>
          </div>
          
          <!-- 2) 표현성 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              2) 표현성 (기법 숙련도, 시각 완성도)
            </label>
            <input type="range" min="0" max="25" value="${contentEval.expression_score || 0}" 
                   id="expression_score" class="w-full mb-2" oninput="updateScoreDisplay('expression', this.value)">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">0점</span>
              <span class="text-white font-bold" id="expression_display">${contentEval.expression_score || 0}점</span>
              <span class="text-gray-400">25점</span>
            </div>
            <textarea id="expression_comment" rows="2" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="평가 코멘트...">${contentEval.expression_comment || ''}</textarea>
          </div>
          
          <!-- 3) 독창성 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              3) 독창성 (차별성, 혁신성)
            </label>
            <input type="range" min="0" max="25" value="${contentEval.originality_score || 0}" 
                   id="originality_score" class="w-full mb-2" oninput="updateScoreDisplay('originality', this.value)">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">0점</span>
              <span class="text-white font-bold" id="originality_display">${contentEval.originality_score || 0}점</span>
              <span class="text-gray-400">25점</span>
            </div>
            <textarea id="originality_comment" rows="2" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="평가 코멘트...">${contentEval.originality_comment || ''}</textarea>
          </div>
          
          <!-- 4) 소장가치 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              4) 소장가치 (시대적 의미, 미래 전망)
            </label>
            <input type="range" min="0" max="25" value="${contentEval.collection_value_score || 0}" 
                   id="collection_value_score" class="w-full mb-2" oninput="updateScoreDisplay('collection_value', this.value)">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-400">0점</span>
              <span class="text-white font-bold" id="collection_value_display">${contentEval.collection_value_score || 0}점</span>
              <span class="text-gray-400">25점</span>
            </div>
            <textarea id="collection_value_comment" rows="2" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="평가 코멘트...">${contentEval.collection_value_comment || ''}</textarea>
          </div>
          
          <!-- 합계 -->
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <div class="text-sm opacity-80 mb-2">작품 내용 평가 합계</div>
            <div class="text-4xl font-bold" id="module2_total">${(contentEval.artwork_content_final_score || 0)}<span class="text-xl">/100</span></div>
          </div>
          
          <button type="submit" class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
            <i class="fas fa-save mr-2"></i>평가 저장
          </button>
        </form>
      </div>
    </div>
  `;
}

// 모듈3 HTML
function getModule3HTML(artworkId, certification) {
  return `
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-certificate text-blue-500 mr-2"></i>
          저작권·소유권·라이선스 인증 (α3 = 0.20)
        </h3>
        <p class="text-gray-400 mb-6">
          블록체인 해시 (40점) + 저작권 등록 (40점) + 라이선스 명시 (20점)
        </p>
        
        <form id="module3Form" class="space-y-6" onsubmit="saveModule3(event, ${artworkId})">
          
          <!-- 블록체인 정보 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">블록체인 해시 (40점)</label>
            <input type="text" id="blockchain_hash" value="${certification.blockchain_hash || ''}" 
                   class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none mb-2" placeholder="IPFS 해시 또는 블록체인 해시">
            <select id="blockchain_network" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
              <option value="">네트워크 선택</option>
              <option value="ethereum" ${certification.blockchain_network === 'ethereum' ? 'selected' : ''}>Ethereum</option>
              <option value="polygon" ${certification.blockchain_network === 'polygon' ? 'selected' : ''}>Polygon</option>
              <option value="klaytn" ${certification.blockchain_network === 'klaytn' ? 'selected' : ''}>Klaytn</option>
            </select>
          </div>
          
          <!-- 저작권 등록 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">저작권 등록 (40점)</label>
            <div class="flex items-center mb-3">
              <input type="checkbox" id="copyright_registered" ${certification.copyright_registered ? 'checked' : ''} class="mr-2">
              <label for="copyright_registered" class="text-white">저작권 등록 완료</label>
            </div>
            <input type="text" id="copyright_registration_number" value="${certification.copyright_registration_number || ''}" 
                   class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="저작권 등록번호 (예: C-2024-000001)">
          </div>
          
          <!-- 라이선스 정보 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">라이선스 유형 (20점)</label>
            <select id="license_type" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
              <option value="exclusive" ${certification.license_type === 'exclusive' ? 'selected' : ''}>독점 라이선스 (Exclusive)</option>
              <option value="non-exclusive" ${certification.license_type === 'non-exclusive' ? 'selected' : ''}>비독점 라이선스 (Non-Exclusive)</option>
              <option value="creative_commons" ${certification.license_type === 'creative_commons' ? 'selected' : ''}>크리에이티브 커먼즈 (CC)</option>
            </select>
          </div>
          
          <!-- 점수 표시 -->
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
            <div class="text-sm opacity-80 mb-2">저작권 인증 점수</div>
            <div class="text-4xl font-bold">${(certification.certification_score || 0).toFixed(0)}<span class="text-xl">/100</span></div>
          </div>
          
          <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            <i class="fas fa-save mr-2"></i>인증 정보 저장
          </button>
        </form>
      </div>
    </div>
  `;
}

// 모듈4 HTML
function getModule4HTML(artworkId, expertEvals) {
  const evaluationsList = expertEvals.map(ev => `
    <div class="bg-gray-700 rounded-lg p-4 mb-3">
      <div class="flex justify-between items-start mb-2">
        <div>
          <span class="text-white font-bold">${ev.expert_name}</span>
          <span class="text-gray-400 text-sm ml-2">${getExpertLevelName(ev.expert_level)}</span>
        </div>
        <span class="text-purple-400 font-bold">${ev.overall_score}점</span>
      </div>
      <div class="text-gray-400 text-sm">${ev.expert_institution || ''}</div>
      <div class="grid grid-cols-4 gap-2 mt-3 text-xs">
        <div><span class="text-gray-400">기법:</span> <span class="text-white">${ev.technique_mastery_score}</span></div>
        <div><span class="text-gray-400">예술사:</span> <span class="text-white">${ev.art_historical_significance_score}</span></div>
        <div><span class="text-gray-400">시장성:</span> <span class="text-white">${ev.marketability_score}</span></div>
        <div><span class="text-gray-400">발전성:</span> <span class="text-white">${ev.development_potential_score}</span></div>
      </div>
      ${ev.evaluation_comment ? `<div class="text-gray-300 text-sm mt-2 italic">"${ev.evaluation_comment}"</div>` : ''}
    </div>
  `).join('');
  
  return `
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-users text-green-500 mr-2"></i>
          전문가 정성 평가 (α4 = 0.15)
        </h3>
        <p class="text-gray-400 mb-6">
          미술관 학예사, 갤러리 디렉터, 미술 비평가, 대학원 전공자의 다수 의견 종합
        </p>
        
        <!-- 기존 평가 목록 -->
        <div class="mb-6">
          <h4 class="text-white font-bold mb-3">등록된 전문가 평가 (${expertEvals.length}건)</h4>
          ${evaluationsList || '<div class="text-gray-400 text-center py-4">등록된 평가가 없습니다.</div>'}
        </div>
        
        <!-- 새 평가 추가 폼 -->
        <form id="module4Form" class="space-y-4 border-t border-gray-700 pt-6" onsubmit="saveModule4(event, ${artworkId})">
          <h4 class="text-white font-bold">새 전문가 평가 추가</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white mb-2">전문가 이름</label>
              <input type="text" id="expert_name" required class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="홍길동">
            </div>
            <div>
              <label class="block text-white mb-2">전문가 등급</label>
              <select id="expert_level" required class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
                <option value="">선택</option>
                <option value="curator">미술관 학예사 (가중치 1.5)</option>
                <option value="director">갤러리 디렉터 (가중치 1.3)</option>
                <option value="critic">미술 비평가 (가중치 1.2)</option>
                <option value="graduate">대학원 전공자 (가중치 1.0)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-white mb-2">소속 기관</label>
            <input type="text" id="expert_institution" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="국립현대미술관">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white mb-2">기법 완성도 (0~25)</label>
              <input type="number" id="technique_mastery_score" min="0" max="25" value="0" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-white mb-2">예술사적 의미 (0~25)</label>
              <input type="number" id="art_historical_significance_score" min="0" max="25" value="0" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-white mb-2">시장성 (0~25)</label>
              <input type="number" id="marketability_score" min="0" max="25" value="0" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-white mb-2">발전 가능성 (0~25)</label>
              <input type="number" id="development_potential_score" min="0" max="25" value="0" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
            </div>
          </div>
          
          <div>
            <label class="block text-white mb-2">평가 코멘트</label>
            <textarea id="evaluation_comment" rows="3" class="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="전문가 의견을 입력하세요..."></textarea>
          </div>
          
          <button type="submit" class="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">
            <i class="fas fa-plus mr-2"></i>전문가 평가 추가
          </button>
        </form>
      </div>
    </div>
  `;
}

// 모듈5 HTML
function getModule5HTML(artworkId, popularity) {
  return `
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-fire text-orange-500 mr-2"></i>
          대중 인지도 및 인기도 평가 (α5 = 0.10)
        </h3>
        <p class="text-gray-400 mb-6">
          YouTube, Instagram, 플랫폼 반응, Google Trends, 언론 보도 등을 종합 평가
        </p>
        
        <form id="module5Form" class="space-y-6" onsubmit="saveModule5(event, ${artworkId})">
          
          <!-- YouTube -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              <i class="fab fa-youtube text-red-500 mr-2"></i>YouTube 조회수
            </label>
            <input type="number" id="youtube_views" value="${popularity.youtube_views || 0}" min="0" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
          </div>
          
          <!-- Instagram -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              <i class="fab fa-instagram text-pink-500 mr-2"></i>Instagram 인게이지먼트
            </label>
            <div class="grid grid-cols-3 gap-2">
              <input type="number" id="instagram_likes" value="${popularity.instagram_likes || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="좋아요">
              <input type="number" id="instagram_comments" value="${popularity.instagram_comments || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="댓글">
              <input type="number" id="instagram_shares" value="${popularity.instagram_shares || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="공유">
            </div>
          </div>
          
          <!-- 플랫폼 반응 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              <i class="fas fa-heart text-purple-500 mr-2"></i>플랫폼 내 반응
            </label>
            <div class="grid grid-cols-3 gap-2">
              <input type="number" id="platform_likes" value="${popularity.platform_likes || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="좋아요">
              <input type="number" id="platform_comments" value="${popularity.platform_comments || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="댓글">
              <input type="number" id="platform_shares" value="${popularity.platform_shares || 0}" min="0" class="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" placeholder="공유">
            </div>
          </div>
          
          <!-- Google Trends -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              <i class="fab fa-google text-blue-500 mr-2"></i>Google Trends 점수 (0~100)
            </label>
            <input type="range" id="google_trends_score" value="${popularity.google_trends_score || 0}" min="0" max="100" class="w-full mb-2" oninput="document.getElementById('google_trends_display').textContent = this.value">
            <div class="text-center text-white font-bold" id="google_trends_display">${popularity.google_trends_score || 0}</div>
          </div>
          
          <!-- 언론 보도 -->
          <div class="bg-gray-700 rounded-lg p-4">
            <label class="block text-white font-bold mb-2">
              <i class="fas fa-newspaper text-yellow-500 mr-2"></i>언론 보도 횟수
            </label>
            <input type="number" id="media_coverage_count" value="${popularity.media_coverage_count || 0}" min="0" class="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
          </div>
          
          <!-- 점수 표시 -->
          <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
            <div class="text-sm opacity-80 mb-2">대중 인기도 점수</div>
            <div class="text-4xl font-bold">${(popularity.popularity_final_score || 0).toFixed(1)}<span class="text-xl">/100</span></div>
          </div>
          
          <button type="submit" class="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition">
            <i class="fas fa-save mr-2"></i>인기도 정보 저장
          </button>
        </form>
      </div>
    </div>
  `;
}

// 탭 전환
function switchValuationTab(tabName) {
  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.valuation-tab').forEach(btn => {
    btn.classList.remove('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
    btn.classList.add('bg-white', 'bg-opacity-5', 'text-gray-400');
  });
  
  // 모든 컨텐츠 숨김
  document.querySelectorAll('.valuation-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  // 선택된 탭 활성화
  document.getElementById(`tab-${tabName}`).classList.remove('bg-white', 'bg-opacity-5', 'text-gray-400');
  document.getElementById(`tab-${tabName}`).classList.add('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
  document.getElementById(`content-${tabName}`).classList.remove('hidden');
}

// 모달 닫기
function closeValuationModal() {
  const modal = document.getElementById('valuationModal');
  if (modal) modal.remove();
}

// 점수 표시 업데이트
function updateScoreDisplay(field, value) {
  document.getElementById(`${field}_display`).textContent = value + '점';
  
  // 모듈2 합계 계산
  const content = parseInt(document.getElementById('content_depth_score').value) || 0;
  const expression = parseInt(document.getElementById('expression_score').value) || 0;
  const originality = parseInt(document.getElementById('originality_score').value) || 0;
  const collection = parseInt(document.getElementById('collection_value_score').value) || 0;
  
  const total = content + expression + originality + collection;
  document.getElementById('module2_total').innerHTML = `${total}<span class="text-xl">/100</span>`;
}

// 모듈2 저장
async function saveModule2(event, artworkId) {
  event.preventDefault();
  
  const data = {
    content_depth_score: parseInt(document.getElementById('content_depth_score').value),
    content_comment: document.getElementById('content_comment').value,
    expression_score: parseInt(document.getElementById('expression_score').value),
    expression_comment: document.getElementById('expression_comment').value,
    originality_score: parseInt(document.getElementById('originality_score').value),
    originality_comment: document.getElementById('originality_comment').value,
    collection_value_score: parseInt(document.getElementById('collection_value_score').value),
    collection_value_comment: document.getElementById('collection_value_comment').value
  };
  
  const response = await fetch(`/api/valuation/calculate-artwork-content/${artworkId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`✅ 작품 내용 평가 저장 완료! (점수: ${result.score})`);
    closeValuationModal();
    location.reload();
  } else {
    alert('❌ 저장 실패');
  }
}

// 모듈3 저장
async function saveModule3(event, artworkId) {
  event.preventDefault();
  
  const data = {
    blockchain_hash: document.getElementById('blockchain_hash').value,
    blockchain_network: document.getElementById('blockchain_network').value,
    copyright_registered: document.getElementById('copyright_registered').checked,
    copyright_registration_number: document.getElementById('copyright_registration_number').value,
    license_type: document.getElementById('license_type').value
  };
  
  const response = await fetch(`/api/valuation/calculate-certification/${artworkId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`✅ 저작권 인증 정보 저장 완료! (점수: ${result.score})`);
    closeValuationModal();
    location.reload();
  } else {
    alert('❌ 저장 실패');
  }
}

// 모듈4 저장
async function saveModule4(event, artworkId) {
  event.preventDefault();
  
  const data = {
    expert_name: document.getElementById('expert_name').value,
    expert_level: document.getElementById('expert_level').value,
    expert_institution: document.getElementById('expert_institution').value,
    technique_mastery_score: parseInt(document.getElementById('technique_mastery_score').value),
    art_historical_significance_score: parseInt(document.getElementById('art_historical_significance_score').value),
    marketability_score: parseInt(document.getElementById('marketability_score').value),
    development_potential_score: parseInt(document.getElementById('development_potential_score').value),
    evaluation_comment: document.getElementById('evaluation_comment').value
  };
  
  const response = await fetch(`/api/valuation/add-expert-evaluation/${artworkId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`✅ 전문가 평가 추가 완료! (점수: ${result.score})`);
    closeValuationModal();
    location.reload();
  } else {
    alert('❌ 추가 실패');
  }
}

// 모듈5 저장
async function saveModule5(event, artworkId) {
  event.preventDefault();
  
  const data = {
    youtube_views: parseInt(document.getElementById('youtube_views').value) || 0,
    instagram_likes: parseInt(document.getElementById('instagram_likes').value) || 0,
    instagram_comments: parseInt(document.getElementById('instagram_comments').value) || 0,
    instagram_shares: parseInt(document.getElementById('instagram_shares').value) || 0,
    platform_likes: parseInt(document.getElementById('platform_likes').value) || 0,
    platform_comments: parseInt(document.getElementById('platform_comments').value) || 0,
    platform_shares: parseInt(document.getElementById('platform_shares').value) || 0,
    google_trends_score: parseInt(document.getElementById('google_trends_score').value) || 0,
    media_coverage_count: parseInt(document.getElementById('media_coverage_count').value) || 0
  };
  
  const response = await fetch(`/api/valuation/update-popularity/${artworkId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`✅ 인기도 정보 저장 완료! (점수: ${result.score.toFixed(1)})`);
    closeValuationModal();
    location.reload();
  } else {
    alert('❌ 저장 실패');
  }
}

// 최종 가치 재계산
async function recalculateFinalValuation(artworkId) {
  if (!confirm('모든 모듈의 점수를 종합하여 최종 가치를 재계산합니다. 계속하시겠습니까?')) {
    return;
  }
  
  const response = await fetch(`/api/valuation/calculate-final/${artworkId}`, {
    method: 'POST'
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`✅ 최종 가치 재계산 완료!\n\n` +
          `최종 점수: ${result.finalScore.toFixed(1)}/100\n` +
          `추천 가격: ${formatPrice(result.recommendedPrice.avg)}\n` +
          `AVI 지수: ${result.artValueIndex.toFixed(0)}\n` +
          `투명도 지수: ${result.marketTransparencyIndex}%`);
    closeValuationModal();
    location.reload();
  } else {
    alert('❌ 재계산 실패');
  }
}

// PDF 출력
function exportValuationReport(artworkId) {
  alert('PDF 출력 기능은 추후 구현 예정입니다.');
}

// 전문가 등급 이름
function getExpertLevelName(level) {
  const names = {
    'curator': '미술관 학예사',
    'director': '갤러리 디렉터',
    'critic': '미술 비평가',
    'graduate': '대학원 전공자'
  };
  return names[level] || level;
}

// 가격 포맷팅
function formatPrice(price) {
  if (price >= 100000000) return (price / 100000000).toFixed(1) + '억원';
  else if (price >= 10000) return (price / 10000).toFixed(0) + '만원';
  return price.toLocaleString() + '원';
}
