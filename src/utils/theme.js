/**
 * Light/dark theme helper for the member portal.
 * Applies a `dark` class to <html> and persists the choice keyed by the
 * current member so each account keeps its own theme.
 */
const THEME_KEY = 'portal_theme'

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light'
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

export function initTheme() {
  applyTheme(getTheme())
}