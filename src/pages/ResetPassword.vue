<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
    <div class="bg-white border border-[#eae8e4] rounded-lg p-10 w-full max-w-sm">

      <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#111418] text-center mb-1">The Guild</h1>
      <p class="text-sm text-gray-400 text-center mb-8">Choose a new password</p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-5">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-5">
        {{ success }}
      </div>

      <form @submit.prevent="handleSubmit" v-if="!success" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
          <input
            v-model="form.passwordConfirmation"
            type="password"
            required
            minlength="8"
            class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <div v-if="success" class="text-center">
        <router-link to="/login" class="text-sm text-[#8b1e21] hover:underline font-medium">
          Go to Login
        </router-link>
      </div>

      <div v-if="!success && !token" class="mt-4 text-center">
        <router-link to="/forgot-password" class="text-sm text-[#8b1e21] hover:underline font-medium">
          Request a new reset link
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api/client.js'

const route = useRoute()
const token = ref('')
const form = ref({ password: '', passwordConfirmation: '' })
const error = ref('')
const success = ref('')
const isSubmitting = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Please check the link in your email.'
  }
})

async function handleSubmit() {
  error.value = ''
  if (form.value.password !== form.value.passwordConfirmation) {
    error.value = 'Passwords do not match.'
    return
  }
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  isSubmitting.value = true
  try {
    await apiClient.post('/public/auth/reset-password', {
      token: token.value,
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation,
    })
    success.value = 'Password reset successfully! You can now log in.'
  } catch (err) {
    error.value = err.message || 'Failed to reset your password. The link may have expired.'
  } finally {
    isSubmitting.value = false
  }
}
</script>