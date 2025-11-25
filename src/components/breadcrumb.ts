/**
 * Breadcrumb Component Library
 * 
 * Provides breadcrumb navigation for the GalleryPia platform
 * Addresses UX-C-004: Add Back Buttons and Breadcrumbs on Detail Pages
 * 
 * Features:
 * - Hierarchical navigation display
 * - Current page indicator
 * - Keyboard navigation support
 * - Screen reader friendly
 * - Responsive design
 * 
 * @module components/breadcrumb
 */

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  text: string
  href?: string
  icon?: string
  active?: boolean
}

/**
 * Breadcrumb Props
 */
export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
  className?: string
  ariaLabel?: string
}

/**
 * Renders breadcrumb navigation
 * 
 * @example
 * ```typescript
 * renderBreadcrumb({
 *   items: [
 *     { text: 'Home', href: '/', icon: 'fa-home' },
 *     { text: 'Gallery', href: '/gallery' },
 *     { text: 'Artwork Details', active: true }
 *   ]
 * })
 * ```
 */
export function renderBreadcrumb(props: BreadcrumbProps): string {
  const {
    items,
    separator = '/',
    className = '',
    ariaLabel = 'Breadcrumb navigation'
  } = props

  if (!items || items.length === 0) {
    return ''
  }

  return `
    <nav 
      class="flex items-center gap-2 text-sm ${className}" 
      aria-label="${ariaLabel}"
    >
      <ol class="flex items-center gap-2 flex-wrap">
        ${items.map((item, index) => {
          const isLast = index === items.length - 1
          const isActive = item.active || isLast

          return `
            <li class="flex items-center gap-2">
              ${item.href && !isActive ? `
                <a 
                  href="${item.href}"
                  class="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  ${isActive ? 'aria-current="page"' : ''}
                >
                  ${item.icon ? `<i class="fas ${item.icon}" aria-hidden="true"></i>` : ''}
                  <span>${item.text}</span>
                </a>
              ` : `
                <span class="flex items-center gap-1.5 ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'}">
                  ${item.icon ? `<i class="fas ${item.icon}" aria-hidden="true"></i>` : ''}
                  <span>${item.text}</span>
                </span>
              `}
              
              ${!isLast ? `
                <span class="text-gray-400" aria-hidden="true">${separator}</span>
              ` : ''}
            </li>
          `
        }).join('')}
      </ol>
    </nav>
  `
}

/**
 * Renders a simplified breadcrumb with back button
 * 
 * @example
 * ```typescript
 * renderBreadcrumbWithBack({
 *   backHref: '/gallery',
 *   backText: 'Back to Gallery',
 *   currentPage: 'Artwork Details'
 * })
 * ```
 */
export function renderBreadcrumbWithBack(props: {
  backHref: string
  backText: string
  currentPage: string
  className?: string
}): string {
  const { backHref, backText, currentPage, className = '' } = props

  return `
    <div class="flex items-center gap-4 ${className}">
      <a 
        href="${backHref}"
        class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
        <span>${backText}</span>
      </a>
      <span class="text-gray-400" aria-hidden="true">/</span>
      <span class="text-gray-900 font-semibold">${currentPage}</span>
    </div>
  `
}

/**
 * Generate breadcrumb items from path
 * 
 * @param path - Current URL path
 * @param pathMap - Mapping of paths to display names
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```typescript
 * const items = generateBreadcrumbsFromPath('/gallery/artwork/123', {
 *   '/': 'Home',
 *   '/gallery': 'Gallery',
 *   '/gallery/artwork': 'Artworks'
 * })
 * ```
 */
export function generateBreadcrumbsFromPath(
  path: string,
  pathMap: Record<string, string>
): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [
    { text: pathMap['/'] || 'Home', href: '/', icon: 'fa-home' }
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    items.push({
      text: pathMap[currentPath] || segment,
      href: isLast ? undefined : currentPath,
      active: isLast
    })
  })

  return items
}

/**
 * Export breadcrumb components
 */
export const BreadcrumbComponents = {
  renderBreadcrumb,
  renderBreadcrumbWithBack,
  generateBreadcrumbsFromPath
}

export default BreadcrumbComponents
