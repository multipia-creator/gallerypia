/**
 * Tooltip Component Library for GalleryPia
 * 
 * Provides accessible, customizable tooltips for:
 * - Icon buttons and actions
 * - Abbreviated text and labels
 * - Help text and hints
 * - Feature explanations
 * - Keyboard shortcuts display
 * 
 * Addresses UX-M-001: Add tooltips for icons and actions
 * 
 * Features:
 * - ARIA-compliant (aria-describedby, role="tooltip")
 * - 12 positioning options (top, bottom, left, right + start/center/end)
 * - Auto-positioning (viewport boundary detection)
 * - Keyboard accessible (focus/blur events)
 * - Touch device support
 * - Customizable delay and duration
 * - Rich content support (HTML)
 * - Icon + text tooltips
 * 
 * Usage:
 * ```typescript
 * import { renderTooltip, renderIconWithTooltip } from './components/tooltip'
 * 
 * // Simple tooltip
 * const html = renderTooltip({
 *   content: '작품 삭제',
 *   targetId: 'delete-btn'
 * });
 * 
 * // Icon button with tooltip
 * const iconHtml = renderIconWithTooltip({
 *   icon: 'trash',
 *   tooltip: '작품 삭제',
 *   onClick: 'handleDelete',
 *   variant: 'danger'
 * });
 * 
 * // Rich tooltip with shortcut
 * const richHtml = renderTooltip({
 *   content: '새 작품 등록',
 *   shortcut: 'Ctrl+N',
 *   position: 'bottom'
 * });
 * ```
 */

export interface TooltipProps {
  /** Tooltip content (text or HTML) */
  content: string;
  
  /** Target element ID (for aria-describedby) */
  targetId?: string;
  
  /** Tooltip position relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right' | 
            'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' |
            'left-start' | 'left-end' | 'right-start' | 'right-end';
  
  /** Enable auto-positioning (adjust based on viewport) */
  autoPosition?: boolean;
  
  /** Keyboard shortcut to display */
  shortcut?: string;
  
  /** Show delay in milliseconds */
  showDelay?: number;
  
  /** Hide delay in milliseconds */
  hideDelay?: number;
  
  /** Tooltip theme */
  theme?: 'dark' | 'light' | 'info' | 'success' | 'warning' | 'danger';
  
  /** Maximum width */
  maxWidth?: string;
  
  /** Allow HTML content */
  allowHtml?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show arrow pointer */
  showArrow?: boolean;
  
  /** Disable on touch devices */
  disableOnTouch?: boolean;
}

export interface IconWithTooltipProps {
  /** Icon name (FontAwesome class or SVG path) */
  icon: string;
  
  /** Tooltip content */
  tooltip: string;
  
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  /** onClick handler function name */
  onClick?: string;
  
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** ARIA label (accessibility) */
  ariaLabel?: string;
  
  /** Tooltip position */
  tooltipPosition?: TooltipProps['position'];
  
  /** Keyboard shortcut */
  shortcut?: string;
  
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Tooltip Component
// =============================================================================

/**
 * Render tooltip element
 */
export function renderTooltip(props: TooltipProps): string {
  const {
    content,
    targetId,
    position = 'top',
    autoPosition = true,
    shortcut,
    showDelay = 200,
    hideDelay = 0,
    theme = 'dark',
    maxWidth = '200px',
    allowHtml = false,
    className = '',
    showArrow = true,
    disableOnTouch = false
  } = props;

  const tooltipId = targetId ? `tooltip-${targetId}` : `tooltip-${Date.now()}`;
  
  return `
    <div 
      id="${tooltipId}"
      class="tooltip tooltip-${theme} tooltip-${position} ${className}"
      role="tooltip"
      style="max-width: ${maxWidth}; display: none;"
      data-show-delay="${showDelay}"
      data-hide-delay="${hideDelay}"
      data-auto-position="${autoPosition}"
      data-disable-touch="${disableOnTouch}">
      
      ${showArrow ? '<div class="tooltip-arrow"></div>' : ''}
      
      <div class="tooltip-content">
        ${allowHtml ? content : escapeHtml(content)}
        ${shortcut ? `<span class="tooltip-shortcut">${shortcut}</span>` : ''}
      </div>
    </div>
  `;
}

/**
 * Render tooltip trigger wrapper
 */
export function renderTooltipTrigger(props: {
  content: string;
  children: string;
  position?: TooltipProps['position'];
  shortcut?: string;
  theme?: TooltipProps['theme'];
  className?: string;
}): string {
  const {
    content,
    children,
    position = 'top',
    shortcut,
    theme = 'dark',
    className = ''
  } = props;

  const triggerId = `tooltip-trigger-${Date.now()}`;
  const tooltipId = `tooltip-${triggerId}`;

  return `
    <span 
      id="${triggerId}"
      class="tooltip-trigger ${className}"
      aria-describedby="${tooltipId}"
      data-tooltip-content="${escapeHtml(content)}"
      data-tooltip-position="${position}"
      ${shortcut ? `data-tooltip-shortcut="${shortcut}"` : ''}
      data-tooltip-theme="${theme}">
      ${children}
      ${renderTooltip({
        content,
        targetId: triggerId,
        position,
        shortcut,
        theme
      })}
    </span>
  `;
}

// =============================================================================
// Icon Button with Tooltip
// =============================================================================

/**
 * Render icon button with tooltip
 */
export function renderIconWithTooltip(props: IconWithTooltipProps): string {
  const {
    icon,
    tooltip,
    variant = 'ghost',
    size = 'md',
    onClick,
    type = 'button',
    disabled = false,
    ariaLabel,
    tooltipPosition = 'top',
    shortcut,
    className = ''
  } = props;

  const btnId = `icon-btn-${Date.now()}`;
  const tooltipId = `tooltip-${btnId}`;

  const sizeClasses = {
    xs: 'btn-icon-xs',
    sm: 'btn-icon-sm',
    md: 'btn-icon-md',
    lg: 'btn-icon-lg'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    ghost: 'btn-ghost'
  };

  return `
    <button
      id="${btnId}"
      type="${type}"
      class="btn-icon ${variantClasses[variant]} ${sizeClasses[size]} ${className}"
      ${onClick ? `onclick="${onClick}(event)"` : ''}
      ${disabled ? 'disabled' : ''}
      aria-label="${ariaLabel || tooltip}"
      aria-describedby="${tooltipId}">
      ${renderIcon(icon)}
      ${renderTooltip({
        content: tooltip,
        targetId: btnId,
        position: tooltipPosition,
        shortcut
      })}
    </button>
  `;
}

/**
 * Render icon button group with tooltips
 */
export function renderIconButtonGroup(props: {
  buttons: IconWithTooltipProps[];
  spacing?: 'tight' | 'normal' | 'loose';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}): string {
  const {
    buttons,
    spacing = 'normal',
    orientation = 'horizontal',
    className = ''
  } = props;

  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-4'
  };

  const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row';

  return `
    <div class="btn-icon-group ${orientationClass} ${spacingClasses[spacing]} ${className}">
      ${buttons.map(btn => renderIconWithTooltip(btn)).join('')}
    </div>
  `;
}

// =============================================================================
// Help Text with Tooltip
// =============================================================================

/**
 * Render help icon with tooltip
 */
export function renderHelpTooltip(props: {
  content: string;
  position?: TooltipProps['position'];
  maxWidth?: string;
  className?: string;
}): string {
  const {
    content,
    position = 'top',
    maxWidth = '300px',
    className = ''
  } = props;

  return renderIconWithTooltip({
    icon: 'circle-question',
    tooltip: content,
    variant: 'ghost',
    size: 'sm',
    tooltipPosition: position,
    className: `help-tooltip ${className}`,
    ariaLabel: '도움말'
  });
}

/**
 * Render label with help tooltip
 */
export function renderLabelWithHelp(props: {
  label: string;
  helpText: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}): string {
  const {
    label,
    helpText,
    htmlFor,
    required = false,
    className = ''
  } = props;

  return `
    <label ${htmlFor ? `for="${htmlFor}"` : ''} class="form-label ${className}">
      ${label}
      ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
      ${renderHelpTooltip({ content: helpText })}
    </label>
  `;
}

// =============================================================================
// Keyboard Shortcut Tooltip
// =============================================================================

/**
 * Render action with keyboard shortcut tooltip
 */
export function renderActionWithShortcut(props: {
  label: string;
  shortcut: string;
  onClick?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}): string {
  const {
    label,
    shortcut,
    onClick,
    icon,
    variant = 'ghost',
    className = ''
  } = props;

  const btnId = `action-btn-${Date.now()}`;

  return `
    <button
      id="${btnId}"
      type="button"
      class="btn btn-${variant} ${className}"
      ${onClick ? `onclick="${onClick}(event)"` : ''}
      aria-label="${label} (${shortcut})">
      ${icon ? renderIcon(icon) : ''}
      <span>${label}</span>
      <span class="keyboard-shortcut">${formatShortcut(shortcut)}</span>
      ${renderTooltip({
        content: label,
        targetId: btnId,
        shortcut,
        position: 'bottom'
      })}
    </button>
  `;
}

/**
 * Format keyboard shortcut for display
 */
function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/Ctrl/g, '⌃')
    .replace(/Cmd/g, '⌘')
    .replace(/Alt/g, '⌥')
    .replace(/Shift/g, '⇧')
    .replace(/Enter/g, '↵')
    .replace(/\+/g, '');
}

// =============================================================================
// Info Tooltip (Hover for More Info)
// =============================================================================

/**
 * Render info badge with detailed tooltip
 */
export function renderInfoTooltip(props: {
  title: string;
  description: string;
  position?: TooltipProps['position'];
  icon?: string;
  className?: string;
}): string {
  const {
    title,
    description,
    position = 'right',
    icon = 'circle-info',
    className = ''
  } = props;

  const tooltipContent = `<strong>${title}</strong><br/>${description}`;

  return renderIconWithTooltip({
    icon,
    tooltip: tooltipContent,
    variant: 'ghost',
    size: 'sm',
    tooltipPosition: position,
    className: `info-tooltip ${className}`,
    ariaLabel: title
  });
}

/**
 * Render truncated text with full text tooltip
 */
export function renderTruncatedText(props: {
  text: string;
  maxLength: number;
  position?: TooltipProps['position'];
  className?: string;
}): string {
  const {
    text,
    maxLength,
    position = 'top',
    className = ''
  } = props;

  if (text.length <= maxLength) {
    return `<span class="${className}">${escapeHtml(text)}</span>`;
  }

  const truncated = text.slice(0, maxLength) + '...';
  const spanId = `truncated-${Date.now()}`;

  return `
    <span 
      id="${spanId}"
      class="truncated-text ${className}"
      aria-describedby="tooltip-${spanId}">
      ${escapeHtml(truncated)}
      ${renderTooltip({
        content: text,
        targetId: spanId,
        position,
        maxWidth: '400px'
      })}
    </span>
  `;
}

// =============================================================================
// Status Indicator with Tooltip
// =============================================================================

/**
 * Render status badge with explanation tooltip
 */
export function renderStatusWithTooltip(props: {
  status: 'online' | 'offline' | 'busy' | 'away' | 'pending' | 'active' | 'inactive';
  label?: string;
  tooltip?: string;
  showDot?: boolean;
  className?: string;
}): string {
  const {
    status,
    label,
    tooltip,
    showDot = true,
    className = ''
  } = props;

  const statusConfig = {
    online: { color: 'green', defaultLabel: '온라인', defaultTooltip: '현재 접속 중입니다' },
    offline: { color: 'gray', defaultLabel: '오프라인', defaultTooltip: '현재 접속하지 않았습니다' },
    busy: { color: 'red', defaultLabel: '바쁨', defaultTooltip: '현재 다른 작업 중입니다' },
    away: { color: 'yellow', defaultLabel: '자리비움', defaultTooltip: '잠시 자리를 비웠습니다' },
    pending: { color: 'orange', defaultLabel: '대기중', defaultTooltip: '처리 대기 중입니다' },
    active: { color: 'green', defaultLabel: '활성', defaultTooltip: '정상 작동 중입니다' },
    inactive: { color: 'gray', defaultLabel: '비활성', defaultTooltip: '현재 비활성 상태입니다' }
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;
  const tooltipText = tooltip || config.defaultTooltip;

  const badgeId = `status-badge-${Date.now()}`;

  return `
    <span 
      id="${badgeId}"
      class="status-badge status-${status} ${className}"
      aria-describedby="tooltip-${badgeId}">
      ${showDot ? `<span class="status-dot bg-${config.color}-500"></span>` : ''}
      <span class="status-label">${displayLabel}</span>
      ${renderTooltip({
        content: tooltipText,
        targetId: badgeId,
        position: 'top'
      })}
    </span>
  `;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Render icon (FontAwesome or custom SVG)
 */
function renderIcon(icon: string): string {
  // Check if it's a FontAwesome icon class
  if (icon.includes('fa-') || icon.includes('fas') || icon.includes('far')) {
    return `<i class="${icon}"></i>`;
  }

  // Common icon mappings
  const iconMap: Record<string, string> = {
    'trash': '<svg width="16" height="16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>',
    'edit': '<svg width="16" height="16" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>',
    'circle-info': '<svg width="16" height="16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>',
    'circle-question': '<svg width="16" height="16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg>',
    'plus': '<svg width="16" height="16" fill="currentColor"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>',
    'search': '<svg width="16" height="16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>',
    'heart': '<svg width="16" height="16" fill="currentColor"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/></svg>',
    'share': '<svg width="16" height="16" fill="currentColor"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>'
  };

  return iconMap[icon] || `<i class="fa fa-${icon}"></i>`;
}

/**
 * Escape HTML for safe rendering
 */
function escapeHtml(text: string): string {
  const div = { textContent: text } as any;
  return div.textContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
