<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import apiClient, {
  getMyPreferences,
  updateMyPreferences,
  changeMyPassword,
  requestAccountDeletion,
} from '../api/client.js'
import { setTheme, getTheme, applyTheme } from '../utils/theme.js'

// Settings state (loaded from the real API â€” no privacy section)
const settings = ref({
  notifications: {
    emailNotifications: true,
    weeklyDigest: false,
    newArticleAlerts: true,
    commentAlerts: true,
    memberAnnouncements: false,
  },
  preferences: {
    darkMode: getTheme() === 'dark',
    fontSize: 'medium',
  },
})

const saved = ref(false)
const settingsError = ref('')
const deleteConfirmOpen = ref(false)
const activeSection = ref('notifications')

// Password change
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref(false)
const passwordSubmitting = ref(false)

// Delete account
const deletePassword = ref('')
const deleteError = ref('')
const deleteSuccess = ref(false)
const deleteSubmitting = ref(false)

const sections = [
  { id: 'notifications', label: 'Notifications', icon: 'lucide:bell' },
  { id: 'preferences', label: 'Preferences', icon: 'lucide:sliders-horizontal' },
  { id: 'account', label: 'Account', icon: 'lucide:user-cog' },
]

async function loadSettingsData() {
  try {
    const res = await getMyPreferences()
    const p = res.data.data || {}
    settings.value = {
      notifications: {
        emailNotifications: p.emailNotifications ?? true,
        weeklyDigest: p.weeklyDigest ?? false,
        newArticleAlerts: p.newArticleAlerts ?? true,
        commentAlerts: p.commentAlerts ?? true,
        memberAnnouncements: p.memberAnnouncements ?? false,
      },
      preferences: {
        darkMode: p.darkMode ?? (getTheme() === 'dark'),
        fontSize: p.fontSize || 'medium',
      },
    }
    // Ensure rendered theme matches the member's stored choice.
    setTheme(settings.value.preferences.darkMode ? 'dark' : 'light')
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
}

async function saveSettingsData() {
  try {
    await updateMyPreferences({
      emailNotifications: settings.value.notifications.emailNotifications,
      weeklyDigest: settings.value.notifications.weeklyDigest,
      newArticleAlerts: settings.value.notifications.newArticleAlerts,
      commentAlerts: settings.value.notifications.commentAlerts,
      memberAnnouncements: settings.value.notifications.memberAnnouncements,
      darkMode: settings.value.preferences.darkMode,
      fontSize: settings.value.preferences.fontSize,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch (err) {
    settingsError.value = err.message || 'Could not save settings.'
    setTimeout(() => { settingsError.value = '' }, 4000)
  }
}

function toggleSetting(category, key) {
  settings.value[category][key] = !settings.value[category][key]
  if (category === 'preferences' && key === 'darkMode') {
    setTheme(settings.value.preferences.darkMode ? 'dark' : 'light')
  }
  saveSettingsData()
}

function setFontSize(size) {
  settings.value.preferences.fontSize = size
  saveSettingsData()
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'All fields are required.'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  passwordSubmitting.value = true
  try {
    await changeMyPassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      newPasswordConfirmation: confirmPassword.value,
    })
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => { passwordSuccess.value = false }, 3000)
  } catch (err) {
    passwordError.value = err.message || 'Could not change password.'
  } finally {
    passwordSubmitting.value = false
  }
}

function requestDeleteAccount() {
  deleteConfirmOpen.value = true
}

async function handleDeleteAccount() {
  deleteError.value = ''
  deleteSuccess.value = false
  if (!deletePassword.value) {
    deleteError.value = 'Enter your password to confirm.'
    return
  }
  deleteConfirmOpen.value = false
  deleteSubmitting.value = true
  try {
    await requestAccountDeletion({ password: deletePassword.value })
    deleteSuccess.value = true
    deletePassword.value = ''
  } catch (err) {
    deleteError.value = err.message || 'Could not submit deletion request.'
  } finally {
    deleteSubmitting.value = false
  }
}

onMounted(() => {
  loadSettingsData()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-[#111418] mb-2">Settings</h1>
        <p class="text-gray-500 text-sm">Manage notifications, preferences, and your account.</p>
      </div>
      <p v-if="saved" class="text-xs font-semibold text-[#8b1e21] shrink-0">Settings saved</p>
      <p v-if="settingsError" class="text-xs font-semibold text-red-600 shrink-0">{{ settingsError }}</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">

      <!-- Section tabs (sidebar) -->
      <div class="lg:w-56 shrink-0">
        <nav class="flex lg:flex-col gap-1 overflow-x-auto">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-md transition-colors"
            :class="activeSection === section.id
              ? 'bg-[#8b1e21]/10 text-[#8b1e21]'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'"
            @click="activeSection = section.id"
          >
            <Icon :icon="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </button>
        </nav>
      </div>

      <!-- Settings content -->
      <div class="flex-1 min-w-0 space-y-6">

        <!-- === NOTIFICATIONS === -->
        <div v-if="activeSection === 'notifications'" class="space-y-4">
          <div class="border border-[#eae8e4] rounded-xl p-6 bg-white">
            <h2 class="text-sm font-bold text-[#111418] mb-1">Email Notifications</h2>
            <p class="text-xs text-gray-400 mb-5">Control which emails you receive from GNSW.</p>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[#111418]">Email notifications</p>
                  <p class="text-xs text-gray-400">Receive email updates about your activity</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.notifications.emailNotifications"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  :class="settings.notifications.emailNotifications ? 'bg-[#8b1e21]' : 'bg-gray-300'"
                  @click="toggleSetting('notifications', 'emailNotifications')"
                >
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.notifications.emailNotifications }" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[#111418]">Weekly digest</p>
                  <p class="text-xs text-gray-400">A roundup of top articles and updates</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.notifications.weeklyDigest"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  :class="settings.notifications.weeklyDigest ? 'bg-[#8b1e21]' : 'bg-gray-300'"
                  @click="toggleSetting('notifications', 'weeklyDigest')"
                >
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.notifications.weeklyDigest }" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[#111418]">New article alerts</p>
                  <p class="text-xs text-gray-400">When members publish new articles</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.notifications.newArticleAlerts"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  :class="settings.notifications.newArticleAlerts ? 'bg-[#8b1e21]' : 'bg-gray-300'"
                  @click="toggleSetting('notifications', 'newArticleAlerts')"
                >
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.notifications.newArticleAlerts }" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[#111418]">Comments on your posts</p>
                  <p class="text-xs text-gray-400">When someone replies to your writing</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.notifications.commentAlerts"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  :class="settings.notifications.commentAlerts ? 'bg-[#8b1e21]' : 'bg-gray-300'"
                  @click="toggleSetting('notifications', 'commentAlerts')"
                >
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.notifications.commentAlerts }" />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[#111418]">Member announcements</p>
                  <p class="text-xs text-gray-400">Guild news, events, and program updates</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.notifications.memberAnnouncements"
                  class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  :class="settings.notifications.memberAnnouncements ? 'bg-[#8b1e21]' : 'bg-gray-300'"
                  @click="toggleSetting('notifications', 'memberAnnouncements')"
                >
                  <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.notifications.memberAnnouncements }" />
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- === PREFERENCES === -->
        <div v-if="activeSection === 'preferences'" class="space-y-4">
          <div class="border border-[#eae8e4] rounded-xl p-6 bg-white">
            <h2 class="text-sm font-bold text-[#111418] mb-1">Display Preferences</h2>
            <p class="text-xs text-gray-400 mb-5">Customize how the portal looks and reads.</p>

            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium text-[#111418] mb-3">Font Size</p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="px-4 py-2 text-xs font-semibold border rounded-md transition"
                    :class="settings.preferences.fontSize === 'small'
                      ? 'border-[#8b1e21] bg-[#8b1e21]/10 text-[#8b1e21]'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'"
                    @click="setFontSize('small')"
                  >Small</button>
                  <button
                    type="button"
                    class="px-4 py-2 text-xs font-semibold border rounded-md transition"
                    :class="settings.preferences.fontSize === 'medium'
                      ? 'border-[#8b1e21] bg-[#8b1e21]/10 text-[#8b1e21]'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'"
                    @click="setFontSize('medium')"
                  >Medium</button>
                  <button
                    type="button"
                    class="px-4 py-2 text-xs font-semibold border rounded-md transition"
                    :class="settings.preferences.fontSize === 'large'
                      ? 'border-[#8b1e21] bg-[#8b1e21]/10 text-[#8b1e21]'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'"
                    @click="setFontSize('large')"
                  >Large</button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between border border-[#eae8e4] rounded-xl p-6 bg-white">
            <div>
              <h2 class="text-sm font-bold text-[#111418] mb-1">Dark Mode</h2>
              <p class="text-xs text-gray-400">Use a dark color scheme across the portal.</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.preferences.darkMode"
              class="relative w-10 h-5 rounded-full transition-colors shrink-0"
              :class="settings.preferences.darkMode ? 'bg-[#8b1e21]' : 'bg-gray-300'"
              @click="toggleSetting('preferences', 'darkMode')"
            >
              <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform" :class="{ 'translate-x-5': settings.preferences.darkMode }" />
            </button>
          </div>
        </div>

        <!-- === ACCOUNT === -->
        <div v-if="activeSection === 'account'" class="space-y-4">
          <!-- Change password -->
          <div class="border border-[#eae8e4] rounded-xl p-6 bg-white">
            <h2 class="text-sm font-bold text-[#111418] mb-1">Change Password</h2>
            <p class="text-xs text-gray-400 mb-5">Update your account password.</p>

            <div class="space-y-3 max-w-sm">
              <div>
                <label class="text-xs font-medium text-gray-600 mb-1 block">Current password</label>
                <input
                  v-model="currentPassword"
                  type="password"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#8b1e21] transition"
                />
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 mb-1 block">New password</label>
                <input
                  v-model="newPassword"
                  type="password"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#8b1e21] transition"
                />
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 mb-1 block">Confirm new password</label>
                <input
                  v-model="confirmPassword"
                  type="password"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#8b1e21] transition"
                />
              </div>

              <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>
              <p v-if="passwordSuccess" class="text-xs text-green-600">Password updated successfully.</p>

              <button
                type="button"
                class="bg-[#111418] text-white text-xs font-semibold px-4 py-2 hover:bg-gray-800 transition"
                @click="handleChangePassword"
              >
                Update Password
              </button>
            </div>
          </div>

          <!-- Membership info -->
          <div class="border border-[#eae8e4] rounded-xl p-6 bg-white">
            <h2 class="text-sm font-bold text-[#111418] mb-1">Membership</h2>
            <p class="text-xs text-gray-400">Your current Guild membership tier, billing, and benefits.</p>
            <RouterLink to="/membership" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8b1e21] hover:underline">
              Manage membership <Icon icon="lucide:arrow-right" class="w-3.5 h-3.5" />
            </RouterLink>
          </div>

          <!-- Danger zone -->
          <div class="border border-red-200 rounded-xl p-6 bg-white">
            <h2 class="text-sm font-bold text-red-600 mb-1">Danger Zone</h2>
            <p class="text-xs text-gray-400 mb-4">Irreversible actions for your account.</p>
            <div class="space-y-3 max-w-sm">
              <div>
                <label class="text-xs font-medium text-gray-600 mb-1 block">Confirm your password</label>
                <input
                  v-model="deletePassword"
                  type="password"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-red-500 transition"
                />
              </div>
              <p v-if="deleteError" class="text-xs text-red-500">{{ deleteError }}</p>
              <p v-if="deleteSuccess" class="text-xs text-green-600">Deletion request received. Our team will review it shortly.</p>
              <button
                type="button"
                :disabled="deleteSubmitting"
                class="text-xs font-semibold text-white bg-red-600 px-4 py-2 hover:bg-red-700 transition disabled:opacity-50"
                @click="requestDeleteAccount"
              >
                {{ deleteSubmitting ? 'Submitting…' : 'Delete Account' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ConfirmDialog
      :open="deleteConfirmOpen"
      title="Delete your account?"
      message="This will submit a deletion request for your account. This action cannot be undone."
      confirm-text="Delete Account"
      @confirm="handleDeleteAccount"
      @cancel="deleteConfirmOpen = false"
    />
  </div>
</template>
