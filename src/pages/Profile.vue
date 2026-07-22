<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { getDrafts, getPublished } from '../data/writing.js'
import { loadProfile, saveProfile } from '../data/userProfile.js'

const currentUser = inject('currentUser')

// Profile edit state
const isEditing = ref(false)
const saved = ref(false)

// Profile form fields
const displayName = ref('')
const bio = ref('')
const currentRole = ref('')
const employer = ref('')
const yearsExperience = ref('')
const specializations = ref([])
const website = ref('')
const twitter = ref('')
const linkedin = ref('')
const email = ref('')
const avatarPreview = ref(null)

// Stats
const draftsCount = ref(0)
const publishedCount = ref(0)
const totalViews = ref(0)
const totalClaps = ref(0)
const recentActivity = ref([])

// Specialization options
const specializationOptions = [
  'Political Speeches',
  'Corporate',
  'Nonprofit',
  'Ceremonial',
  'Media & Press',
  'Crisis Communication',
  'Marketing & Branding',
  'Academic',
  'Religious',
]

function loadProfileData() {
  if (!currentUser) return
  const savedProfile = loadProfile()
  const profile = savedProfile || currentUser

  displayName.value = profile.displayName || currentUser.name || ''
  bio.value = profile.bio || ''
  currentRole.value = profile.currentRole || ''
  employer.value = profile.employer || ''
  yearsExperience.value = profile.yearsExperience || ''
  specializations.value = profile.specializations || []
  website.value = profile.website || ''
  twitter.value = profile.twitter || ''
  linkedin.value = profile.linkedin || ''
  email.value = profile.email || currentUser.email || ''
  avatarPreview.value = profile.avatar || null

  const drafts = getDrafts()
  const published = getPublished()
  draftsCount.value = drafts.length
  publishedCount.value = published.length
  totalViews.value = published.reduce((sum, p) => sum + (p.views || 0), 0)
  totalClaps.value = published.reduce((sum, p) => sum + (p.claps || 0), 0)
  recentActivity.value = published.slice(0, 4)
}

function startEditing() {
  isEditing.value = true
  saved.value = false
}

function cancelEditing() {
  isEditing.value = false
  saved.value = false
  loadProfileData()
}

function saveProfileData() {
  const profileData = {
    displayName: displayName.value,
    bio: bio.value,
    currentRole: currentRole.value,
    employer: employer.value,
    yearsExperience: yearsExperience.value,
    specializations: specializations.value,
    website: website.value,
    twitter: twitter.value,
    linkedin: linkedin.value,
    email: email.value,
    avatar: avatarPreview.value,
  }
  saveProfile(profileData)
  isEditing.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}

function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  avatarPreview.value = null
}

function toggleSpecialization(spec) {
  const idx = specializations.value.indexOf(spec)
  if (idx > -1) {
    specializations.value.splice(idx, 1)
  } else {
    specializations.value.push(spec)
  }
}

const avatarSrc = computed(() => avatarPreview.value || null)

const initials = computed(() => {
  if (!displayName.value) return '?'
  return displayName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const memberSince = computed(() => {
  return currentUser?.joinDate || new Date().toLocaleDateString()
})

const hasAnyProfessional = computed(() => {
  return currentRole.value || employer.value || yearsExperience.value || specializations.value.length
})

const hasAnyContact = computed(() => {
  return email.value || website.value || twitter.value || linkedin.value
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  loadProfileData()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#111418] tracking-tight">Profile</h1>
        <p class="text-gray-500 text-sm mt-1">Your public face in the Guild.</p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          leave-active-class="transition-all duration-200 ease-in"
          leave-to-class="opacity-0 translate-y-1"
        >
          <p v-if="saved" class="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <Icon icon="lucide:check-circle" class="w-3.5 h-3.5" />
            Profile saved
          </p>
        </Transition>
        <button
          v-if="!isEditing"
          type="button"
          class="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#111418] hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          @click="startEditing"
        >
          <Icon icon="lucide:pencil" class="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>

    <!-- ==================== HERO CARD ==================== -->
    <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden mb-6">
      <!-- Cover image -->
      <div class="relative h-40 sm:h-48 bg-gradient-to-r from-[#111418] via-gray-800 to-[#8b1e21]/60">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      </div>

      <!-- Avatar + Name area (overlapping cover) -->
      <div class="relative px-6 sm:px-8 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-20 mb-6">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#111418] to-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-xl">
              <img v-if="avatarSrc" :src="avatarSrc" :alt="displayName" class="w-full h-full object-cover" />
              <span v-else class="text-white text-4xl sm:text-5xl font-bold tracking-tight">{{ initials }}</span>
            </div>
            <!-- Inline edit badge -->
            <label v-if="isEditing" class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border-2 border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Icon icon="lucide:camera" class="w-4 h-4 text-gray-500" />
              <input type="file" accept="image/*" class="sr-only" @change="handleAvatarUpload" />
            </label>
            <button
              v-if="isEditing && avatarPreview"
              type="button"
              class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center hover:bg-red-600 transition-colors"
              @click="removeAvatar"
            >
              <Icon icon="lucide:x" class="w-3 h-3 text-white" />
            </button>
          </div>

          <div class="flex-1 min-w-0 pt-0 sm:pt-4">
            <!-- Display Name (editable inline) -->
            <div v-if="isEditing">
              <input
                v-model="displayName"
                type="text"
                placeholder="Your display name"
                class="w-full text-2xl sm:text-3xl font-extrabold text-[#111418] bg-transparent border-b-2 border-[#8b1e21]/30 focus:border-[#8b1e21] outline-none pb-1 transition-colors placeholder:text-gray-300"
              />
            </div>
            <h1 v-else class="text-2xl sm:text-3xl font-extrabold text-[#111418] tracking-tight truncate">{{ displayName || currentUser?.name || 'Member' }}</h1>
            <div class="flex flex-wrap items-center gap-2 mt-2">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b1e21] bg-[#8b1e21]/5 border border-[#8b1e21]/15 px-2.5 py-1 rounded-full">
                <Icon icon="lucide:award" class="w-3 h-3" />
                {{ currentUser?.tierLabel ?? 'Member' }} {{ currentUser?.tierShort ?? '' }}
              </span>
              <span class="text-xs text-gray-300">•</span>
              <span class="text-xs text-gray-500 flex items-center gap-1">
                <Icon icon="lucide:calendar" class="w-3 h-3" />
                Member since {{ memberSince }}
              </span>
              <span v-if="currentUser?.articleMonthlyLimit" class="text-xs text-gray-400 flex items-center gap-1">
                <span class="text-gray-300">•</span>
                <Icon icon="lucide:file-text" class="w-3 h-3" />
                {{ currentUser.articleMonthlyLimit }} articles/mo
              </span>
            </div>
          </div>
        </div>

        <!-- Role / Employer -->
        <div class="mb-6">
          <div v-if="isEditing" class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current Role</label>
              <input
                v-model="currentRole"
                type="text"
                placeholder="e.g. Political Speechwriter"
                class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300"
              />
            </div>
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Employer</label>
              <input
                v-model="employer"
                type="text"
                placeholder="Organization"
                class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300"
              />
            </div>
          </div>
          <p v-else-if="currentRole || employer" class="text-base text-gray-700 font-medium">
            <span v-if="currentRole" class="text-[#111418]">{{ currentRole }}</span>
            <span v-if="currentRole && employer" class="text-gray-400 mx-1.5">·</span>
            <span v-if="employer" class="text-gray-600">{{ employer }}</span>
          </p>
        </div>

        <!-- Bio -->
        <div class="mb-6">
          <div v-if="isEditing">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
            <textarea
              v-model="bio"
              rows="4"
              placeholder="Tell the Guild about yourself — your background, expertise, and what drives you as a writer..."
              class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300"
            />
            <div class="flex justify-between items-center mt-1.5">
              <p class="text-xs text-gray-400">A strong bio helps other members find and connect with you.</p>
              <p class="text-xs font-medium" :class="bio.length > 450 ? 'text-amber-500' : 'text-gray-400'">{{ bio.length }}/500</p>
            </div>
          </div>
          <p v-else-if="bio" class="text-sm text-gray-600 leading-relaxed max-w-3xl">{{ bio }}</p>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-4 gap-3 sm:gap-4 py-5 border-t border-gray-100">
          <div class="text-center">
            <p class="text-xl sm:text-2xl font-extrabold text-[#111418] tracking-tight">{{ publishedCount }}</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Published</p>
          </div>
          <div class="text-center">
            <p class="text-xl sm:text-2xl font-extrabold text-[#111418] tracking-tight">{{ draftsCount }}</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Drafts</p>
          </div>
          <div class="text-center">
            <p class="text-xl sm:text-2xl font-extrabold text-[#111418] tracking-tight">{{ totalViews.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Views</p>
          </div>
          <div class="text-center">
            <p class="text-xl sm:text-2xl font-extrabold text-[#111418] tracking-tight">{{ totalClaps.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Claps</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TWO-COLUMN LAYOUT ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ===== LEFT COLUMN ===== -->
      <div class="lg:col-span-1 space-y-6">

        <!-- Professional Details Card -->
        <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Icon icon="lucide:briefcase" class="w-3.5 h-3.5" />
              Professional
            </h2>
            <span v-if="!hasAnyProfessional && !isEditing" class="text-xs text-gray-400 italic">Not filled in</span>
          </div>

          <!-- Editing: Specializations + Experience -->
          <div v-if="isEditing" class="space-y-5">
            <div>
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Years Experience</label>
              <input
                v-model.number="yearsExperience"
                type="number"
                placeholder="e.g. 5"
                min="0"
                class="w-full sm:w-32 text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Specializations</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="spec in specializationOptions"
                  :key="spec"
                  type="button"
                  :class="[
                    'text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200',
                    specializations.includes(spec)
                      ? 'bg-[#8b1e21]/10 text-[#8b1e21] border-[#8b1e21]/25 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  ]"
                  @click="toggleSpecialization(spec)"
                >
                  {{ spec }}
                </button>
              </div>
            </div>
          </div>

          <!-- Display: Professional details -->
          <div v-else class="space-y-4">
            <div v-if="yearsExperience" class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:clock" class="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Experience</p>
                <p class="text-sm font-bold text-[#111418]">{{ yearsExperience }} years</p>
              </div>
            </div>
            <div v-if="specializations.length">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specializations</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="spec in specializations"
                  :key="spec"
                  class="text-xs font-medium bg-[#8b1e21]/5 text-[#8b1e21] px-2.5 py-1 rounded-lg border border-[#8b1e21]/10"
                >
                  {{ spec }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Card -->
        <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Icon icon="lucide:link" class="w-3.5 h-3.5" />
              Connect
            </h2>
            <span v-if="!hasAnyContact && !isEditing" class="text-xs text-gray-400 italic">Not added</span>
          </div>

          <div v-if="isEditing" class="space-y-4">
            <label class="block">
              <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1">
                <Icon icon="lucide:mail" class="w-3 h-3" /> Email
              </span>
              <input v-model="email" type="email" placeholder="your@email.com" class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1">
                <Icon icon="lucide:globe" class="w-3 h-3" /> Website
              </span>
              <input v-model="website" type="url" placeholder="https://yoursite.com" class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1">
                <Icon icon="lucide:at-sign" class="w-3 h-3" /> Twitter
              </span>
              <input v-model="twitter" type="text" placeholder="@username" class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1">
                <Icon icon="lucide:linkedin" class="w-3 h-3" /> LinkedIn
              </span>
              <input v-model="linkedin" type="url" placeholder="https://linkedin.com/in/..." class="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#8b1e21] focus:ring-2 focus:ring-[#8b1e21]/10 bg-white transition-all duration-200 placeholder:text-gray-300" />
            </label>
          </div>

          <div v-else class="space-y-3">
            <a v-if="email" :href="`mailto:${email}`" class="flex items-center gap-3 group">
              <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#8b1e21]/5 group-hover:border-[#8b1e21]/10 transition-all duration-200">
                <Icon icon="lucide:mail" class="w-4 h-4 text-gray-400 group-hover:text-[#8b1e21] transition-colors" />
              </div>
              <span class="text-sm text-gray-600 group-hover:text-[#8b1e21] transition-colors truncate">{{ email }}</span>
            </a>
            <a v-if="website" :href="website" target="_blank" class="flex items-center gap-3 group">
              <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#8b1e21]/5 group-hover:border-[#8b1e21]/10 transition-all duration-200">
                <Icon icon="lucide:globe" class="w-4 h-4 text-gray-400 group-hover:text-[#8b1e21] transition-colors" />
              </div>
              <span class="text-sm text-gray-600 group-hover:text-[#8b1e21] transition-colors truncate">{{ website }}</span>
            </a>
            <a v-if="twitter" :href="`https://twitter.com/${twitter.replace('@', '')}`" target="_blank" class="flex items-center gap-3 group">
              <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#8b1e21]/5 group-hover:border-[#8b1e21]/10 transition-all duration-200">
                <Icon icon="lucide:at-sign" class="w-4 h-4 text-gray-400 group-hover:text-[#8b1e21] transition-colors" />
              </div>
              <span class="text-sm text-gray-600 group-hover:text-[#8b1e21] transition-colors truncate">{{ twitter }}</span>
            </a>
            <a v-if="linkedin" :href="linkedin" target="_blank" class="flex items-center gap-3 group">
              <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#8b1e21]/5 group-hover:border-[#8b1e21]/10 transition-all duration-200">
                <Icon icon="lucide:linkedin" class="w-4 h-4 text-gray-400 group-hover:text-[#8b1e21] transition-colors" />
              </div>
              <span class="text-sm text-gray-600 group-hover:text-[#8b1e21] transition-colors truncate">LinkedIn</span>
            </a>
          </div>
        </div>

        <!-- Membership Card -->
        <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Icon icon="lucide:shield" class="w-3.5 h-3.5" />
            Membership
          </h2>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b1e21]/20 to-[#8b1e21]/5 flex items-center justify-center shrink-0">
              <Icon icon="lucide:award" class="w-5 h-5 text-[#8b1e21]" />
            </div>
            <div>
              <p class="text-sm font-bold text-[#111418]">{{ currentUser?.tierLabel ?? 'Member' }}</p>
              <p class="text-xs text-gray-400">{{ currentUser?.tierShort ?? '—' }}</p>
            </div>
          </div>
          <div class="text-xs text-gray-500 space-y-1">
            <p v-if="currentUser?.articleMonthlyLimit" class="flex items-center gap-1.5">
              <Icon icon="lucide:file-text" class="w-3 h-3 text-gray-400" />
              {{ currentUser.articleMonthlyLimit }} articles per month
            </p>
            <p v-else class="flex items-center gap-1.5">
              <Icon icon="lucide:infinity" class="w-3 h-3 text-gray-400" />
              Unlimited articles
            </p>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT COLUMN ===== -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Writing Portfolio -->
        <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-sm font-bold text-[#111418] flex items-center gap-2">
              <Icon icon="lucide:book-open" class="w-4 h-4 text-[#8b1e21]" />
              Published Work
            </h2>
            <span v-if="publishedCount > 0" class="text-xs text-gray-400 font-medium">{{ publishedCount }} article{{ publishedCount !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="recentActivity.length" class="divide-y divide-gray-100">
            <RouterLink
              v-for="item in recentActivity"
              :key="item.id"
              :to="item.articleId ? `/article/${item.articleId}` : `/published/${item.id}`"
              class="flex items-start gap-4 sm:gap-5 px-6 py-5 hover:bg-gray-50/80 transition-all duration-200 group no-underline"
            >
              <!-- Article thumbnail -->
              <div class="hidden sm:block w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 ring-1 ring-gray-200/50">
                <img
                  v-if="item.coverImage || item.thumbnail"
                  :src="item.coverImage || item.thumbnail"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon icon="lucide:file-text" class="w-6 h-6 text-gray-300" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-[#111418] group-hover:text-[#8b1e21] transition-colors duration-200 line-clamp-2">{{ item.title }}</p>
                <p v-if="item.excerpt" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ item.excerpt }}</p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:calendar" class="w-3 h-3" />
                    {{ item.datePublished || formatDate(item.datePublished) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:clock" class="w-3 h-3" />
                    {{ item.readTime || '—' }} min read
                  </span>
                  <span v-if="item.views !== undefined" class="flex items-center gap-1">
                    <Icon icon="lucide:eye" class="w-3 h-3" />
                    {{ item.views }}
                  </span>
                  <span v-if="item.claps !== undefined" class="flex items-center gap-1">
                    <Icon icon="lucide:hand" class="w-3 h-3" />
                    {{ item.claps }}
                  </span>
                </div>
              </div>
              <Icon icon="lucide:chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-[#8b1e21] group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
            </RouterLink>
          </div>

          <!-- Empty state -->
          <div v-else class="px-6 py-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:book-open" class="w-6 h-6 text-gray-300" />
            </div>
            <p class="text-sm font-semibold text-gray-500">No published articles yet</p>
            <p class="text-xs text-gray-400 mt-1">Your published writing will appear here.</p>
          </div>
        </div>

        <!-- Save / Cancel buttons (edit mode) -->
        <div v-if="isEditing" class="flex items-center gap-3 bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
          <button
            type="button"
            class="flex-1 sm:flex-none bg-[#8b1e21] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#6d1716] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            @click="saveProfileData"
          >
            <Icon icon="lucide:check-circle" class="w-4 h-4" />
            Save Changes
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-none border border-gray-200 text-gray-600 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
            @click="cancelEditing"
          >
            <Icon icon="lucide:x" class="w-4 h-4" />
            Cancel
          </button>
        </div>

      </div>
    </div>

  </div>
</template>