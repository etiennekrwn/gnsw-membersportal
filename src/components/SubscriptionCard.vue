<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api/client.js'

const loading = ref(true)
const error = ref('')
const sub = ref(null)
const cancelling = ref(false)
const confirmCancel = ref(false)
const cancelMessage = ref('')
const upgrading = ref(false)
const upgradeMessage = ref('')

const TIERS = ['AFFILIATE', 'ASSOCIATE', 'MEMBER']

const statusInfo = computed(() => {
  const s = (sub.value?.status || '').toLowerCase()
  if (s === 'active') return { text: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (s === 'past_due') return { text: 'Past Due', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
  if (s === 'past_due_expired' || s === 'expired') return { text: 'Inactive', cls: 'bg-red-50 text-red-600 border-red-200' }
  if (s === 'cancelled') return { text: 'Cancelled', cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  if (s === 'pending') return { text: 'Pending', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return { text: sub.value?.status || '-', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
})

const tierIndex = computed(() => {
  const t = (sub.value?.tier || '').toUpperCase()
  return TIERS.indexOf(t)
})

const upgradableTiers = computed(() => {
  const idx = tierIndex.value
  if (idx < 0) return []
  return TIERS.slice(idx + 1) // e.g. Affiliate -> [Associate, Member]
})

const graceDaysLeft = computed(() => {
  if (!sub.value?.graceEndsAt) return null
  const ms = new Date(sub.value.graceEndsAt).getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
})

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function loadSubscription() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/members/subscription')
    sub.value = res.data?.data || null
  } catch (e) {
    error.value = e.message || 'Unable to load your subscription.'
  } finally {
    loading.value = false
  }
}

async function doUpgrade(target) {
  upgrading.value = true
  error.value = ''
  upgradeMessage.value = ''
  try {
    const res = await apiClient.post('/members/subscription/upgrade', { newTier: target })
    const data = res.data?.data || {}
    await loadSubscription()
    upgradeMessage.value =
      data.message ||
      `Your tier has been upgraded to ${target}. The new plan amount applies on your next renewal.`
  } catch (e) {
    error.value = e.message || 'Failed to upgrade subscription.'
  } finally {
    upgrading.value = false
  }
}

async function doCancel() {
  cancelling.value = true
  error.value = ''
  try {
    await apiClient.post('/members/subscription/cancel')
    sub.value = { ...sub.value, status: 'cancelled' }
    cancelMessage.value = 'Subscription cancelled. You will not be charged again. Your access continues until the end of your paid period.'
  } catch (e) {
    error.value = e.message || 'Failed to cancel subscription.'
  } finally {
    cancelling.value = false
    confirmCancel.value = false
  }
}

onMounted(loadSubscription)
</script>

<template>
  <section class="rounded-md border border-[#eae8e4] bg-white p-5">
    <div class="flex items-center justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-bold text-[#111418]">Membership Subscription</h3>
        <p class="text-xs text-slate-500 mt-0.5">Annual dues are billed once a year.</p>
      </div>
      <span
        v-if="sub && !loading"
        class="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
        :class="statusInfo.cls"
      >
        {{ statusInfo.text }}
      </span>
    </div>

    <div v-if="loading" class="py-4 text-sm text-slate-400">Loading subscription...</div>

    <div v-else-if="!sub" class="py-4 text-sm text-slate-500">
      No subscription found for this account.
    </div>

    <template v-else>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-slate-500">Status</dt>
          <dd class="font-medium text-[#111418] capitalize">{{ statusInfo.text }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-slate-500">Tier</dt>
          <dd class="font-medium text-[#111418] uppercase">{{ sub.tier || '-' }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-slate-500">Next payment</dt>
          <dd class="font-medium text-[#111418]">{{ formatDate(sub.nextPaymentDate) }}</dd>
        </div>
      </dl>

      <!-- Grace countdown banner: renewal failed but access is still live -->
      <div
        v-if="graceDaysLeft !== null && graceDaysLeft > 0"
        class="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
      >
        Your renewal payment failed. You keep full access for {{ graceDaysLeft }} day{{ graceDaysLeft === 1 ? '' : 's' }}
        (until {{ formatDate(sub.graceEndsAt) }}). Update your payment method to avoid losing access.
      </div>

      <!-- Inactive notice -->
      <div
        v-else-if="sub.status === 'expired'"
        class="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
      >
        Your subscription is inactive. Your account remains, but posting and full article access are paused.
      </div>

      <p
        v-if="cancelMessage"
        class="mt-3 border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
      >
        {{ cancelMessage }}
      </p>
      <p v-if="upgradeMessage" class="mt-3 border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        {{ upgradeMessage }}
      </p>
      <p v-if="error" class="mt-3 text-xs text-red-600">{{ error }}</p>

      <!-- Tier upgrade -->
      <div v-if="upgradableTiers.length" class="mt-4 border-t border-[#eae8e4] pt-4">
        <p class="text-xs text-slate-500 mb-2">Upgrade your tier:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in upgradableTiers"
            :key="t"
            type="button"
            :disabled="upgrading"
            class="border border-[#eae8e4] px-3 py-1.5 text-xs font-semibold capitalize text-[#111418] hover:bg-[#faf9f5] disabled:opacity-50"
            @click="doUpgrade(t)"
          >
            Up to {{ t.toLowerCase() }}
          </button>
        </div>
      </div>

      <div
        v-if="sub.status === 'active' || sub.status === 'past_due'"
        class="mt-4 border-t border-[#eae8e4] pt-4"
      >
        <button
          v-if="!confirmCancel"
          type="button"
          class="text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-700"
          @click="confirmCancel = true"
        >
          Cancel subscription
        </button>
        <div v-else class="flex flex-col gap-2">
          <p class="text-xs text-slate-500">
            Cancel your annual subscription? You won't be charged next year, and you keep access until
            {{ formatDate(sub.nextPaymentDate) }}.
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              :disabled="cancelling"
              class="bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700 disabled:opacity-50"
              @click="doCancel"
            >
              {{ cancelling ? 'Cancelling...' : 'Yes, cancel' }}
            </button>
            <button
              type="button"
              class="border border-[#eae8e4] px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#faf9f5]"
              @click="confirmCancel = false"
            >
              Keep it
            </button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
