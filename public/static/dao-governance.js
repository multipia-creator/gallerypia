/** GALLERYPIA - DAO Governance System (Phase 15) */
class DAOGovernance {
  constructor() { this.init(); }
  init() { console.log('🏛️ DAO Governance initializing...'); }
  async createProposal(title, description) {
    const response = await fetch('/api/dao/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    return await response.json();
  }
  async vote(proposalId, choice) {
    const response = await fetch(`/api/dao/vote/${proposalId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice })
    });
    return await response.json();
  }
}
window.DAOGovernance = DAOGovernance;
window.dao = null;
window.initDAO = () => {
  if (!window.dao) {
    window.dao = new DAOGovernance();
    console.log('✅ DAO Governance initialized');
  }
  return window.dao;
};
console.log('📦 DAO Governance module loaded');
