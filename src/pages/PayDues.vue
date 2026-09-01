<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/client.js'
import PaystackPop from '@paystack/inline-js'

const router = useRouter()
const handleSignout = inject('handleSignout')

const loading = ref(true)
const error = ref('')
const status = ref(null)
const initData = ref(null)
const starting = ref(false)
const paying = ref(false)
const successMsg = ref('')
const paid = ref(false)

const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

async function loadSubscription() {
  try {
    const res = await apiClient.get('/members/subscription')
    const data = res.data?.data || null
    status.value = data
    localStorage.setItem('portal_subscription', JSON.stringify(data))
    return data
  } catch (e) {
    error.value = e.message || 'Unable to load your membership information.'
    return null
  } finally {
    loading.value = false
  }
}

async function initDues() {
  error.value = ''
  successMsg.value = ''
  starting.value = true
  try {
    const res = await apiClient.post('/members/dues/init')
    initData.value = res.data?.data || null
  } catch (e) {
    error.value = e.message || 'Unable to start payment. Please try again.'
  } finally {
    starting.value = false
  }
}

// Called after Paystack reports success. Verifies + activates the membership on
// the backend, then caches the active subscription and shows the success view.
async function handlePaymentSuccess(reference) {
  try {
    const res = await apiClient.post('/members/dues/verify', { reference })
    successMsg.value = res.data?.message || 'Payment confirmed. Welcome to the Guild!'
  } catch (e) {
    // The webhook may have already activated us — that's fine, treat as success.
    if (e.response?.data?.message !== 'Your membership is already active.') {
      successMsg.value = 'Your payment was received. Welcome to the Guild!'
    }
  }
  // Cache the (now-active) subscription so the pay-wall is cleared going forward.
  const sub = await loadSubscription()
  if (!sub || !sub.isActive) {
    try {
      const again = await apiClient.get('/members/subscription')
      const data = again.data?.data || null
      status.value = data
      localStorage.setItem('portal_subscription', JSON.stringify(data))
    } catch (e) { /* already paid either way */ }
  }
  paid.value = true
  paying.value = false
}

function goToPortal() {
  router.push('/')
}

function payNow() {
  if (!initData.value?.accessCode) return
  paying.value = true
  error.value = ''
  try {
    const popup = new PaystackPop()
    popup.newTransaction({
      accessCode: initData.value.accessCode,
      onSuccess: (transaction) => {
        handlePaymentSuccess(transaction?.reference || initData.value.reference)
      },
      onCancel: () => {
        paying.value = false
        error.value = 'Payment was cancelled. Your application remains valid — you can pay any time.'
      },
      onError: () => {
        paying.value = false
        error.value = 'Something went wrong with the payment. Please try again.'
      },
    })
  } catch (e) {
    paying.value = false
    error.value = e.message || 'Unable to open payment. Please try again.'
  }
}

function signOut() {
  const sub = localStorage.getItem('portal_subscription')
  localStorage.removeItem('portal_token')
  localStorage.removeItem('portal_user')
  if (sub) localStorage.setItem('portal_subscription', sub)
  handleSignout()
  router.push('/login')
}

onMounted(async () => {
  const sub = await loadSubscription()
  if (sub && sub.isActive) {
    router.push('/')
    return
  }
  await initDues()
})
</script>

<template>
  <div class="min-h-screen bg-[#faf9f5] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white border border-[#eae8e4] rounded-lg shadow-sm overflow-hidden">

      <div class="bg-[#111418] px-8 py-6 text-center">
        <h1 class="font-['Playfair_Display'] text-2xl font-bold text-white mb-1">Complete Your Membership</h1>
        <p class="text-[13px] text-slate-300">Guild of Nigerian Speechwriters</p>
      </div>

      <div class="p-8">
        <!-- Success view shown after payment is confirmed -->
        <div v-if="paid" class="text-center py-6">
          <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 class="font-['Playfair_Display'] text-2xl font-bold text-[#111418] mb-2">Welcome to the Guild!</h2>
          <p class="text-sm text-slate-500 mb-6">
            Your membership is active. You now have full access to all member benefits, resources and the community.
          </p>
          <button
            @click="goToPortal"
            class="w-full bg-[#8b1e21] hover:bg-[#741a1d] text-white text-sm font-semibold rounded-md py-3 transition-colors"
          >
            Go to Members Portal
          </button>
        </div>

        <div v-else-if="loading" class="text-center py-6 text-sm text-gray-500">
          <div class="inline-block w-8 h-8 border-4 border-[#eae8e4] border-t-[#8b1e21] rounded-full animate-spin mb-3"></div>
          <p>Loading your membership details...</p>
        </div>

        <div v-else-if="error && !initData && !status" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3">
          {{ error }}
        </div>

        <div v-else>
          <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-6">
            You remain an accepted member. Your full access unlocks the moment your first annual subscription is paid.
          </div>

          <div class="bg-[#faf9f5] border border-[#eae8e4] rounded-md p-5 mb-6 text-center">
            <p class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Annual Membership Subscription</p>
            <p class="text-[11px] text-gray-500 mb-1">Tier: {{ status?.tier || 'Member' }}</p>
            <p class="text-3xl font-bold text-[#8b1e21] mt-2">
              {{ initData?.amount ? '₦' + (initData.amount / 100).toLocaleString() : (status?.annualFee || '') }}
            </p>
            <p class="text-[11px] text-gray-400 mt-1">Billed annually and renewable each year</p>
          </div>

          <div v-if="successMsg" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 mb-4">
            {{ successMsg }}
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-[#8b1e21] text-sm rounded-md px-4 py-3 mb-4">
            {{ error }}
          </div>

          <div class="space-y-3">
            <button
              @click="payNow"
              :disabled="paying || starting || !initData?.accessCode"
              class="w-full bg-[#8b1e21] hover:bg-[#741a1d] text-white text-sm font-semibold rounded-md py-3 transition-colors disabled:opacity-50"
            >
              <span v-if="paying">Opening payment...</span>
              <span v-else>Pay Now</span>
            </button>

            <button
              @click="signOut"
              class="w-full text-[11px] text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              I'll pay later &amp; sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>