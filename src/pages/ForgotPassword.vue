<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4">
    <div class="bg-white border border-[#eae8e4] rounded-lg p-10 w-full max-w-sm">

      <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#111418] text-center mb-1">The Guild</h1>
      <p class="text-sm text-gray-400 text-center mb-8">Reset your password</p>

      <div v-if="message" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-5">
        {{ message }}
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-5">
        {{ error }}
      </div>

      <form v-if="!message" @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            class="w-full border border-[#eae8e4] rounded-md px-3 py-2.5 text-sm text-[#111418] outline-none focus:border-[#8b1e21] transition-colors"
          />
        </div>
        <p class="text-xs text-gray-400 leading-relaxed">
          Enter the email you signed up with and we'll send you a link to reset your password.
        </p>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-[#8b1e21] hover:underline font-medium">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '../api/client.js'

const email = ref('')
const message = ref('')
const error = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  error.value = ''
  isSubmitting.value = true
  try {
    await apiClient.post('/public/auth/forgot-password', { email: email.value })
    message.value = 'If an account exists for that email, a password reset link has been sent.'
  } catch (err) {
    error.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>