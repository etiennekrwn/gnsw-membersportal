<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
    <div class="bg-white border border-[#eae8e4] rounded-lg p-10 w-full max-w-sm">

      <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#111418] text-center mb-1">The Guild</h1>
      <p class="text-sm text-gray-400 text-center mb-8">Guild of Nigerian Speechwriters</p>

      <div v-if="loginError" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-5">
        {{ loginError }}
      </div>

      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
        />
      </div>

      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
        />
      </div>

      <div class="flex items-center justify-between mb-6 text-xs">
        <button
          type="button"
          @click="showResend = !showResend"
          class="text-[#8b1e21] hover:underline font-medium cursor-pointer bg-transparent border-0 p-0 text-left"
        >
          Didn't get your activation link? Resend it
        </button>
        <router-link to="/forgot-password" class="text-gray-500 hover:text-[#8b1e21] hover:underline">
          Forgot password?
        </router-link>
      </div>

      <!-- Resend activation link -->
      <div v-if="showResend" class="mb-6 rounded-md border border-[#eae8e4] bg-gray-50 p-4">
        <p class="text-xs font-medium text-gray-600 mb-2">Enter your email to receive a new activation link</p>
        <div class="flex gap-2">
          <input
            v-model="resendEmail"
            type="email"
            class="flex-1 border border-[#eae8e4] rounded-md px-3 py-2 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
          />
          <button
            @click="handleResend"
            :disabled="isResending"
            class="bg-[#8b1e21] hover:bg-[#741a1d] text-white text-sm font-medium rounded-md px-4 py-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {{ isResending ? 'Sending...' : 'Send new link' }}
          </button>
        </div>
        <p v-if="resendStatus" :class="resendStatus.type === 'error' ? 'text-red-600' : 'text-green-700'" class="text-xs mt-2">
          {{ resendStatus.message }}
        </p>
        <div v-if="resendStatus && resendStatus.type === 'info' && resendStatus.membershipUrl" class="mt-3">
          <a
            :href="resendStatus.membershipUrl"
            target="_blank"
            rel="noopener"
            class="inline-block w-full text-center bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2 transition-colors"
          >
            Become a Member
          </a>
        </div>
      </div>

      <button
        @click="handleLogin"
        :disabled="isSubmitting"
        class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        {{ isSubmitting ? 'Signing In...' : 'Sign in' }}
      </button>

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

// Resend activation link
const showResend = ref(false)
const resendEmail = ref('')
const isResending = ref(false)
const resendStatus = ref(null)

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

    // Track onboarding status (whether the user has uploaded a profile photo)
    localStorage.setItem('portal_onboarding_completed', user.onboardingCompleted ? 'true' : 'false')

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

async function handleResend() {
  resendStatus.value = null
  if (!resendEmail.value || !resendEmail.value.includes('@')) {
    resendStatus.value = { type: 'error', message: 'Please enter a valid email address.' }
    return
  }

  isResending.value = true
  try {
    const res = await apiClient.post('/public/auth/resend-activation', {
      email: resendEmail.value,
    })
    const data = res.data?.data || {}

    // For NOT_A_MEMBER we show the "You are not a member yet." message + membership CTA.
    if (data.status === 'NOT_A_MEMBER') {
      resendStatus.value = {
        type: 'info',
        message: data.message,
        membershipUrl: data.membershipUrl,
      }
    } else if (data.status === 'ALREADY_ACTIVE') {
      resendStatus.value = { type: 'info', message: data.message }
    } else if (data.status === 'PENDING') {
      resendStatus.value = { type: 'info', message: data.message }
    } else {
      resendStatus.value = { type: 'info', message: data.message || 'If an account is pending activation, a new link has been sent to your email.' }
    }
  } catch (err) {
    resendStatus.value = { type: 'error', message: err.message || 'Unable to send the link. Please try again.' }
  } finally {
    isResending.value = false
  }
}
</script>