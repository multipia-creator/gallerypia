/**
 * Parallax Scrolling Utilities
 * Layered scrolling effects for depth
 * Version: 1.0.0
 */

class ParallaxManager {
  constructor(options = {}) {
    this.elements = [];
    this.ticking = false;
    this.lastScrollY = 0;
    this.enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.enabled) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.discoverElements();
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      this.lastScrollY = window.scrollY;
      this.requestTick();
    }, { passive: true });
    
    window.addEventListener('resize', () => {
      this.update();
    });
  }
  
  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
  
  discoverElements() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const direction = el.dataset.parallaxDirection || 'vertical'; // vertical, horizontal
      const offset = parseFloat(el.dataset.parallaxOffset) || 0;
      
      this.elements.push({
        el,
        speed,
        direction,
        offset,
        initialTop: el.offsetTop,
        initialLeft: el.offsetLeft
      });
    });
  }
  
  addElement(element, speed = 0.5, direction = 'vertical', offset = 0) {
    this.elements.push({
      el: element,
      speed,
      direction,
      offset,
      initialTop: element.offsetTop,
      initialLeft: element.offsetLeft
    });
  }
  
  update() {
    if (!this.enabled) return;
    
    const scrollY = this.lastScrollY;
    const windowHeight = window.innerHeight;
    
    this.elements.forEach(item => {
      const { el, speed, direction, offset, initialTop } = item;
      
      // Check if element is in viewport
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < windowHeight && rect.bottom > 0;
      
      if (!isInViewport) return;
      
      // Calculate parallax offset
      const scrollProgress = (scrollY - initialTop + windowHeight) / (windowHeight + rect.height);
      const parallaxAmount = scrollProgress * speed * 100;
      
      if (direction === 'vertical') {
        el.style.transform = `translateY(${parallaxAmount + offset}px)`;
      } else if (direction === 'horizontal') {
        el.style.transform = `translateX(${parallaxAmount + offset}px)`;
      }
    });
  }
  
  destroy() {
    this.elements.forEach(item => {
      item.el.style.transform = '';
    });
    this.elements = [];
  }
}

// Layered parallax for hero sections
class LayeredParallax {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.layers = options.layers || [];
    this.ticking = false;
    this.lastScrollY = 0;
    
    this.init();
  }
  
  init() {
    this.createLayers();
    this.bindEvents();
  }
  
  createLayers() {
    this.layers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = 'parallax-layer';
      layerEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${layer.image}');
        background-size: cover;
        background-position: center;
        z-index: ${index};
      `;
      
      layerEl.dataset.speed = layer.speed || 0.5;
      this.container.appendChild(layerEl);
    });
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      this.lastScrollY = window.scrollY;
      this.requestTick();
    }, { passive: true });
  }
  
  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
  
  update() {
    const layers = this.container.querySelectorAll('.parallax-layer');
    const scrollY = this.lastScrollY;
    
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed);
      const yPos = -(scrollY * speed);
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

// Mouse parallax effect
class MouseParallax {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.sensitivity = options.sensitivity || 10;
    this.elements = this.container.querySelectorAll('[data-mouse-parallax]');
    
    this.init();
  }
  
  init() {
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const offsetX = (e.clientX - centerX) / this.sensitivity;
      const offsetY = (e.clientY - centerY) / this.sensitivity;
      
      this.elements.forEach(el => {
        const depth = parseFloat(el.dataset.mouseParallax) || 1;
        const x = offsetX * depth;
        const y = offsetY * depth;
        
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.elements.forEach(el => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }
}

// Artwork detail parallax
class ArtworkParallax {
  constructor(imageId, options = {}) {
    this.image = document.getElementById(imageId);
    if (!this.image) return;
    
    this.intensity = options.intensity || 20;
    this.ticking = false;
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      this.requestTick();
    }, { passive: true });
  }
  
  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
  
  update() {
    const rect = this.image.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1)
    const scrollProgress = 1 - (rect.top / windowHeight);
    
    if (scrollProgress >= 0 && scrollProgress <= 1) {
      const offset = scrollProgress * this.intensity;
      this.image.style.transform = `translateY(${offset}px) scale(1.1)`;
    }
  }
}

// Global helper functions
window.initParallax = function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('⚠️ Parallax disabled due to reduced motion preference');
    return;
  }
  
  window.parallaxManager = new ParallaxManager();
  console.log('✅ Parallax Manager initialized');
};

window.createLayeredParallax = function(containerId, layers) {
  return new LayeredParallax(containerId, { layers });
};

window.createMouseParallax = function(containerId, sensitivity) {
  return new MouseParallax(containerId, { sensitivity });
};

window.createArtworkParallax = function(imageId, intensity) {
  return new ArtworkParallax(imageId, { intensity });
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Auto-discover and initialize parallax elements
  const hasParallaxElements = document.querySelector('[data-parallax]');
  
  if (hasParallaxElements) {
    window.initParallax();
  }
  
  // Initialize layered parallax for hero sections
  const heroParallax = document.getElementById('hero-parallax');
  if (heroParallax && heroParallax.dataset.layers) {
    try {
      const layers = JSON.parse(heroParallax.dataset.layers);
      window.createLayeredParallax('hero-parallax', layers);
    } catch (e) {
      console.error('Failed to parse parallax layers:', e);
    }
  }
  
  // Initialize mouse parallax for interactive sections
  const mouseParallaxSections = document.querySelectorAll('[data-mouse-parallax-container]');
  mouseParallaxSections.forEach(section => {
    const sensitivity = parseFloat(section.dataset.mouseParallaxContainer) || 10;
    window.createMouseParallax(section.id, sensitivity);
  });
});

console.log('✅ Parallax Utilities loaded');
