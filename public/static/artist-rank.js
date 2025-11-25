// ============================================
// 아티스트 랭크 프레임워크 UI
// ============================================

// 랭크 배지 HTML 생성
function getRankBadgeHTML(tier, grade, category) {
  const categoryNames = {
    'master': '최우수 작가',
    'excellent': '우수 작가',
    'professional': '전문 작가',
    'emerging': '신진 작가'
  };
  
  const tierColors = {
    'SS': 'from-yellow-400 to-orange-500',
    'S': 'from-purple-400 to-pink-500',
    'A': 'from-blue-400 to-cyan-500',
    'B': 'from-green-400 to-emerald-500',
    'C': 'from-teal-400 to-blue-500',
    'D': 'from-indigo-400 to-purple-500',
    'E': 'from-gray-400 to-gray-600',
    'F': 'from-gray-500 to-gray-700',
    'G': 'from-gray-600 to-gray-800'
  };
  
  const gradeLabels = {
    'S': '매우우수',
    'A': '우수',
    'B': '보통'
  };
  
  const color = tierColors[tier] || 'from-gray-500 to-gray-700';
  
  return `
    <div class="inline-flex items-center gap-2">
      <div class="flex items-center gap-1">
        <span class="px-3 py-1 bg-gradient-to-r ${color} text-white font-black text-lg rounded-lg shadow-lg">
          ${tier}
        </span>
        <span class="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-bold rounded">
          ${gradeLabels[grade]}
        </span>
      </div>
      <span class="text-gray-400 text-sm">
        ${categoryNames[category]}
      </span>
    </div>
  `;
}

// 랭크 카드 HTML 생성
function getRankCardHTML(rankData) {
  if (!rankData) {
    return `
      <div class="card-nft rounded-2xl p-6 text-center">
        <p class="text-gray-400">랭크 정보가 없습니다</p>
        <button onclick="loadArtistCareerForm()" class="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl">
          경력 등록하고 랭크 받기
        </button>
      </div>
    `;
  }
  
  return `
    <div class="card-nft rounded-2xl p-8 relative overflow-hidden">
      <!-- 배경 그라데이션 -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full -mr-32 -mt-32"></div>
      
      <div class="relative z-10">
        <!-- 랭크 배지 -->
        <div class="mb-6">
          ${getRankBadgeHTML(rankData.rank_tier, rankData.rank_grade, rankData.rank_category)}
        </div>
        
        <!-- 최종 점수 -->
        <div class="mb-6">
          <div class="text-5xl font-black text-gradient mb-2">
            ${rankData.final_score.toFixed(1)}
          </div>
          <div class="text-gray-400 text-sm">최종 종합 점수</div>
        </div>
        
        <!-- 점수 분석 -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-400">
              ${rankData.quantitative_weighted_score.toFixed(1)}
            </div>
            <div class="text-xs text-gray-500 mt-1">정량평가 (40%)</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-cyan-400">
              ${rankData.qualitative_weighted_score.toFixed(1)}
            </div>
            <div class="text-xs text-gray-500 mt-1">정성평가 (30%)</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-pink-400">
              ${rankData.popularity_weighted_score.toFixed(1)}
            </div>
            <div class="text-xs text-gray-500 mt-1">인기도 (30%)</div>
          </div>
        </div>
        
        <!-- 상세 점수 -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">
              <i class="fas fa-building-columns mr-2 text-purple-400"></i>
              전시회 경력
            </span>
            <span class="font-bold text-white">${rankData.quantitative_exhibitions_score.toFixed(0)} 점</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">
              <i class="fas fa-trophy mr-2 text-yellow-400"></i>
              수상 경력
            </span>
            <span class="font-bold text-white">${rankData.quantitative_awards_score.toFixed(0)} 점</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">
              <i class="fas fa-certificate mr-2 text-green-400"></i>
              저작권 등록
            </span>
            <span class="font-bold text-white">${rankData.quantitative_copyrights_score.toFixed(0)} 점</span>
          </div>
        </div>
        
        <!-- 액션 버튼 -->
        <div class="flex gap-3">
          <button onclick="loadArtistCareerForm()" class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition">
            <i class="fas fa-plus mr-2"></i>
            경력 추가
          </button>
          <button onclick="recalculateRank()" class="px-4 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 font-semibold rounded-xl transition">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <!-- 마지막 업데이트 -->
        <div class="mt-4 text-xs text-gray-500 text-center">
          마지막 계산: ${new Date(rankData.last_calculated_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  `;
}

// 경력 입력 폼 HTML 생성
function getCareerFormHTML() {
  return `
    <div class="max-w-4xl mx-auto">
      <!-- 탭 네비게이션 -->
      <div class="flex gap-2 mb-8 overflow-x-auto">
        <button onclick="switchCareerTab('exhibition')" id="tab-exhibition" class="career-tab active">
          <i class="fas fa-building-columns mr-2"></i>전시회
        </button>
        <button onclick="switchCareerTab('award')" id="tab-award" class="career-tab">
          <i class="fas fa-trophy mr-2"></i>수상
        </button>
        <button onclick="switchCareerTab('copyright')" id="tab-copyright" class="career-tab">
          <i class="fas fa-certificate mr-2"></i>저작권
        </button>
        <button onclick="switchCareerTab('curation')" id="tab-curation" class="career-tab">
          <i class="fas fa-palette mr-2"></i>전시기획
        </button>
        <button onclick="switchCareerTab('publication')" id="tab-publication" class="career-tab">
          <i class="fas fa-book mr-2"></i>논문/저서
        </button>
      </div>
      
      <!-- 전시회 폼 -->
      <div id="form-exhibition" class="career-form active">
        <div class="card-nft rounded-2xl p-8">
          <h3 class="text-2xl font-bold text-white mb-6">전시회 경력 추가</h3>
          <form onsubmit="submitExhibition(event)">
            <div class="space-y-4">
              <!-- 전시회 유형 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">전시회 유형</label>
                <select name="exhibition_type" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <optgroup label="국제 전시회">
                    <option value="international_biennale">국제 비엔날레/아트페어 (150점)</option>
                    <option value="international_solo">국제 개인전 (150점)</option>
                    <option value="international_2person">국제 2인전 (100점)</option>
                    <option value="international_3person">국제 3인전 (70점)</option>
                    <option value="international_group">국제 단체전 (50점)</option>
                  </optgroup>
                  <optgroup label="국내 전시회">
                    <option value="domestic_biennale">국내 비엔날레/아트페어 (100점)</option>
                    <option value="domestic_solo">국내 개인전 (100점)</option>
                    <option value="domestic_2person">국내 2인전 (70점)</option>
                    <option value="domestic_3person">국내 3인전 (50점)</option>
                    <option value="domestic_group">국내 단체전 (30점)</option>
                  </optgroup>
                  <option value="other">기타 전시회 (20점)</option>
                </select>
              </div>
              
              <!-- 전시회명 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">전시회명</label>
                <input type="text" name="title" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 서울 국제 아트페어 2024">
              </div>
              
              <!-- 장소 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">장소</label>
                <input type="text" name="location" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 서울시립미술관">
              </div>
              
              <!-- 주최기관 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">주최기관</label>
                <input type="text" name="organizer" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 서울시">
              </div>
              
              <!-- 전시 기간 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-300 text-sm font-medium mb-2">시작일</label>
                  <input type="date" name="start_date" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
                </div>
                <div>
                  <label class="block text-gray-300 text-sm font-medium mb-2">종료일</label>
                  <input type="date" name="end_date" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
                </div>
              </div>
              
              <!-- 유명 전시회 여부 -->
              <div class="flex items-center">
                <input type="checkbox" name="is_famous_venue" id="is_famous_venue" class="w-5 h-5 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500">
                <label for="is_famous_venue" class="ml-3 text-gray-300 text-sm">
                  유명 전시회 (인지도 높음) - 점수 +10%
                </label>
              </div>
              
              <!-- 증빙서류 URL -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">증빙서류 URL (도록, 팸플릿 등)</label>
                <input type="url" name="proof_document_url" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="https://...">
              </div>
              
              <!-- 제출 버튼 -->
              <button type="submit" class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition">
                <i class="fas fa-check mr-2"></i>
                전시회 경력 추가
              </button>
            </div>
          </form>
        </div>
        
        <!-- 기존 전시회 목록 -->
        <div class="mt-8">
          <h3 class="text-xl font-bold text-white mb-4">등록된 전시회</h3>
          <div id="exhibition-list" class="space-y-4">
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 수상 폼 -->
      <div id="form-award" class="career-form">
        <div class="card-nft rounded-2xl p-8">
          <h3 class="text-2xl font-bold text-white mb-6">수상 경력 추가</h3>
          <form onsubmit="submitAward(event)">
            <div class="space-y-4">
              <!-- 수상 순위 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">수상 순위</label>
                <select name="award_rank" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <option value="1">1순위 (대상/최우수상) - 100점</option>
                  <option value="2">2순위 - 70점</option>
                  <option value="3">3순위 - 50점</option>
                  <option value="4">입선 이상 - 30점</option>
                </select>
              </div>
              
              <!-- 수상명 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">수상명</label>
                <input type="text" name="award_name" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 대상">
              </div>
              
              <!-- 공모전명 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">공모전명</label>
                <input type="text" name="competition_name" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 전국 청년작가 공모전">
              </div>
              
              <!-- 주최기관 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">주최기관</label>
                <input type="text" name="organizer" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 문화체육관광부">
              </div>
              
              <!-- 수상일 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">수상일</label>
                <input type="date" name="award_date" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
              </div>
              
              <!-- 국제 수상 여부 -->
              <div class="flex items-center">
                <input type="checkbox" name="is_international" id="is_international_award" class="w-5 h-5 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500">
                <label for="is_international_award" class="ml-3 text-gray-300 text-sm">
                  국제 수상 - 점수 +10%
                </label>
              </div>
              
              <!-- 증빙서류 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">수상증명서(상장) URL</label>
                <input type="url" name="certificate_url" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="https://...">
              </div>
              
              <!-- 제출 버튼 -->
              <button type="submit" class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition">
                <i class="fas fa-check mr-2"></i>
                수상 경력 추가
              </button>
            </div>
          </form>
        </div>
        
        <!-- 기존 수상 목록 -->
        <div class="mt-8">
          <h3 class="text-xl font-bold text-white mb-4">등록된 수상</h3>
          <div id="award-list" class="space-y-4">
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 저작권 폼 -->
      <div id="form-copyright" class="career-form">
        <div class="card-nft rounded-2xl p-8">
          <h3 class="text-2xl font-bold text-white mb-6">저작권 등록 추가</h3>
          <form onsubmit="submitCopyright(event)">
            <div class="space-y-4">
              <!-- 작품명 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">작품명</label>
                <input type="text" name="artwork_title" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: Digital Dreams #001">
              </div>
              
              <!-- 등록번호 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">등록번호</label>
                <input type="text" name="registration_number" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: C-2023-012345">
              </div>
              
              <!-- 등록기관 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">등록기관</label>
                <input type="text" name="registration_agency" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="예: 한국저작권위원회">
              </div>
              
              <!-- 등록일 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">등록일</label>
                <input type="date" name="registration_date" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
              </div>
              
              <!-- 국가 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">국가</label>
                <select name="country" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <option value="KR">대한민국</option>
                  <option value="US">미국</option>
                  <option value="JP">일본</option>
                  <option value="CN">중국</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
              
              <!-- 증빙서류 -->
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">저작권등록증 URL</label>
                <input type="url" name="certificate_url" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500" placeholder="https://...">
              </div>
              
              <!-- 안내 -->
              <div class="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <p class="text-sm text-blue-300">
                  <i class="fas fa-info-circle mr-2"></i>
                  저작권 등록은 <strong>30점</strong>이 부여됩니다. NFT 작품의 저작권 및 소유권을 증빙하는 중요한 항목입니다.
                </p>
              </div>
              
              <!-- 제출 버튼 -->
              <button type="submit" class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition">
                <i class="fas fa-check mr-2"></i>
                저작권 등록 추가
              </button>
            </div>
          </form>
        </div>
        
        <!-- 기존 저작권 목록 -->
        <div class="mt-8">
          <h3 class="text-xl font-bold text-white mb-4">등록된 저작권</h3>
          <div id="copyright-list" class="space-y-4">
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 전시기획 폼 (간단히) -->
      <div id="form-curation" class="career-form">
        <div class="card-nft rounded-2xl p-8 text-center">
          <i class="fas fa-palette text-6xl text-gray-600 mb-4"></i>
          <h3 class="text-xl font-bold text-white mb-2">전시기획 경력</h3>
          <p class="text-gray-400 mb-4">큐레이터, 아트디렉터 경력을 등록할 수 있습니다</p>
          <button class="px-6 py-3 bg-gray-800 text-gray-400 rounded-xl">준비 중</button>
        </div>
      </div>
      
      <!-- 논문/저서 폼 (간단히) -->
      <div id="form-publication" class="career-form">
        <div class="card-nft rounded-2xl p-8 text-center">
          <i class="fas fa-book text-6xl text-gray-600 mb-4"></i>
          <h3 class="text-xl font-bold text-white mb-2">논문 및 저서</h3>
          <p class="text-gray-400 mb-4">작품 관련 논문 및 저서를 등록할 수 있습니다</p>
          <button class="px-6 py-3 bg-gray-800 text-gray-400 rounded-xl">준비 중</button>
        </div>
      </div>
    </div>
    
    <style>
      .career-tab {
        padding: 12px 24px;
        background: #1f2937;
        color: #9ca3af;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s;
        white-space: nowrap;
      }
      
      .career-tab:hover {
        background: #374151;
      }
      
      .career-tab.active {
        background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
        color: white;
      }
      
      .career-form {
        display: none;
      }
      
      .career-form.active {
        display: block;
      }
    </style>
  `;
}

// 탭 전환
function switchCareerTab(tab) {
  // 모든 탭 버튼과 폼 비활성화
  document.querySelectorAll('.career-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.career-form').forEach(form => form.classList.remove('active'));
  
  // 선택한 탭 활성화
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.add('active');
  
  // 해당 탭의 데이터 로드
  if (tab === 'exhibition') loadExhibitions();
  else if (tab === 'award') loadAwards();
  else if (tab === 'copyright') loadCopyrights();
}

// 전시회 제출
async function submitExhibition(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    exhibition_type: formData.get('exhibition_type'),
    title: formData.get('title'),
    location: formData.get('location'),
    organizer: formData.get('organizer') || '',
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date') || null,
    is_famous_venue: formData.get('is_famous_venue') === 'on',
    proof_document_url: formData.get('proof_document_url') || ''
  };
  
  const token = localStorage.getItem('session_token');
  
  try {
    const response = await fetch('/api/artist/exhibitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ 전시회 경력이 추가되었습니다!');
      event.target.reset();
      loadExhibitions();
      loadArtistRank(); // 랭크 새로고침
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Exhibition submission error:', error);
    alert('❌ 전시회 경력 추가 중 오류가 발생했습니다');
  }
}

// 수상 제출
async function submitAward(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    award_rank: parseInt(formData.get('award_rank')),
    award_name: formData.get('award_name'),
    competition_name: formData.get('competition_name'),
    organizer: formData.get('organizer'),
    award_date: formData.get('award_date'),
    is_international: formData.get('is_international') === 'on',
    certificate_url: formData.get('certificate_url') || '',
    proof_url: ''
  };
  
  const token = localStorage.getItem('session_token');
  
  try {
    const response = await fetch('/api/artist/awards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ 수상 경력이 추가되었습니다!');
      event.target.reset();
      loadAwards();
      loadArtistRank();
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Award submission error:', error);
    alert('❌ 수상 경력 추가 중 오류가 발생했습니다');
  }
}

// 저작권 제출
async function submitCopyright(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    artwork_title: formData.get('artwork_title'),
    registration_number: formData.get('registration_number'),
    registration_agency: formData.get('registration_agency'),
    registration_date: formData.get('registration_date'),
    certificate_url: formData.get('certificate_url'),
    country: formData.get('country')
  };
  
  const token = localStorage.getItem('session_token');
  
  try {
    const response = await fetch('/api/artist/copyrights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ 저작권 등록이 추가되었습니다!');
      event.target.reset();
      loadCopyrights();
      loadArtistRank();
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Copyright submission error:', error);
    alert('❌ 저작권 등록 중 오류가 발생했습니다');
  }
}

// 전시회 목록 로드
async function loadExhibitions() {
  const token = localStorage.getItem('session_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  try {
    const response = await fetch(`/api/artist/exhibitions?artist_id=${userData.id}`);
    const result = await response.json();
    
    const container = document.getElementById('exhibition-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(ex => `
        <div class="card-nft rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 class="text-white font-bold">${ex.title}</h4>
            <p class="text-gray-400 text-sm">${ex.location} · ${ex.start_date}</p>
          </div>
          <div class="text-right">
            <div class="text-purple-400 font-bold">${ex.points}점</div>
            <div class="text-xs ${ex.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}">
              ${ex.status === 'verified' ? '✓ 검증완료' : '⏳ 검증대기'}
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-center text-gray-400">등록된 전시회가 없습니다</p>';
    }
  } catch (error) {
    console.error('Load exhibitions error:', error);
  }
}

// 수상 목록 로드
async function loadAwards() {
  const token = localStorage.getItem('session_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  try {
    const response = await fetch(`/api/artist/awards?artist_id=${userData.id}`);
    const result = await response.json();
    
    const container = document.getElementById('award-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(award => `
        <div class="card-nft rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 class="text-white font-bold">${award.award_name}</h4>
            <p class="text-gray-400 text-sm">${award.competition_name} · ${award.award_date}</p>
          </div>
          <div class="text-right">
            <div class="text-yellow-400 font-bold">${award.points}점</div>
            <div class="text-xs ${award.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}">
              ${award.status === 'verified' ? '✓ 검증완료' : '⏳ 검증대기'}
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-center text-gray-400">등록된 수상이 없습니다</p>';
    }
  } catch (error) {
    console.error('Load awards error:', error);
  }
}

// 저작권 목록 로드
async function loadCopyrights() {
  const token = localStorage.getItem('session_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  try {
    const response = await fetch(`/api/artist/copyrights?artist_id=${userData.id}`);
    const result = await response.json();
    
    const container = document.getElementById('copyright-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(cr => `
        <div class="card-nft rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 class="text-white font-bold">${cr.artwork_title}</h4>
            <p class="text-gray-400 text-sm">${cr.registration_number} · ${cr.registration_date}</p>
          </div>
          <div class="text-right">
            <div class="text-green-400 font-bold">${cr.points}점</div>
            <div class="text-xs ${cr.status === 'verified' ? 'text-green-400' : 'text-yellow-400'}">
              ${cr.status === 'verified' ? '✓ 검증완료' : '⏳ 검증대기'}
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-center text-gray-400">등록된 저작권이 없습니다</p>';
    }
  } catch (error) {
    console.error('Load copyrights error:', error);
  }
}

// 랭크 재계산
async function recalculateRank() {
  const token = localStorage.getItem('session_token');
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  if (!confirm('랭크를 재계산하시겠습니까?')) return;
  
  try {
    const response = await fetch(`/api/artist/rank/recalculate/${userData.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ 랭크가 재계산되었습니다!');
      loadArtistRank();
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Rank recalculation error:', error);
    alert('❌ 랭크 재계산 중 오류가 발생했습니다');
  }
}

// 아티스트 랭크 로드
async function loadArtistRank(artistId) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const targetId = artistId || userData.id;
  
  try {
    const response = await fetch(`/api/artist/rank/${targetId}`);
    const result = await response.json();
    
    const container = document.getElementById('artist-rank-card');
    if (container) {
      container.innerHTML = getRankCardHTML(result.success ? result.data : null);
    }
  } catch (error) {
    console.error('Load rank error:', error);
    const container = document.getElementById('artist-rank-card');
    if (container) {
      container.innerHTML = getRankCardHTML(null);
    }
  }
}

// 경력 입력 폼 로드
function loadArtistCareerForm() {
  const container = document.getElementById('artist-career-form');
  if (container) {
    container.innerHTML = getCareerFormHTML();
    loadExhibitions(); // 기본 탭(전시회) 로드
  }
}
