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
        class="w-full bg-[#111418] hover:bg-gray-800 text-white text-sm font-medium rounded-md py-2.5 transition-colors cursor-pointer"
      >
        Sign in
      </button>

      <div class="mt-6 pt-5 border-t border-[#eae8e4] text-xs text-gray-400 space-y-1">
        <p class="font-medium text-gray-500">Test accounts:</p>
        <p>Associate — adaeze@gnsw.ng / associate123</p>
        <p>Partner — emeka@gnsw.ng / partner123</p>
        <p>Fellow — funmi@gnsw.ng / fellow123</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { mockUsers } from '../data/mockUsers.js'

const setCurrentUser = inject('setCurrentUser')
const router = useRouter()

const loginError = ref('')
const form = ref({ email: '', password: '' })

function handleLogin() {
  loginError.value = ''
  const user = mockUsers.find(
    u => u.email === form.value.email && u.password === form.value.password
  )
  if (user) {
    setCurrentUser(user)
    router.push('/')
  } else {
    loginError.value = 'Invalid email or password.'
  }
}
</script>