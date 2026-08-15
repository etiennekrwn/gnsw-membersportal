<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4 py-10">
    <div class="bg-white border border-[#eae8e4] rounded-lg p-6 sm:p-10 w-full max-w-md">

      <h1 class="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#111418] text-center mb-1">GNSW</h1>
      <p class="text-sm text-gray-400 text-center mb-8">Welcome! Complete your profile</p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-5">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-5">
        {{ success }}
      </div>

      <!-- Step 1: Profile photo -->
      <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Step 1 of 1</p>

      <!-- Upload area -->
      <label
        class="block cursor-pointer"
        :class="{ 'pointer-events-none opacity-60': isUploading }"
      >
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileSelected"
          :disabled="isUploading"
        />

        <div
          class="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto bg-[#eae8e4] border-2 border-dashed border-gray-300 hover:border-[#8b1e21] flex items-center justify-center overflow-hidden transition-colors"
        >
          <!-- Preview or placeholder -->
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Profile preview"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-center px-4">
            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-[11px] text-gray-500 font-medium">Upload your photo</p>
            <p class="text-[10px] text-gray-400 mt-0.5">A clear photo of your face</p>
          </div>
        </div>
      </label>

      <p v-if="photoName" class="text-center text-[11px] text-gray-500 mt-2 truncate px-2">{{ photoName }}</p>
      <p class="text-center text-[10px] text-gray-400 mt-1">JPG, PNG or WebP • Max 5MB • Works on desktop & mobile</p>

      <div class="mt-8 space-y-3">
        <button
          @click="handleComplete"
          :disabled="isUploading"
          class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {{ isUploading ? 'Saving...' : 'Complete & Go to Dashboard' }}
        </button>
      </div>

      <!-- Subtle, small skip link -->
      <div class="mt-4 text-center">
        <button
          @click="handleSkip"
          :disabled="isUploading"
          class="text-[11px] text-gray-300 hover:text-gray-500 transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/client.js'

const router = useRouter()
const setCurrentUser = inject('setCurrentUser')

const previewUrl = ref('')
const base64Image = ref('')
const photoName = ref('')
const error = ref('')
const success = ref('')
const isUploading = ref(false)

const MAX_IMAGE_SIZE = 512 // px, resize longer edge to this
const COMPRESS_QUALITY = 0.8

function resizeAndCompress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('The selected file is not a valid image.'))
      img.onload = () => {
        // Calculate square crop center + resize
        const side = Math.min(img.width, img.height)
        const scale = MAX_IMAGE_SIZE / side

        const canvas = document.createElement('canvas')
        canvas.width = MAX_IMAGE_SIZE
        canvas.height = MAX_IMAGE_SIZE

        const ctx = canvas.getContext('2d')
        // Center-crop to a square, then scale down
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, MAX_IMAGE_SIZE, MAX_IMAGE_SIZE)

        // Prefer WebP on supporting browsers; fall back to JPEG (iOS Safari & older Android)
        let mime = 'image/webp'
        if (typeof canvas.toDataURL !== 'function') {
          reject(new Error('Image processing is not supported in this browser.'))
          return
        }
        let dataUrl = canvas.toDataURL(mime, COMPRESS_QUALITY)
        // iOS Safari doesn't support webp in toDataURL — it falls back silently to png
        if (dataUrl.startsWith('data:image/png') && mime === 'image/webp') {
          dataUrl = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY)
        }
        resolve(dataUrl)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  error.value = ''
  success.value = ''

  // Validate type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file (JPG, PNG or WebP).'
    return
  }
  // Validate size before compression
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'The selected image is larger than 5MB. Please choose a smaller one.'
    return
  }

  photoName.value = file.name
  try {
    const dataUrl = await resizeAndCompress(file)
    base64Image.value = dataUrl
    previewUrl.value = dataUrl
  } catch (err) {
    error.value = err.message || 'Unable to process the image. Please try another.'
    base64Image.value = ''
    previewUrl.value = ''
  } finally {
    // Reset input so the same file can be re-selected
    event.target.value = ''
  }
}

function finishOnboarding(userUpdate = {}) {
  // Mark complete in localStorage
  localStorage.setItem('portal_onboarding_completed', 'true')

  // Update stored user object too
  const stored = JSON.parse(localStorage.getItem('portal_user') || '{}')
  stored.onboardingCompleted = true
  localStorage.setItem('portal_user', JSON.stringify(stored))

  // Update reactive currentUser
  setCurrentUser(stored)

  router.push('/')
}

async function handleComplete() {
  error.value = ''
  success.value = ''

  if (!base64Image.value) {
    error.value = 'Please upload a profile photo, or skip for now.'
    return
  }

  isUploading.value = true
  try {
    await apiClient.post('/members/onboarding/photo', {
      profileImage: base64Image.value,
    })
    success.value = 'Profile photo saved!'
    finishOnboarding()
  } catch (err) {
    error.value = err.message || 'Unable to save your photo. Please try again.'
  } finally {
    isUploading.value = false
  }
}

function handleSkip() {
  finishOnboarding()
}
</script>