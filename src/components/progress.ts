/**
 * Progress Indicator Component Library for GalleryPia
 * 
 * Provides progress indicators for:
 * - Multi-step forms and wizards
 * - File upload progress
 * - Task completion tracking
 * - Loading percentages
 * - Step-by-step processes
 * 
 * Addresses UX-M-002: Add progress indicators for multi-step processes
 * 
 * Features:
 * - Linear progress bars with percentage
 * - Circular/radial progress indicators
 * - Step indicators (wizard style)
 * - Multi-track progress (multiple uploads)
 * - Animated transitions
 * - ARIA accessible (aria-valuenow, aria-valuemin, aria-valuemax)
 * - Customizable themes and colors
 * 
 * Usage:
 * ```typescript
 * import { renderProgressBar, renderStepIndicator } from './components/progress'
 * 
 * // Linear progress bar
 * const progressHtml = renderProgressBar({
 *   value: 65,
 *   label: '업로드 중...',
 *   showPercentage: true
 * });
 * 
 * // Step indicator
 * const stepsHtml = renderStepIndicator({
 *   steps: [
 *     { label: '기본 정보', status: 'completed' },
 *     { label: '작품 등록', status: 'current' },
 *     { label: '평가 요청', status: 'pending' }
 *   ]
 * });
 * 
 * // Circular progress
 * const circularHtml = renderCircularProgress({
 *   value: 75,
 *   size: 64,
 *   label: '처리 중'
 * });
 * ```
 */

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  
  /** Progress bar label */
  label?: string;
  
  /** Show percentage text */
  showPercentage?: boolean;
  
  /** Progress bar color/variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  
  /** Progress bar size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Animated progress */
  animated?: boolean;
  
  /** Striped pattern */
  striped?: boolean;
  
  /** Additional info text */
  info?: string;
  
  /** Maximum value (default 100) */
  max?: number;
  
  /** Indeterminate progress (loading) */
  indeterminate?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface CircularProgressProps {
  /** Progress value (0-100) */
  value: number;
  
  /** Circle size in pixels */
  size?: number;
  
  /** Stroke width */
  strokeWidth?: number;
  
  /** Progress color */
  color?: string;
  
  /** Background track color */
  trackColor?: string;
  
  /** Show percentage in center */
  showPercentage?: boolean;
  
  /** Label text in center */
  label?: string;
  
  /** Icon in center */
  icon?: string;
  
  /** Additional CSS classes */
  className?: string;
}

export interface StepIndicatorProps {
  /** Array of steps */
  steps: Step[];
  
  /** Current step index (0-based) */
  currentStep?: number;
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Show step numbers */
  showNumbers?: boolean;
  
  /** Allow clicking on completed steps */
  clickable?: boolean;
  
  /** Step click handler function name */
  onStepClick?: string;
  
  /** Additional CSS classes */
  className?: string;
}

export interface Step {
  /** Step label */
  label: string;
  
  /** Step description */
  description?: string;
  
  /** Step status */
  status: 'pending' | 'current' | 'completed' | 'error';
  
  /** Step icon (optional) */
  icon?: string;
  
  /** Is step optional */
  optional?: boolean;
}

export interface MultiProgressProps {
  /** Array of progress items */
  items: ProgressItem[];
  
  /** Show individual labels */
  showLabels?: boolean;
  
  /** Maximum items to show */
  maxItems?: number;
  
  /** Show overall progress */
  showOverall?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface ProgressItem {
  /** Item ID */
  id: string;
  
  /** Item label */
  label: string;
  
  /** Progress value (0-100) */
  value: number;
  
  /** Item status */
  status?: 'uploading' | 'processing' | 'completed' | 'error';
  
  /** File size (optional) */
  size?: number;
}

// =============================================================================
// Linear Progress Bar
// =============================================================================

/**
 * Render linear progress bar
 */
export function renderProgressBar(props: ProgressBarProps): string {
  const {
    value,
    label,
    showPercentage = true,
    variant = 'primary',
    size = 'md',
    animated = false,
    striped = false,
    info,
    max = 100,
    indeterminate = false,
    className = ''
  } = props;

  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  const progressId = `progress-${Date.now()}`;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-cyan-600'
  };

  return `
    <div class="progress-container ${className}">
      ${label || showPercentage ? `
        <div class="progress-header">
          ${label ? `<span class="progress-label">${label}</span>` : ''}
          ${showPercentage ? `<span class="progress-percentage">${Math.round(percentage)}%</span>` : ''}
        </div>
      ` : ''}
      
      <div 
        class="progress-bar ${sizeClasses[size]}"
        role="progressbar"
        aria-valuenow="${value}"
        aria-valuemin="0"
        aria-valuemax="${max}"
        aria-label="${label || 'Progress'}">
        
        <div 
          class="progress-fill ${variantClasses[variant]} ${striped ? 'progress-striped' : ''} ${animated ? 'progress-animated' : ''} ${indeterminate ? 'progress-indeterminate' : ''}"
          style="width: ${indeterminate ? '100%' : percentage + '%'}">
        </div>
      </div>
      
      ${info ? `<div class="progress-info">${info}</div>` : ''}
    </div>
  `;
}

/**
 * Render determinate progress with time estimate
 */
export function renderProgressWithTime(props: {
  value: number;
  label: string;
  timeRemaining?: string;
  filesProcessed?: string;
}): string {
  const { value, label, timeRemaining, filesProcessed } = props;

  return `
    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-label">${label}</span>
        <span class="progress-percentage">${Math.round(value)}%</span>
      </div>
      
      ${renderProgressBar({ value, showPercentage: false })}
      
      <div class="progress-meta">
        ${timeRemaining ? `<span class="text-sm text-gray-600">남은 시간: ${timeRemaining}</span>` : ''}
        ${filesProcessed ? `<span class="text-sm text-gray-600">${filesProcessed}</span>` : ''}
      </div>
    </div>
  `;
}

// =============================================================================
// Circular Progress
// =============================================================================

/**
 * Render circular progress indicator
 */
export function renderCircularProgress(props: CircularProgressProps): string {
  const {
    value,
    size = 64,
    strokeWidth = 4,
    color = '#3b82f6',
    trackColor = '#e5e7eb',
    showPercentage = true,
    label,
    icon,
    className = ''
  } = props;

  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return `
    <div class="circular-progress ${className}" style="width: ${size}px; height: ${size}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <!-- Background track -->
        <circle
          class="circular-progress-track"
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="${trackColor}"
          stroke-width="${strokeWidth}"
        />
        
        <!-- Progress circle -->
        <circle
          class="circular-progress-fill"
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          transform="rotate(-90 ${center} ${center})"
          style="transition: stroke-dashoffset 0.3s ease;"
        />
      </svg>
      
      ${showPercentage || label || icon ? `
        <div class="circular-progress-content">
          ${icon ? `<div class="circular-progress-icon">${icon}</div>` : ''}
          ${showPercentage ? `<div class="circular-progress-text">${Math.round(percentage)}%</div>` : ''}
          ${label ? `<div class="circular-progress-label">${label}</div>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

// =============================================================================
// Step Indicator
// =============================================================================

/**
 * Render step indicator (wizard/stepper)
 */
export function renderStepIndicator(props: StepIndicatorProps): string {
  const {
    steps,
    currentStep,
    orientation = 'horizontal',
    showNumbers = true,
    clickable = false,
    onStepClick,
    className = ''
  } = props;

  // Determine current step index
  let currentIndex = currentStep ?? steps.findIndex(s => s.status === 'current');
  if (currentIndex === -1) currentIndex = 0;

  return `
    <div class="step-indicator step-indicator-${orientation} ${className}" role="navigation" aria-label="Progress">
      ${steps.map((step, index) => renderStep(step, index, currentIndex, { showNumbers, clickable, onStepClick, orientation })).join('')}
    </div>
  `;
}

/**
 * Render individual step
 */
function renderStep(
  step: Step,
  index: number,
  currentIndex: number,
  options: { showNumbers: boolean; clickable: boolean; onStepClick?: string; orientation: 'horizontal' | 'vertical' }
): string {
  const { showNumbers, clickable, onStepClick, orientation } = options;
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current' || index === currentIndex;
  const isError = step.status === 'error';
  const isClickable = clickable && (isCompleted || isCurrent);

  const statusClass = isCompleted ? 'step-completed' : isCurrent ? 'step-current' : isError ? 'step-error' : 'step-pending';

  return `
    <div class="step ${statusClass} ${isClickable ? 'step-clickable' : ''}" 
         ${isClickable && onStepClick ? `onclick="${onStepClick}(${index})"` : ''}
         ${isClickable ? 'role="button" tabindex="0"' : ''}
         aria-current="${isCurrent ? 'step' : 'false'}">
      
      <div class="step-indicator-line"></div>
      
      <div class="step-marker">
        ${showNumbers && !step.icon ? `
          ${isCompleted ? `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          ` : isError ? `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
          ` : `<span class="step-number">${index + 1}</span>`}
        ` : step.icon ? step.icon : `<span class="step-number">${index + 1}</span>`}
      </div>
      
      <div class="step-content">
        <div class="step-label">
          ${step.label}
          ${step.optional ? '<span class="step-optional">(선택)</span>' : ''}
        </div>
        ${step.description ? `<div class="step-description">${step.description}</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Render compact step indicator (dots only)
 */
export function renderCompactStepIndicator(props: {
  totalSteps: number;
  currentStep: number;
  onStepClick?: string;
  className?: string;
}): string {
  const { totalSteps, currentStep, onStepClick, className = '' } = props;

  return `
    <div class="step-indicator-compact ${className}" role="navigation" aria-label="Progress">
      ${Array.from({ length: totalSteps }, (_, index) => `
        <button
          type="button"
          class="step-dot ${index === currentStep ? 'step-dot-current' : index < currentStep ? 'step-dot-completed' : 'step-dot-pending'}"
          ${onStepClick ? `onclick="${onStepClick}(${index})"` : ''}
          aria-label="Step ${index + 1}"
          aria-current="${index === currentStep ? 'step' : 'false'}">
        </button>
      `).join('')}
    </div>
  `;
}

// =============================================================================
// Multi-Item Progress (Upload Queue)
// =============================================================================

/**
 * Render multiple progress items
 */
export function renderMultiProgress(props: MultiProgressProps): string {
  const {
    items,
    showLabels = true,
    maxItems = 5,
    showOverall = true,
    className = ''
  } = props;

  const visibleItems = items.slice(0, maxItems);
  const hiddenCount = items.length - maxItems;
  
  // Calculate overall progress
  const overallProgress = items.length > 0
    ? items.reduce((sum, item) => sum + item.value, 0) / items.length
    : 0;

  return `
    <div class="multi-progress ${className}">
      ${showOverall ? `
        <div class="multi-progress-overall">
          <div class="progress-header">
            <span class="progress-label">전체 진행률</span>
            <span class="progress-percentage">${Math.round(overallProgress)}%</span>
          </div>
          ${renderProgressBar({ value: overallProgress, showPercentage: false })}
        </div>
      ` : ''}
      
      <div class="multi-progress-items">
        ${visibleItems.map(item => renderProgressItem(item, showLabels)).join('')}
      </div>
      
      ${hiddenCount > 0 ? `
        <div class="multi-progress-hidden">
          + ${hiddenCount}개 더 진행 중
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render single progress item
 */
function renderProgressItem(item: ProgressItem, showLabel: boolean): string {
  const statusIcons = {
    uploading: '<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/><path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>',
    processing: '<svg class="animate-pulse" width="16" height="16" fill="currentColor"><path d="M8 16a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>',
    completed: '<svg width="16" height="16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>',
    error: '<svg width="16" height="16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>'
  };

  const statusClass = item.status ? `progress-item-${item.status}` : '';

  return `
    <div class="progress-item ${statusClass}" data-item-id="${item.id}">
      ${showLabel ? `
        <div class="progress-item-header">
          <span class="progress-item-icon">${item.status ? statusIcons[item.status] : ''}</span>
          <span class="progress-item-label">${item.label}</span>
          ${item.size ? `<span class="progress-item-size">${formatFileSize(item.size)}</span>` : ''}
        </div>
      ` : ''}
      
      ${renderProgressBar({
        value: item.value,
        size: 'sm',
        showPercentage: showLabel,
        variant: item.status === 'error' ? 'danger' : item.status === 'completed' ? 'success' : 'primary'
      })}
    </div>
  `;
}

// =============================================================================
// Skeleton/Placeholder Progress
// =============================================================================

/**
 * Render loading skeleton progress
 */
export function renderSkeletonProgress(): string {
  return `
    <div class="progress-skeleton">
      <div class="skeleton skeleton-text" style="width: 40%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton skeleton-bar" style="width: 100%; height: 8px;"></div>
    </div>
  `;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate remaining time
 */
export function calculateRemainingTime(progress: number, elapsedMs: number): string {
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
