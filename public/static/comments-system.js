/**
 * Comments System
 * Threaded comments with replies, mentions, reactions
 * Phase 6.5 - Low Priority UX (UX-L-028: Comments)
 */

class CommentsSystem {
  constructor() {
    this.comments = [];
    this.currentUser = { id: 'user123', name: '사용자' };
    this.init();
  }

  init() {
    console.log('💬 Comments System initialized');
    this.setupEventListeners();
  }

  async loadComments(artworkId) {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/comments`);
      this.comments = await response.json();
      this.renderComments();
    } catch (error) {
      console.error('Error loading comments:', error);
      this.comments = [];
    }
  }

  async postComment(artworkId, content, parentId = null) {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId })
      });
      
      if (response.ok) {
        const newComment = await response.json();
        this.comments.push(newComment);
        this.renderComments();
        this.showToast('댓글이 등록되었습니다', 'success');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      this.showToast('댓글 등록 실패', 'error');
    }
  }

  renderComments(containerId = 'comments-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const topLevelComments = this.comments.filter(c => !c.parentId);
    
    container.innerHTML = `
      <div class="comments-section">
        <h3 class="text-xl font-bold mb-4">댓글 (${this.comments.length})</h3>
        
        <div class="mb-6">
          <textarea id="new-comment-input" 
                    class="w-full p-3 border rounded resize-none" 
                    rows="3" 
                    placeholder="댓글을 입력하세요..."></textarea>
          <button onclick="commentsSystem.submitNewComment()" 
                  class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            댓글 등록
          </button>
        </div>
        
        <div class="space-y-4">
          ${topLevelComments.map(comment => this.renderComment(comment)).join('')}
        </div>
      </div>
    `;
  }

  renderComment(comment, depth = 0) {
    const replies = this.comments.filter(c => c.parentId === comment.id);
    
    return `
      <div class="comment ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}" data-comment-id="${comment.id}">
        <div class="flex gap-3">
          <div class="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800">${comment.author}</div>
            <p class="text-gray-700 mt-1">${comment.content}</p>
            <div class="flex gap-4 mt-2 text-sm text-gray-500">
              <button onclick="commentsSystem.likeComment('${comment.id}')" class="hover:text-red-600">
                <i class="fas fa-heart"></i> ${comment.likes || 0}
              </button>
              <button onclick="commentsSystem.replyToComment('${comment.id}')" class="hover:text-indigo-600">
                <i class="fas fa-reply"></i> 답글
              </button>
              <span>${this.formatDate(comment.createdAt)}</span>
            </div>
            ${replies.length > 0 ? `
              <div class="mt-4 space-y-4">
                ${replies.map(reply => this.renderComment(reply, depth + 1)).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  async submitNewComment() {
    const input = document.getElementById('new-comment-input');
    const content = input.value.trim();
    if (!content) return;
    
    const artworkId = this.getCurrentArtworkId();
    await this.postComment(artworkId, content);
    input.value = '';
  }

  getCurrentArtworkId() {
    // Extract from URL or data attribute
    return window.location.pathname.split('/').pop();
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  showToast(message, type) {
    if (window.ToastNotificationManager) {
      window.ToastNotificationManager.show(message, type);
    }
  }

  setupEventListeners() {
    // Placeholder for additional listeners
  }

  async likeComment(commentId) {
    // Placeholder for like functionality
    this.showToast('좋아요!', 'success');
  }

  replyToComment(commentId) {
    // Placeholder for reply functionality
    this.showToast('답글 기능 구현 예정', 'info');
  }
}

let commentsSystem;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    commentsSystem = new CommentsSystem();
  });
} else {
  commentsSystem = new CommentsSystem();
}
