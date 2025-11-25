/**
 * Interaction Animations
 * Delightful micro-interactions for user actions
 * Version: 1.0.0
 */

// Like/Favorite Button Animations
class LikeButtonManager {
  constructor() {
    this.init();
  }
  
  init() {
    document.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('.like-button, [data-like-button]');
      if (likeBtn) {
        this.handleLike(likeBtn);
      }
    });
  }
  
  handleLike(button) {
    const isLiked = button.classList.contains('liked');
    
    if (!isLiked) {
      button.classList.add('liked');
      this.animateLike(button);
      this.createParticles(button);
    } else {
      button.classList.remove('liked');
      this.animateUnlike(button);
    }
  }
  
  animateLike(button) {
    button.style.animation = 'heartBeat 0.6s ease';
    setTimeout(() => {
      button.style.animation = '';
    }, 600);
  }
  
  animateUnlike(button) {
    button.style.animation = 'heartShrink 0.3s ease';
    setTimeout(() => {
      button.style.animation = '';
    }, 300);
  }
  
  createParticles(button) {
    const particles = ['♥', '✨', '⭐'];
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'like-particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top}px;
          font-size: ${12 + Math.random() * 8}px;
          color: #f093fb;
          pointer-events: none;
          z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (Math.random() - 0.5) * 120;
        const distance = 30 + Math.random() * 40;
        
        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.sin(angle * Math.PI / 180) * distance}px, ${-distance}px) scale(0.5)`, opacity: 0 }
        ], {
          duration: 800,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => particle.remove(), 800);
      }, i * 50);
    }
  }
}

// Save/Bookmark Animation
class BookmarkManager {
  constructor() {
    this.init();
  }
  
  init() {
    document.addEventListener('click', (e) => {
      const bookmarkBtn = e.target.closest('.bookmark-button, [data-bookmark-button]');
      if (bookmarkBtn) {
        this.handleBookmark(bookmarkBtn);
      }
    });
  }
  
  handleBookmark(button) {
    const isBookmarked = button.classList.contains('bookmarked');
    
    if (!isBookmarked) {
      button.classList.add('bookmarked');
      this.animateBookmark(button);
      this.showToast('Added to bookmarks');
    } else {
      button.classList.remove('bookmarked');
      this.showToast('Removed from bookmarks');
    }
  }
  
  animateBookmark(button) {
    button.style.animation = 'bookmarkFill 0.5s ease forwards';
    setTimeout(() => {
      button.style.animation = '';
    }, 500);
  }
  
  showToast(message) {
    if (window.showSuccess) {
      window.showSuccess(message, { duration: 2000 });
    }
  }
}

// Card Flip Effect
class CardFlipManager {
  constructor() {
    this.init();
  }
  
  init() {
    const flipCards = document.querySelectorAll('.flip-card, [data-flip-card]');
    flipCards.forEach(card => {
      card.addEventListener('click', () => this.flipCard(card));
    });
  }
  
  flipCard(card) {
    card.classList.toggle('flipped');
  }
}

// Button Gradient Shift
class GradientButtonManager {
  constructor() {
    this.init();
  }
  
  init() {
    const gradientButtons = document.querySelectorAll('.gradient-button, [data-gradient-button]');
    
    gradientButtons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        this.startGradientShift(button);
      });
      
      button.addEventListener('mouseleave', (e) => {
        this.stopGradientShift(button);
      });
    });
  }
  
  startGradientShift(button) {
    button.style.backgroundSize = '200% 200%';
    button.style.animation = 'gradientShift 2s ease infinite';
  }
  
  stopGradientShift(button) {
    button.style.animation = '';
  }
}

// Initialize all managers
window.likeButtonManager = new LikeButtonManager();
window.bookmarkManager = new BookmarkManager();
window.cardFlipManager = new CardFlipManager();
window.gradientButtonManager = new GradientButtonManager();

console.log('✅ Interaction Animations initialized');
