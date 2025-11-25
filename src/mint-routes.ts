// NFT 민팅 관련 라우트
export const mintPageContent = `
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h1 class="text-6xl font-black mb-4">
                <span class="text-gradient">NFT</span> <span class="text-white">민팅</span>
            </h1>
            <p class="text-gray-400 text-lg">가치평가가 완료된 작품을 NFT로 발행하세요</p>
        </div>
        
        <div id="mintContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <p class="text-gray-400 text-center col-span-full">로딩 중...</p>
        </div>
    </div>
</section>

<script>
  async function loadMintableArtworks() {
    try {
      const response = await axios.get('/api/artworks?status=approved&limit=20');
      const artworks = response.data.data;
      
      const content = document.getElementById('mintContent');
      if (!artworks || artworks.length === 0) {
        content.innerHTML = '<p class="text-gray-400 text-center col-span-full">민팅 가능한 작품이 없습니다.</p>';
        return;
      }
      
      content.innerHTML = artworks.map(artwork => \`
        <div class="card-nft rounded-3xl overflow-hidden">
            <div class="relative aspect-square bg-gray-900 overflow-hidden">
                <img src="\${artwork.image_url}" alt="\${artwork.title}" class="w-full h-full object-cover img-nft">
                \${artwork.is_minted ? \`
                <div class="absolute top-4 left-4">
                    <span class="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center">
                        <i class="fas fa-check-circle mr-1.5"></i>민팅 완료
                    </span>
                </div>
                \` : \`
                <div class="absolute top-4 left-4">
                    <span class="px-3 py-1.5 bg-yellow-600 text-white text-xs font-bold rounded-full flex items-center">
                        <i class="fas fa-clock mr-1.5"></i>민팅 가능
                    </span>
                </div>
                \`}
            </div>
            <div class="p-6">
                <h3 class="font-bold text-xl text-white mb-3">\${artwork.title}</h3>
                <div class="flex items-center mb-4">
                    <img src="\${artwork.artist_profile_image}" class="w-8 h-8 rounded-full mr-2 object-cover border border-white border-opacity-20">
                    <span class="text-sm text-gray-400 font-medium">\${artwork.artist_name}</span>
                </div>
                
                <div class="bg-white bg-opacity-5 rounded-xl p-4 mb-4">
                    <div class="text-xs text-gray-500 mb-2">AI 산정가</div>
                    <div class="font-black text-lg text-gradient mb-3">\${formatPrice(artwork.estimated_value)}</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <div class="text-gray-500">정량 평가</div>
                            <div class="text-white font-semibold">\${((artwork.market_demand_score * 0.5 + artwork.rarity_score * 0.5) * 0.3).toFixed(1)}</div>
                        </div>
                        <div>
                            <div class="text-gray-500">정성 평가</div>
                            <div class="text-white font-semibold">\${((artwork.artistic_quality_score * 0.35 + artwork.originality_score * 0.3 + artwork.cultural_significance_score * 0.2 + artwork.technical_excellence_score * 0.15) * 0.7).toFixed(1)}</div>
                        </div>
                    </div>
                </div>
                
                \${!artwork.is_minted ? \`
                <button onclick="mintNFT(\${artwork.id}, '\${artwork.title}', \${artwork.estimated_value})" class="w-full btn-neon px-4 py-3 rounded-xl text-white font-bold text-sm">
                    <i class="fas fa-hammer mr-2"></i>
                    NFT 민팅하기
                </button>
                \` : \`
                <a href="/artwork/\${artwork.id}" class="block w-full text-center px-4 py-3 rounded-xl bg-white bg-opacity-5 text-white font-bold text-sm hover:bg-opacity-10 transition-all neon-border">
                    <i class="fas fa-eye mr-2"></i>
                    상세보기
                </a>
                \`}
            </div>
        </div>
      \`).join('');
    } catch (error) {
      document.getElementById('mintContent').innerHTML = '<p class="text-red-500 text-center col-span-full">데이터를 불러오는데 실패했습니다.</p>';
    }
  }
  
  function formatPrice(price) {
    if (price >= 100000000) return (price / 100000000).toFixed(1) + '억원';
    else if (price >= 10000) return (price / 10000).toFixed(0) + '만원';
    return price.toLocaleString() + '원';
  }
  
  async function mintNFT(artworkId, title, price) {
    if (!currentAccount) {
      alert('먼저 메타마스크 지갑을 연결해주세요.');
      await connectMetaMask();
      return;
    }
    
    try {
      const confirm = window.confirm(\`"\${title}"을(를) NFT로 민팅하시겠습니까?\\n\\n산정가: \${formatPrice(price)}\\n가스비가 발생할 수 있습니다.\`);
      if (!confirm) return;
      
      alert('NFT 민팅이 시작되었습니다.\\n\\n트랜잭션이 처리되는 동안 잠시 기다려주세요.');
      
      const response = await axios.post('/api/mint-nft', {
        artwork_id: artworkId,
        wallet_address: currentAccount,
        price: price
      });
      
      if (response.data.success) {
        alert('NFT 민팅이 완료되었습니다!');
        location.reload();
      }
    } catch (error) {
      console.error('민팅 실패:', error);
      alert('NFT 민팅에 실패했습니다. 다시 시도해주세요.');
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadMintableArtworks);
</script>
`;
