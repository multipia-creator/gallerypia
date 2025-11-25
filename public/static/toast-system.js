/**
 * GalleryPia - Advanced Toast System
 * Beautiful, accessible toast notifications
 */

class ToastSystem {
  constructor() {
    this.toasts = [];
    this.maxToasts = 5;
    this.defaultDuration = 4000;
    this.container = null;
    
    this.init();
  }

  init() {
    this.createContainer();
    console.log('Toast System initialized');
  }

  createContainer() {
    if (document.getElementById('toastContainer')) {
      this.container = document.getElementById('toastContainer');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'toastContainer';
    this.container.className = 'fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  }

  show(options) {
    // Support both object and string
    if (typeof options === 'string') {
      options = { message: options };
    }

    const {
      type = 'info',          // success, error, warning, info
      message,
      title,
      duration = this.defaultDuration,
      action,                 // { label: 'Undo', onClick: () => {} }
      dismissible = true,
      icon,
      position = 'top-right'
    } = options;

    // Remove oldest if max reached
    if (this.toasts.length >= this.maxToasts) {
      this.dismiss(this.toasts[0].id);
    }

    const toast = {
      id: Date.now() + Math.random(),
      type,
      message,
      title,
      duration,
      action,
      dismissible,
      icon: icon || this.getDefaultIcon(type)
    };

    this.toasts.push(toast);
    this.render(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, duration);
    }

    return toast.id;
  }

  render(toast) {
    const toastEl = document.createElement('div');
    toastEl.id = `toast-${toast.id}`;
    toastEl.className = `
      ${this.getToastClasses(toast.type)}
      min-w-[300px] max-w-md
      rounded-lg shadow-lg
      p-4
      flex items-start gap-3
      pointer-events-auto
      transform transition-all duration-300 ease-in-out
      translate-x-0 opacity-100
      animate-slideInRight
    `;
    toastEl.setAttribute('role', 'alert');

    // Icon
    const iconEl = document.createElement('div');
    iconEl.className = 'flex-shrink-0 text-xl';
    iconEl.innerHTML = toast.icon;

    // Content
    const contentEl = document.createElement('div');
    contentEl.className = 'flex-1 min-w-0';

    if (toast.title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'font-semibold text-sm mb-1';
      titleEl.textContent = toast.title;
      contentEl.appendChild(titleEl);
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'text-sm';
    messageEl.textContent = toast.message;
    contentEl.appendChild(messageEl);

    // Action button
    if (toast.action) {
      const actionEl = document.createElement('button');
      actionEl.className = 'text-sm font-medium underline hover:no-underline mt-2';
      actionEl.textContent = toast.action.label;
      actionEl.onclick = () => {
        toast.action.onClick();
        this.dismiss(toast.id);
      };
      contentEl.appendChild(actionEl);
    }

    // Dismiss button
    const actionsEl = document.createElement('div');
    actionsEl.className = 'flex-shrink-0 flex items-start gap-2';

    if (toast.dismissible) {
      const dismissBtn = document.createElement('button');
      dismissBtn.className = 'text-current opacity-70 hover:opacity-100 transition-opacity';
      dismissBtn.innerHTML = '<i class="fas fa-times"></i>';
      dismissBtn.setAttribute('aria-label', 'Close notification');
      dismissBtn.onclick = () => this.dismiss(toast.id);
      actionsEl.appendChild(dismissBtn);
    }

    toastEl.appendChild(iconEl);
    toastEl.appendChild(contentEl);
    toastEl.appendChild(actionsEl);

    this.container.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.style.transform = 'translateX(0)';
      toastEl.style.opacity = '1';
    });
  }

  dismiss(toastId) {
    const toastEl = document.getElementById(`toast-${toastId}`);
    if (!toastEl) return;

    // Slide out animation
    toastEl.style.transform = 'translateX(400px)';
    toastEl.style.opacity = '0';

    setTimeout(() => {
      toastEl.remove();
      this.toasts = this.toasts.filter(t => t.id !== toastId);
    }, 300);
  }

  dismissAll() {
    this.toasts.forEach(toast => {
      this.dismiss(toast.id);
    });
  }

  getToastClasses(type) {
    const classes = {
      success: 'bg-green-50 text-green-900 border-l-4 border-green-500',
      error: 'bg-red-50 text-red-900 border-l-4 border-red-500',
      warning: 'bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500',
      info: 'bg-blue-50 text-blue-900 border-l-4 border-blue-500'
    };
    return classes[type] || classes.info;
  }

  getDefaultIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle text-green-500"></i>',
      error: '<i class="fas fa-exclamation-circle text-red-500"></i>',
      warning: '<i class="fas fa-exclamation-triangle text-yellow-500"></i>',
      info: '<i class="fas fa-info-circle text-blue-500"></i>'
    };
    return icons[type] || icons.info;
  }

  // Convenience methods
  success(message, options = {}) {
    return this.show({ ...options, type: 'success', message });
  }

  error(message, options = {}) {
    return this.show({ ...options, type: 'error', message });
  }

  warning(message, options = {}) {
    return this.show({ ...options, type: 'warning', message });
  }

  info(message, options = {}) {
    return this.show({ ...options, type: 'info', message });
  }

  // Loading toast (doesn't auto-dismiss)
  loading(message, options = {}) {
    return this.show({
      ...options,
      type: 'info',
      message,
      icon: '<i class="fas fa-spinner fa-spin text-blue-500"></i>',
      duration: 0,
      dismissible: false
    });
  }

  // Promise toast (shows loading, then success/error)
  async promise(promise, messages = {}) {
    const {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Error occurred'
    } = messages;

    const loadingId = this.loading(loading);

    try {
      const result = await promise;
      this.dismiss(loadingId);
      this.success(success);
      return result;
    } catch (err) {
      this.dismiss(loadingId);
      this.error(typeof error === 'function' ? error(err) : error);
      throw err;
    }
  }
}

// Initialize
window.toastSystem = new ToastSystem();

// Convenience global functions
window.showToast = (message, options) => window.toastSystem.show(message, options);
window.showSuccessToast = (message, options) => window.toastSystem.success(message, options);
window.showErrorToast = (message, options) => window.toastSystem.error(message, options);
window.showWarningToast = (message, options) => window.toastSystem.warning(message, options);
window.showInfoToast = (message, options) => window.toastSystem.info(message, options);
window.showLoadingToast = (message, options) => window.toastSystem.loading(message, options);

// Replace alert() with toast (optional)
if (window.location.hostname !== 'localhost') {
  const originalAlert = window.alert;
  window.alert = function(message) {
    window.toastSystem.info(message);
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastSystem;
}
