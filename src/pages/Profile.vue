<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import apiClient from '../api/client.js'

const currentUser = inject('currentUser')

// Profile edit state
const isEditing = ref(false)
const saved = ref(false)
const loading = ref(true)

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
const professionalId = ref('')
const tier = ref('')
const memberSince = ref('')
const reasonForJoining = ref('')
const socials = ref('')
const city = ref('')
const zone = ref('')
const languages = ref([])

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

async function loadProfileData() {
  loading.value = true
  try {
    const response = await apiClient.get('/members/profile')
    const profile = response.data.data

    // Build display name from first + last name
    const firstName = profile.firstName || ''
    const lastName = profile.lastName || ''
    displayName.value = `${firstName} ${lastName}`.trim() || currentUser?.name || ''
    bio.value = profile.bio || ''
    email.value = profile.email || currentUser?.email || ''
    professionalId.value = profile.professionalId || ''
    tier.value = profile.tier || ''
    memberSince.value = profile.memberSince
      ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'N/A'

    // Set optional fields from member profile
    employer.value = profile.organisation || ''
    linkedin.value = profile.linkedInProfile || ''
    socials.value = profile.socials || ''
    reasonForJoining.value = profile.reasonForJoining || ''
    city.value = profile.city || ''
    zone.value = profile.zone || ''
    if (profile.sectors) {
      specializations.value = profile.sectors.split(',').map(s => s.trim())
    }
    if (profile.languages) {
      languages.value = profile.languages.split(',').map(s => s.trim())
    }

  } catch (err) {
    console.error('Failed to load profile:', err)
    // Fallback to currentUser data
    displayName.value = currentUser?.name || ''
    email.value = currentUser?.email || ''
  } finally {
    loading.value = false
  }
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

async function saveProfileData() {
  try {
    await apiClient.put('/members/profile', {
      organisation: employer.value,
      bio: bio.value,
      sectors: specializations.value.join(', '),
      phone: '',
      speechTypes: '',
      languages: languages.value.join(', '),
      zone: zone.value,
      city: city.value,
      profileImageUrl: null,
      linkedInProfile: linkedin.value,
      socials: socials.value,
    })
    isEditing.value = false
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (err) {
    console.error('Failed to save profile:', err)
    alert('Failed to save profile: ' + (err.message || 'Unknown error'))
  }
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
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-serif text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight">Profile</h1>
        <p class="text-slate-500 text-sm mt-1">Your public face in the Guild.</p>
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
          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white bg-[#8b1e21] hover:bg-[#6d1716] px-5 py-2.5 transition-all duration-200"
          @click="startEditing"
        >
          <Icon icon="lucide:pencil" class="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>
    </div>

    <!-- ==================== PROFILE CARD ==================== -->
    <div class="bg-white border border-[#eae8e4] mb-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row gap-6 items-start p-8 border-b border-[#eae8e4]">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div class="w-22 h-22 sm:w-24 sm:h-24 bg-[#e4e0d5] overflow-hidden">
            <img v-if="avatarSrc" :src="avatarSrc" :alt="displayName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-[#8b1e21] text-3xl font-bold tracking-tight">{{ initials }}</span>
            </div>
          </div>
          <!-- Inline edit badge -->
          <label v-if="isEditing" class="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-[#eae8e4] shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Icon icon="lucide:camera" class="w-3.5 h-3.5 text-slate-500" />
            <input type="file" accept="image/*" class="sr-only" @change="handleAvatarUpload" />
          </label>
          <button
            v-if="isEditing && avatarPreview"
            type="button"
            class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white shadow flex items-center justify-center hover:bg-red-600 transition-colors"
            @click="removeAvatar"
          >
            <Icon icon="lucide:x" class="w-3 h-3 text-white" />
          </button>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Tier + ID -->
          <div class="flex items-center gap-2.5 mb-2">
            <span class="text-[10.5px] font-semibold uppercase tracking-widest text-slate-500">
              {{ currentUser?.tierLabel ?? tier ?? 'Member' }}
            </span>
            <span class="w-[3px] h-[3px] rounded-full bg-slate-300"></span>
            <span class="text-[10.5px] uppercase tracking-widest text-slate-300">
              {{ currentUser?.professionalId || professionalId || currentUser?.tierShort || 'GNSW-MEMBER' }}
            </span>
          </div>

          <!-- Display Name (editable inline) -->
          <div v-if="isEditing">
            <input
              v-model="displayName"
              type="text"
              class="w-full font-serif text-[28px] leading-tight text-[#1a1a1a] bg-transparent border-b-2 border-[#8b1e21]/30 focus:border-[#8b1e21] outline-none pb-1 transition-colors"
            />
          </div>
          <h1 v-else class="font-serif text-[28px] leading-tight text-[#1a1a1a] mb-1.5 truncate">{{ displayName || currentUser?.name || 'Member' }}</h1>

          <div class="w-9 h-[2px] bg-[#8b1e21] mb-2.5"></div>

          <p class="text-[13px] text-slate-500">
            {{ city || '—' }}{{ zone ? ', ' + zone : '' }} · Member since {{ memberSince }}
          </p>
        </div>

        <!-- Contact button -->
        <a
          :href="`mailto:${email}`"
          class="inline-flex items-center gap-2 border border-slate-300 hover:border-[#8b1e21] text-[#1a1a1a] hover:text-[#8b1e21] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors shrink-0"
        >
          <Icon icon="lucide:mail" class="w-3.5 h-3.5" />
          Contact
        </a>
      </div>

      <!-- Body -->
      <div class="flex flex-col md:flex-row">
        <!-- Sidebar -->
        <div class="w-full md:w-56 shrink-0 p-6 border-b md:border-b-0 md:border-r border-[#eae8e4]">
          <p class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 mb-3">Contact</p>

          <div v-if="isEditing" class="space-y-3 mb-5">
            <label class="block">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Email</span>
              <input v-model="email" type="email" class="w-full text-[12.5px] text-[#1a1a1a] border border-[#eae8e4] px-3 py-2 outline-none focus:border-[#8b1e21] bg-white transition-colors" />
            </label>
            <label class="block">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Website / Socials</span>
              <input v-model="socials" type="text" class="w-full text-[12.5px] text-[#1a1a1a] border border-[#eae8e4] px-3 py-2 outline-none focus:border-[#8b1e21] bg-white transition-colors" />
            </label>
            <label class="block">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">LinkedIn</span>
              <input v-model="linkedin" type="url" class="w-full text-[12.5px] text-[#1a1a1a] border border-[#eae8e4] px-3 py-2 outline-none focus:border-[#8b1e21] bg-white transition-colors" />
            </label>
          </div>

          <div v-else class="space-y-2.5 mb-5">
            <a v-if="email" :href="`mailto:${email}`" class="flex items-center gap-2 text-[12.5px] text-[#1a1a1a] hover:text-[#8b1e21] transition-colors">
              <Icon icon="lucide:mail" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ email }}</span>
            </a>
            <a v-if="socials" :href="socials.startsWith('http') ? socials : `https://${socials}`" target="_blank" class="flex items-center gap-2 text-[12.5px] text-[#1a1a1a] hover:text-[#8b1e21] transition-colors">
              <Icon icon="lucide:globe" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ socials }}</span>
            </a>
            <a v-if="linkedin" :href="linkedin" target="_blank" class="flex items-center gap-2 text-[12.5px] text-[#1a1a1a] hover:text-[#8b1e21] transition-colors">
              <Icon icon="lucide:linkedin" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              LinkedIn profile
            </a>
          </div>

          <!-- Languages -->
          <template v-if="languages.length">
            <p class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 mb-3">Languages</p>
            <p class="text-[12.5px] text-[#1a1a1a]">{{ languages.join(', ') }}</p>
          </template>
        </div>

        <!-- Main -->
        <div class="flex-1 p-6 sm:p-7">
          <!-- Professional narrative -->
          <p class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
            Professional narrative
          </p>

          <div v-if="isEditing">
            <textarea
              v-model="bio"
              rows="4"
              class="w-full text-sm text-slate-700 border border-[#eae8e4] px-4 py-3 resize-none outline-none focus:border-[#8b1e21] bg-white transition-colors"
            />
            <div class="flex justify-between items-center mt-1.5 mb-6">
              <p class="text-xs font-medium" :class="bio.length > 450 ? 'text-amber-500' : 'text-slate-400'">{{ bio.length }}/500</p>
            </div>
          </div>
          <p v-else-if="bio" class="text-sm leading-relaxed text-slate-700 mb-7">{{ bio }}</p>
          <p v-else class="text-sm leading-relaxed text-slate-400 italic mb-7">No professional narrative provided yet.</p>

          <!-- Focus areas -->
          <template v-if="specializations.length">
            <p class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
              Focus areas
            </p>
            <div v-if="isEditing" class="flex flex-wrap gap-1.5 mb-7">
              <button
                v-for="spec in specializationOptions"
                :key="spec"
                type="button"
                :class="[
                  'text-[11.5px] px-3 py-1.5 border transition-all duration-200',
                  specializations.includes(spec)
                    ? 'bg-[#8b1e21]/10 text-[#8b1e21] border-[#8b1e21]/25'
                    : 'bg-white text-slate-600 border-[#eae8e4] hover:border-slate-300 hover:bg-gray-50'
                ]"
                @click="toggleSpecialization(spec)"
              >
                {{ spec }}
              </button>
            </div>
            <div v-else class="flex flex-wrap gap-1.5 mb-7">
              <span
                v-for="spec in specializations"
                :key="spec"
                class="text-[11.5px] border border-[#eae8e4] px-3 py-1.5 text-slate-700"
              >
                {{ spec }}
              </span>
            </div>
          </template>

          <!-- Stats Bar -->
          <div class="grid grid-cols-4 gap-3 sm:gap-4 py-5 border-t border-[#eae8e4]">
            <div class="text-center">
              <p class="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">{{ publishedCount }}</p>
              <p class="text-xs text-slate-400 font-medium mt-0.5">Published</p>
            </div>
            <div class="text-center">
              <p class="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">{{ draftsCount }}</p>
              <p class="text-xs text-slate-400 font-medium mt-0.5">Drafts</p>
            </div>
            <div class="text-center">
              <p class="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">{{ totalViews.toLocaleString() }}</p>
              <p class="text-xs text-slate-400 font-medium mt-0.5">Views</p>
            </div>
            <div class="text-center">
              <p class="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">{{ totalClaps.toLocaleString() }}</p>
              <p class="text-xs text-slate-400 font-medium mt-0.5">Claps</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== PUBLISHED WORK ==================== -->
    <div class="bg-white border border-[#eae8e4] mb-6">
      <div class="px-6 py-5 border-b border-[#eae8e4] flex items-center justify-between">
        <h2 class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Icon icon="lucide:book-open" class="w-3.5 h-3.5 text-[#8b1e21]" />
          Published Work
        </h2>
        <span v-if="publishedCount > 0" class="text-xs text-slate-400 font-medium">{{ publishedCount }} article{{ publishedCount !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="recentActivity.length" class="divide-y divide-[#eae8e4]">
        <RouterLink
          v-for="item in recentActivity"
          :key="item.id"
          :to="item.articleId ? `/article/${item.articleId}` : `/published/${item.id}`"
          class="flex items-start gap-4 sm:gap-5 px-6 py-5 hover:bg-gray-50/80 transition-all duration-200 group no-underline"
        >
          <!-- Article thumbnail -->
          <div class="hidden sm:block w-16 h-16 bg-gray-100 overflow-hidden shrink-0 ring-1 ring-gray-200/50">
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
            <p class="text-sm font-bold text-[#1a1a1a] group-hover:text-[#8b1e21] transition-colors duration-200 line-clamp-2">{{ item.title }}</p>
            <p v-if="item.excerpt" class="text-xs text-slate-500 mt-1 line-clamp-2">{{ item.excerpt }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
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
        <div class="w-14 h-14 bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:book-open" class="w-6 h-6 text-gray-300" />
        </div>
        <p class="text-sm font-semibold text-slate-500">No published articles yet</p>
        <p class="text-xs text-slate-400 mt-1">Your published writing will appear here.</p>
      </div>
    </div>

    <!-- Why I Joined GNSW -->
    <div v-if="reasonForJoining" class="bg-white border border-[#eae8e4] p-6 mb-6">
      <h2 class="text-[10.5px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
        <Icon icon="lucide:heart" class="w-3.5 h-3.5 text-[#8b1e21]" />
        Why I joined GNSW
      </h2>
      <p class="text-sm text-slate-700 leading-relaxed">{{ reasonForJoining }}</p>
    </div>

    <!-- Save / Cancel buttons (edit mode) -->
    <div v-if="isEditing" class="flex items-center gap-3 bg-white border border-[#eae8e4] p-5">
      <button
        type="button"
        class="flex-1 sm:flex-none bg-[#8b1e21] text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 hover:bg-[#6d1716] transition-all duration-200 flex items-center justify-center gap-2"
        @click="saveProfileData"
      >
        <Icon icon="lucide:check-circle" class="w-4 h-4" />
        Save Changes
      </button>
      <button
        type="button"
        class="flex-1 sm:flex-none border border-slate-300 text-slate-600 text-xs font-semibold uppercase tracking-widest px-6 py-3 hover:bg-gray-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-2"
        @click="cancelEditing"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
        Cancel
      </button>
    </div>

  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>