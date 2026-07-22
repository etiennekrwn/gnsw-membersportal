/**
 * User profile and settings data store.
 * Persists profile edits, settings, and notification preferences to localStorage.
 */

const PROFILE_KEY = 'gnsw_profile'
const SETTINGS_KEY = 'gnsw_settings'

// Default settings
const DEFAULT_SETTINGS = {
  notifications: {
    emailNotifications: true,
    weeklyDigest: false,
    newArticleAlerts: true,
    commentAlerts: true,
    memberAnnouncements: false,
  },
  privacy: {
    showInDirectory: true,
    showWritingActivity: true,
    showEmailToMembers: false,
  },
  preferences: {
    darkMode: false,
    fontSize: 'medium',
  },
}

function loadJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadProfile() {
  return loadJson(PROFILE_KEY, null)
}

export function saveProfile(profile) {
  saveJson(PROFILE_KEY, profile)
}

export function loadSettings() {
  const stored = loadJson(SETTINGS_KEY, null)
  // Merge with defaults to ensure all keys exist
  if (stored) {
    return {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...stored.notifications },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...stored.privacy },
      preferences: { ...DEFAULT_SETTINGS.preferences, ...stored.preferences },
    }
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings) {
  saveJson(SETTINGS_KEY, settings)
}

export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS }
}