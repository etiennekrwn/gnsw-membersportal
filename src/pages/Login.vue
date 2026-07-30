<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
    <div class="bg-white border border-[#eae8e4] rounded-lg p-10 w-full max-w-sm">

      <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#111418] text-center mb-1">GNSW</h1>
      <p class="text-sm text-gray-400 text-center mb-8">Guild of Nigerian Speechwriters</p>

      <div v-if="loginError" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-5">
        {{ loginError }}
      </div>

      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="your@email.com"
          class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
        />
      </div>

      <div class="mb-6">
        <label class="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
        />
      </div>

      <button
        @click="handleLogin"
        :disabled="isSubmitting"
        class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        {{ isSubmitting ? 'Signing In...' : 'Sign in' }}
      </button>

      <div class="mt-6 pt-5 border-t border-[#eae8e4] text-xs text-gray-400 space-y-1">
        <p class="font-medium text-gray-500">Sign in with your GNSW credentials</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/client.js'

const setCurrentUser = inject('setCurrentUser')
const router = useRouter()

const loginError = ref('')
const isSubmitting = ref(false)
const form = ref({ email: '', password: '' })

async function handleLogin() {
  loginError.value = ''
  isSubmitting.value = true

  try {
    const response = await apiClient.post('/public/auth/login', {
      username: form.value.email,
      password: form.value.password,
    })

    const { accessToken, user } = response.data.data

    // Store JWT token
    localStorage.setItem('portal_token', accessToken)
    localStorage.setItem('portal_user', JSON.stringify(user))

    // Set the current user for the portal's reactive state
    setCurrentUser({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      tier: user.role,
      tierLabel: user.tier,
      initials: (user.firstName?.[0] || '') + (user.lastName?.[0] || ''),
      joinDate: null,
    })

    router.push('/')
  } catch (err) {
    loginError.value = err.message || 'Invalid email or password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>