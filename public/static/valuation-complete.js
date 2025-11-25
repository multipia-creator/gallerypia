// 완전한 NFT 가치평가 시스템 (5개 모듈)

const ETH_PRICE_KRW = 3000000; // 1 ETH = 3,000,000원

// 현재 평가 데이터 (초기 가격 1 ETH = 점수 50점 목표)
let evaluationData = {
  // 모듈 1: 작가 업적 - 목표 50점
  soloExhibitions: 3,
  groupExhibitions: 5,
  competitionAwards: 1,
  latestExhibitionYear: 2024,
  
  // 모듈 2: 작품 내용 - 목표 50점
  contentDepth: 50,
  expression: 50,
  originality: 50,
  collectionValue: 50,
  
  // 모듈 3: 인증 - 목표 40점 (블록체인만 체크)
  hasBlockchainHash: true,
  hasCopyright: false,
  hasLicense: false,
  
  // 모듈 4: 전문가 평가 항목 - 목표 50점
  techniqueMastery: 50,
  artHistoricalSignificance: 50,
  marketability: 50,
  developmentPotential: 50,
  
  // 모듈 5: 인기도 - 목표 50점
  youtubeViews: 10000,
  instagramEngagement: 1000,
  platformActivity: 100,
  googleTrends: 50,
  mediaCoverage: 2,
  
  // 가중치 (α1~α5)
  weights: {
    artist: 0.25,
    artwork: 0.30,
    certification: 0.15,
    expert: 0.20,
    popularity: 0.10
  }
};

// 모듈 1: 작가 업적 점수 계산
function calculateArtistAchievement() {
  const currentYear = new Date().getFullYear();
  
  const soloScore = evaluationData.soloExhibitions * 10;
  const groupScore = evaluationData.groupExhibitions * 5;
  
  const yearsDiff = currentYear - evaluationData.latestExhibitionYear;
  const recencyCoeff = yearsDiff <= 5 ? 1.0 : Math.max(0.2, 1.0 - (yearsDiff - 5) * 0.1);
  
  const awardScore = evaluationData.competitionAwards * 15;
  
  const exhibitionScore = (soloScore + groupScore) * 1.0 * recencyCoeff;
  const totalScore = exhibitionScore + awardScore;
  
  return Math.min(100, Math.round(totalScore));
}

// 모듈 2: 작품 내용 평가 점수 계산
function calculateArtworkContent() {
  const avg = (
    evaluationData.contentDepth +
    evaluationData.expression +
    evaluationData.originality +
    evaluationData.collectionValue
  ) / 4;
  
  return Math.round(avg);
}

// 모듈 3: 인증 점수 계산
function calculateCertification() {
  let score = 0;
  if (evaluationData.hasBlockchainHash) score += 40;
  if (evaluationData.hasCopyright) score += 40;
  if (evaluationData.hasLicense) score += 20;
  return score;
}

// 모듈 4: 전문가 평가 점수 (4개 항목 평균)
function calculateExpertEvaluation() {
  const avg = (
    evaluationData.techniqueMastery +
    evaluationData.artHistoricalSignificance +
    evaluationData.marketability +
    evaluationData.developmentPotential
  ) / 4;
  
  return Math.round(avg);
}

// 모듈 5: 인기도 점수 계산
function calculatePopularity() {
  const youtubeScore = Math.min(100, evaluationData.youtubeViews / 10000 * 100);
  const instagramScore = Math.min(100, evaluationData.instagramEngagement / 1000 * 100);
  const platformScore = Math.min(100, evaluationData.platformActivity / 100 * 100);
  const trendsScore = evaluationData.googleTrends;
  const mediaScore = Math.min(100, evaluationData.mediaCoverage * 10);
  
  return Math.round((youtubeScore + instagramScore + platformScore + trendsScore + mediaScore) / 5);
}

// 최종 가치 점수 계산
function calculateFinalValue() {
  const w = evaluationData.weights;
  
  // 각 모듈 점수 계산
  const artistScore = calculateArtistAchievement();
  const artworkScore = calculateArtworkContent();
  const certificationScore = calculateCertification();
  const expertScore = calculateExpertEvaluation();
  const popularityScore = calculatePopularity();
  
  // 최종 점수 = Σ(모듈점수 × 가중치)
  const finalScore = (
    artistScore * w.artist +
    artworkScore * w.artwork +
    certificationScore * w.certification +
    expertScore * w.expert +
    popularityScore * w.popularity
  );
  
  return {
    artistScore,
    artworkScore,
    certificationScore,
    expertScore,
    popularityScore,
    finalScore: Math.round(finalScore)
  };
}

// 점수를 원화로 환산 (점수 0 = 0 ETH, 점수 50 = 1 ETH (평균), 점수 100 = 100 ETH (최고))
function scoreToKRW(score) {
  // 점수가 0-100 사이일 때:
  // - 0점 = 0 ETH
  // - 50점 = 1 ETH (평균가격)
  // - 100점 = 100 ETH (최고가격)
  // 로그 스케일 적용하여 자연스러운 가격 곡선 생성
  
  if (score <= 0) return 0;
  if (score >= 100) return 100 * ETH_PRICE_KRW;
  
  // 50점을 기준으로 1 ETH
  // 0-50: 0 ~ 1 ETH (선형)
  // 50-100: 1 ~ 100 ETH (지수 곡선)
  
  let ethValue;
  if (score <= 50) {
    // 0-50점: 선형 증가 (0 ~ 1 ETH)
    ethValue = score / 50;
  } else {
    // 50-100점: 지수 곡선 (1 ~ 100 ETH)
    const normalized = (score - 50) / 50; // 0 ~ 1
    ethValue = 1 + (99 * Math.pow(normalized, 2)); // 1 ~ 100 ETH
  }
  
  return Math.round(ethValue * ETH_PRICE_KRW);
}

// 가격 포맷팅 - ETH 기반으로 변경
function formatPrice(priceKRW) {
  const priceETH = (priceKRW / ETH_PRICE_KRW).toFixed(4);
  const formattedKRW = priceKRW.toLocaleString();
  return `${priceETH} ETH (₩${formattedKRW})`;
}

// UI 업데이트
function updateUI() {
  const scores = calculateFinalValue();
  const estimatedValueKRW = scoreToKRW(scores.finalScore);
  const estimatedValueETH = (estimatedValueKRW / ETH_PRICE_KRW).toFixed(4);
  
  // 모듈별 점수 표시
  document.getElementById('module1Score').textContent = scores.artistScore;
  document.getElementById('module2Score').textContent = scores.artworkScore;
  document.getElementById('module3Score').textContent = scores.certificationScore;
  document.getElementById('module4Score').textContent = scores.expertScore;
  document.getElementById('module5Score').textContent = scores.popularityScore;
  
  // 최종 점수 및 가치
  document.getElementById('finalScore').textContent = scores.finalScore.toFixed(1);
  document.getElementById('estimatedValueKRW').textContent = formatPrice(estimatedValueKRW);
  // ETH 가치는 이미 formatPrice에 포함되어 있으므로 별도 업데이트 불필요
  if (document.getElementById('estimatedValueETH')) {
    document.getElementById('estimatedValueETH').textContent = estimatedValueETH + ' ETH';
  }
  
  // 가중치 합계 확인
  const weightSum = Object.values(evaluationData.weights).reduce((a, b) => a + b, 0);
  const weightSumElement = document.getElementById('weightSum');
  if (weightSumElement) {
    weightSumElement.textContent = weightSum.toFixed(2);
    // 가중치 합이 1.0에 가까우면 초록색, 아니면 빨간색
    const isValid = Math.abs(weightSum - 1.0) < 0.01;
    weightSumElement.className = 'text-3xl font-black ' + (isValid ? 'text-green-400' : 'text-red-400');
  }
  
  // 프로그레스 바 업데이트
  updateProgressBars(scores);
}

// 프로그레스 바 업데이트
function updateProgressBars(scores) {
  const bars = [
    { id: 'bar1', score: scores.artistScore },
    { id: 'bar2', score: scores.artworkScore },
    { id: 'bar3', score: scores.certificationScore },
    { id: 'bar4', score: scores.expertScore },
    { id: 'bar5', score: scores.popularityScore }
  ];
  
  bars.forEach(bar => {
    const element = document.getElementById(bar.id);
    if (element) {
      element.style.width = bar.score + '%';
    }
  });
}

// 슬라이더 값 업데이트
function updateSliderValue(id, displayId) {
  const value = parseInt(document.getElementById(id).value);
  document.getElementById(displayId).textContent = value;
  
  // evaluationData 업데이트
  const mapping = {
    'contentDepth': 'contentDepth',
    'expression': 'expression',
    'originality': 'originality',
    'collectionValue': 'collectionValue',
    'techniqueMastery': 'techniqueMastery',
    'artHistoricalSignificance': 'artHistoricalSignificance',
    'marketability': 'marketability',
    'developmentPotential': 'developmentPotential',
    'googleTrends': 'googleTrends'
  };
  
  if (mapping[id]) {
    evaluationData[mapping[id]] = value;
  }
  
  updateUI();
}

// 숫자 입력 업데이트
function updateNumberInput(id) {
  const value = parseInt(document.getElementById(id).value) || 0;
  evaluationData[id] = value;
  updateUI();
}

// 가중치 슬라이더 업데이트 (0-100 범위를 0.00-1.00으로 변환)
function updateWeightSlider(module, displayId) {
  const value = parseInt(document.getElementById('weight' + module).value) || 0;
  const weightValue = value / 100; // 0-100을 0.00-1.00으로 변환
  
  evaluationData.weights[module.toLowerCase()] = weightValue;
  
  // 디스플레이 업데이트 (퍼센트로 표시)
  document.getElementById(displayId).textContent = value + '%';
  
  updateUI();
}

// 가중치 업데이트 (기존 함수 - 호환성 유지)
function updateWeight(module) {
  const value = parseFloat(document.getElementById('weight' + module).value) || 0;
  evaluationData.weights[module.toLowerCase()] = value;
  updateUI();
}

// 체크박스 업데이트
function updateCheckbox(id) {
  evaluationData[id] = document.getElementById(id).checked;
  updateUI();
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  updateUI();
});
