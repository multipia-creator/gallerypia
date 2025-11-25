// 새로운 가치산정 로직 (논문 기준)

// ETH 현재 시세 (실제로는 API에서 가져와야 함)
const ETH_PRICE_KRW = 4500000; // 1 ETH = 4,500,000원

// 작가 업적 점수 계산
function calculateArtistAchievement() {
  const currentYear = new Date().getFullYear();
  
  const soloExhibitions = parseInt(document.getElementById('soloExhibitions').value) || 0;
  const groupExhibitions = parseInt(document.getElementById('groupExhibitions').value) || 0;
  const awards = parseInt(document.getElementById('competitionAwards').value) || 0;
  const latestYear = parseInt(document.getElementById('latestExhibitionYear').value) || currentYear;
  
  // 전시 점수 (개인전: 10점, 단체전: 5점)
  const soloScore = soloExhibitions * 10;
  const groupScore = groupExhibitions * 5;
  
  // 권위도 가중치 (단순화)
  const authorityWeight = 1.0;
  
  // 최신성 계수
  const yearsDiff = currentYear - latestYear;
  const recencyCoefficient = yearsDiff <= 5 ? 1.0 : Math.max(0.2, 1.0 - (yearsDiff - 5) * 0.1);
  
  // 수상 가산점
  const awardScore = awards * 15;
  
  // 작가 업적 점수 = Σ(전시점수 × 권위도 × 최신성) + 수상점수
  const exhibitionScore = (soloScore + groupScore) * authorityWeight * recencyCoefficient;
  const totalScore = exhibitionScore + awardScore;
  
  // 0-100 정규화
  return Math.min(100, Math.round(totalScore));
}

// 가치 계산
function calculateValue() {
  // 작가 업적 점수
  const artistAchievement = calculateArtistAchievement();
  
  // 정량적 평가 점수들
  const marketDemand = parseFloat(document.getElementById('marketDemand').value) || 0;
  const rarity = parseFloat(document.getElementById('rarity').value) || 0;
  
  // 정성적 평가 점수들
  const artisticQuality = parseFloat(document.getElementById('artisticQuality').value) || 0;
  const originality = parseFloat(document.getElementById('originality').value) || 0;
  const culturalSignificance = parseFloat(document.getElementById('culturalSignificance').value) || 0;
  const technicalExcellence = parseFloat(document.getElementById('technicalExcellence').value) || 0;
  
  // 정량적 점수 (30%)
  // 작가 업적 40%, 시장 수요 30%, 희소성 30%
  const quantScore = ((artistAchievement * 0.4 + marketDemand * 0.3 + rarity * 0.3) * 0.3);
  
  // 정성적 점수 (70%)
  const qualScore = ((artisticQuality * 0.35 + originality * 0.3 + culturalSignificance * 0.2 + technicalExcellence * 0.15) * 0.7);
  
  // 종합 점수
  const totalScore = quantScore + qualScore;
  
  // 기본 가격 (1천만원)
  const basePrice = 10000000;
  
  // 최종 가치 = 기본 가격 × (1 + 종합점수/10)
  const estimatedValue = Math.round(basePrice * (1 + totalScore / 10));
  
  // ETH 환산
  const estimatedValueEth = (estimatedValue / ETH_PRICE_KRW).toFixed(4);
  
  // UI 업데이트
  document.getElementById('artistAchievementValue').textContent = artistAchievement + '/100';
  document.getElementById('artistAchievementScore').textContent = artistAchievement;
  document.getElementById('quantScore').textContent = quantScore.toFixed(1);
  document.getElementById('qualScore').textContent = qualScore.toFixed(1);
  document.getElementById('totalScore').textContent = totalScore.toFixed(1);
  document.getElementById('estimatedValue').innerHTML = formatPrice(estimatedValue) + '<br><span class="text-cyan-400 text-3xl">' + estimatedValueEth + ' ETH</span>';
  document.getElementById('baseValue').textContent = formatPrice(basePrice);
}

// 슬라이더 값 업데이트
function updateSliderValue(id) {
  const slider = document.getElementById(id);
  const valueDisplay = document.getElementById(id + 'Value');
  valueDisplay.textContent = slider.value + '/100';
  calculateValue();
}

// 가격 포맷팅
function formatPrice(price) {
  if (price >= 100000000) return (price / 100000000).toFixed(1) + '억원';
  else if (price >= 10000) return (price / 10000).toFixed(0) + '만원';
  return price.toLocaleString() + '원';
}
