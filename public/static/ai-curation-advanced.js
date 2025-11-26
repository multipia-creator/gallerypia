/** GALLERYPIA - AI Curation Advanced (Phase 19) */
class AICurationAdvanced {
  constructor() { this.init(); }
  init() { console.log('🤖 AI Curation Advanced initializing...'); }
  async autoC urate(theme, count = 20) {
    const response = await fetch('/api/ai/auto-curate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, count })
    });
    return await response.json();
  }
  async evaluateArtwork(artworkId) {
    const response = await fetch(`/api/ai/evaluate/${artworkId}`);
    return await response.json();
  }
}
window.AICurationAdvanced = AICurationAdvanced;
window.aiCuration = null;
window.initAICuration = () => {
  if (!window.aiCuration) {
    window.aiCuration = new AICurationAdvanced();
    console.log('✅ AI Curation Advanced initialized');
  }
  return window.aiCuration;
};
console.log('📦 AI Curation Advanced module loaded');
