/**
 * Progress Utilities for GalleryPia
 * 
 * Client-side progress management including:
 * - Dynamic progress bar updates
 * - Step indicator navigation
 * - File upload progress tracking
 * - Multi-item progress management
 * - Time estimation
 * - Progress animations
 * 
 * Addresses UX-M-002: Add progress indicators for multi-step processes
 * 
 * Usage:
 * ```javascript
 * // Update progress bar
 * updateProgress('#progress-bar', 65);
 * 
 * // Create progress tracker
 * const tracker = createProgressTracker('#container', {
 *   label: '파일 업로드 중...',
 *   showTime: true
 * });
 * tracker.update(50);
 * 
 * // Step navigation
 * goToStep(2);
 * completeStep(1);
 * 
 * // Multi-file upload tracking
 * const uploader = createMultiUploadTracker('#upload-container');
 * uploader.addFile('file1.jpg', 1024000);
 * uploader.updateProgress('file1.jpg', 50);
 * ```
 */

// =============================================================================
// Progress Bar Management
// =============================================================================

/**
 * Update progress bar value
 * @param {string|HTMLElement} target - Progress bar container or selector
 * @param {number} value - Progress value (0-100)
 * @param {Object} [options] - Update options
 */
function updateProgress(target, value, options = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const progressFill = element.querySelector('.progress-fill');
  const progressBar = element.querySelector('.progress-bar');
  const percentageText = element.querySelector('.progress-percentage');

  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Update aria attributes
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', clampedValue);
  }

  // Update fill width
  if (progressFill) {
    progressFill.style.width = `${clampedValue}%`;
  }

  // Update percentage text
  if (percentageText) {
    percentageText.textContent = `${Math.round(clampedValue)}%`;
  }

  // Fire custom event
  element.dispatchEvent(new CustomEvent('progress-updated', {
    detail: { value: clampedValue }
  }));
}

/**
 * Set progress bar to indeterminate state
 * @param {string|HTMLElement} target - Progress bar container or selector
 */
function setProgressIndeterminate(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const progressFill = element.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.classList.add('progress-indeterminate');
    progressFill.style.width = '100%';
  }
}

/**
 * Set progress bar to determinate state
 * @param {string|HTMLElement} target - Progress bar container or selector
 * @param {number} value - Initial value
 */
function setProgressDeterminate(target, value = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const progressFill = element.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.classList.remove('progress-indeterminate');
    updateProgress(element, value);
  }
}

/**
 * Complete progress (set to 100% and show success)
 * @param {string|HTMLElement} target - Progress bar container or selector
 * @param {string} [message] - Success message
 */
function completeProgress(target, message) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  updateProgress(element, 100);

  const progressFill = element.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.classList.remove('bg-blue-600');
    progressFill.classList.add('bg-green-600');
  }

  if (message) {
    const label = element.querySelector('.progress-label');
    if (label) {
      label.textContent = message;
    }
  }

  element.dispatchEvent(new CustomEvent('progress-completed'));
}

/**
 * Set progress to error state
 * @param {string|HTMLElement} target - Progress bar container or selector
 * @param {string} [message] - Error message
 */
function setProgressError(target, message) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const progressFill = element.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.classList.remove('bg-blue-600', 'bg-green-600');
    progressFill.classList.add('bg-red-600');
  }

  if (message) {
    const label = element.querySelector('.progress-label');
    if (label) {
      label.textContent = message;
    }
  }

  element.dispatchEvent(new CustomEvent('progress-error', {
    detail: { message }
  }));
}

// =============================================================================
// Progress Tracker Class
// =============================================================================

/**
 * Create progress tracker with time estimation
 * @param {string|HTMLElement} container - Container element or selector
 * @param {Object} options - Tracker options
 * @returns {Object} Progress tracker instance
 */
function createProgressTracker(container, options = {}) {
  const {
    label = '처리 중...',
    showTime = true,
    showFiles = false
  } = options;

  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return null;

  let startTime = Date.now();
  let currentValue = 0;

  const tracker = {
    update(value) {
      currentValue = value;
      updateProgress(element, value);

      if (showTime) {
        const elapsed = Date.now() - startTime;
        const remaining = calculateRemainingTime(value, elapsed);
        
        const infoElement = element.querySelector('.progress-info');
        if (infoElement) {
          infoElement.textContent = `남은 시간: ${remaining}`;
        }
      }
    },

    complete(message = '완료!') {
      completeProgress(element, message);
    },

    error(message = '오류 발생') {
      setProgressError(element, message);
    },

    reset() {
      startTime = Date.now();
      currentValue = 0;
      updateProgress(element, 0);
      
      const progressFill = element.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.classList.remove('bg-green-600', 'bg-red-600');
        progressFill.classList.add('bg-blue-600');
      }
    },

    getValue() {
      return currentValue;
    }
  };

  return tracker;
}

/**
 * Calculate remaining time based on progress
 * @param {number} progress - Current progress (0-100)
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @returns {string} Formatted time string
 */
function calculateRemainingTime(progress, elapsedMs) {
  if (progress === 0) return '계산 중...';
  
  const totalMs = (elapsedMs / progress) * 100;
  const remainingMs = totalMs - elapsedMs;
  
  const seconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `약 ${minutes}분 ${seconds % 60}초`;
  }
  
  return `약 ${seconds}초`;
}

// =============================================================================
// Step Indicator Management
// =============================================================================

const stepState = {
  currentStep: 0,
  steps: []
};

/**
 * Initialize step indicator
 * @param {string|HTMLElement} container - Step indicator container
 */
function initializeStepIndicator(container) {
  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return;

  const steps = element.querySelectorAll('.step');
  stepState.steps = Array.from(steps);
  stepState.currentStep = stepState.steps.findIndex(step => 
    step.classList.contains('step-current')
  );

  if (stepState.currentStep === -1) {
    stepState.currentStep = 0;
  }
}

/**
 * Go to specific step
 * @param {number} stepIndex - Step index (0-based)
 */
function goToStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= stepState.steps.length) return;

  // Update previous step
  if (stepState.currentStep !== stepIndex) {
    const currentStepEl = stepState.steps[stepState.currentStep];
    currentStepEl.classList.remove('step-current');
    currentStepEl.classList.add('step-completed');
    currentStepEl.setAttribute('aria-current', 'false');
  }

  // Update new step
  const newStepEl = stepState.steps[stepIndex];
  newStepEl.classList.remove('step-pending', 'step-completed');
  newStepEl.classList.add('step-current');
  newStepEl.setAttribute('aria-current', 'step');

  stepState.currentStep = stepIndex;

  // Fire custom event
  document.dispatchEvent(new CustomEvent('step-changed', {
    detail: { step: stepIndex }
  }));
}

/**
 * Go to next step
 */
function nextStep() {
  if (stepState.currentStep < stepState.steps.length - 1) {
    goToStep(stepState.currentStep + 1);
  }
}

/**
 * Go to previous step
 */
function previousStep() {
  if (stepState.currentStep > 0) {
    goToStep(stepState.currentStep - 1);
  }
}

/**
 * Complete current step and move to next
 */
function completeStep(stepIndex = stepState.currentStep) {
  if (stepIndex < 0 || stepIndex >= stepState.steps.length) return;

  const stepEl = stepState.steps[stepIndex];
  stepEl.classList.remove('step-pending', 'step-current');
  stepEl.classList.add('step-completed');

  if (stepIndex === stepState.currentStep && stepIndex < stepState.steps.length - 1) {
    nextStep();
  }
}

/**
 * Set step to error state
 * @param {number} stepIndex - Step index
 * @param {string} [message] - Error message
 */
function setStepError(stepIndex, message) {
  if (stepIndex < 0 || stepIndex >= stepState.steps.length) return;

  const stepEl = stepState.steps[stepIndex];
  stepEl.classList.add('step-error');

  if (message) {
    const description = stepEl.querySelector('.step-description');
    if (description) {
      description.textContent = message;
      description.classList.add('text-red-600');
    }
  }
}

/**
 * Get current step index
 * @returns {number} Current step index
 */
function getCurrentStep() {
  return stepState.currentStep;
}

// =============================================================================
// Multi-Item Progress Tracking
// =============================================================================

/**
 * Create multi-upload progress tracker
 * @param {string|HTMLElement} container - Container element
 * @returns {Object} Multi-upload tracker instance
 */
function createMultiUploadTracker(container) {
  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return null;

  const items = new Map();

  const tracker = {
    addFile(fileId, fileName, fileSize) {
      items.set(fileId, {
        id: fileId,
        label: fileName,
        size: fileSize,
        value: 0,
        status: 'uploading',
        startTime: Date.now()
      });

      this.render();
    },

    updateProgress(fileId, value) {
      const item = items.get(fileId);
      if (!item) return;

      item.value = value;
      
      if (value >= 100) {
        item.status = 'completed';
      }

      this.render();
    },

    setFileStatus(fileId, status) {
      const item = items.get(fileId);
      if (!item) return;

      item.status = status;
      this.render();
    },

    removeFile(fileId) {
      items.delete(fileId);
      this.render();
    },

    getOverallProgress() {
      if (items.size === 0) return 0;
      
      let total = 0;
      items.forEach(item => {
        total += item.value;
      });
      
      return total / items.size;
    },

    render() {
      const itemsArray = Array.from(items.values());
      const overall = this.getOverallProgress();

      // Update overall progress
      const overallBar = element.querySelector('.multi-progress-overall');
      if (overallBar) {
        updateProgress(overallBar, overall);
      }

      // Update items
      const itemsContainer = element.querySelector('.multi-progress-items');
      if (itemsContainer) {
        itemsContainer.innerHTML = itemsArray.map(item => 
          renderProgressItemHTML(item)
        ).join('');
      }
    },

    clear() {
      items.clear();
      this.render();
    }
  };

  return tracker;
}

/**
 * Render progress item HTML
 * @param {Object} item - Progress item data
 * @returns {string} HTML string
 */
function renderProgressItemHTML(item) {
  const statusIcons = {
    uploading: '<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/><path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>',
    processing: '<svg class="animate-pulse" width="16" height="16" fill="currentColor"><path d="M8 16a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>',
    completed: '<svg width="16" height="16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>',
    error: '<svg width="16" height="16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>'
  };

  const variant = item.status === 'error' ? 'danger' : item.status === 'completed' ? 'success' : 'primary';
  const variantClass = variant === 'danger' ? 'bg-red-600' : variant === 'success' ? 'bg-green-600' : 'bg-blue-600';

  return `
    <div class="progress-item progress-item-${item.status}" data-item-id="${item.id}">
      <div class="progress-item-header">
        <span class="progress-item-icon">${statusIcons[item.status]}</span>
        <span class="progress-item-label">${item.label}</span>
        ${item.size ? `<span class="progress-item-size">${formatFileSize(item.size)}</span>` : ''}
      </div>
      
      <div class="progress-container">
        <div class="progress-bar h-1" role="progressbar" aria-valuenow="${item.value}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill ${variantClass}" style="width: ${item.value}%"></div>
        </div>
        <span class="progress-percentage text-sm">${Math.round(item.value)}%</span>
      </div>
    </div>
  `;
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =============================================================================
// Circular Progress Management
// =============================================================================

/**
 * Update circular progress
 * @param {string|HTMLElement} target - Circular progress container
 * @param {number} value - Progress value (0-100)
 */
function updateCircularProgress(target, value) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const circle = element.querySelector('.circular-progress-fill');
  const text = element.querySelector('.circular-progress-text');

  if (!circle) return;

  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = parseFloat(circle.getAttribute('r'));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  circle.style.strokeDashoffset = offset;

  if (text) {
    text.textContent = `${Math.round(percentage)}%`;
  }
}

// =============================================================================
// Progress Animations
// =============================================================================

/**
 * Animate progress from current to target value
 * @param {string|HTMLElement} target - Progress bar container
 * @param {number} toValue - Target value
 * @param {number} [duration=500] - Animation duration in ms
 */
function animateProgress(target, toValue, duration = 500) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const progressBar = element.querySelector('.progress-bar');
  if (!progressBar) return;

  const fromValue = parseFloat(progressBar.getAttribute('aria-valuenow')) || 0;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = fromValue + (toValue - fromValue) * eased;

    updateProgress(element, currentValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// =============================================================================
// Auto-initialize
// =============================================================================

// Auto-initialize step indicators
document.addEventListener('DOMContentLoaded', () => {
  const stepIndicators = document.querySelectorAll('.step-indicator');
  stepIndicators.forEach(indicator => {
    initializeStepIndicator(indicator);
  });
});

// =============================================================================
// Export
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateProgress,
    setProgressIndeterminate,
    setProgressDeterminate,
    completeProgress,
    setProgressError,
    createProgressTracker,
    calculateRemainingTime,
    initializeStepIndicator,
    goToStep,
    nextStep,
    previousStep,
    completeStep,
    setStepError,
    getCurrentStep,
    createMultiUploadTracker,
    updateCircularProgress,
    animateProgress,
    formatFileSize
  };
}
