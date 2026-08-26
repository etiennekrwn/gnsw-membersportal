<script setup>
import { ref, inject, computed } from 'vue'
import { Icon } from '@iconify/vue'
import SubscriptionCard from '../components/SubscriptionCard.vue'

const currentUser = inject('currentUser')

const TIER_META = {
  ROLE_ASSOCIATE: {
    label: 'Associate',
    short: 'AGNSW',
    benefits: [
      'Tier 1 learning content and courses',
      'Access to summits and online sessions',
      'Publish up to 3 articles a month',
      'Verified directory listing',
    ],
  },
  ROLE_MEMBER: {
    label: 'Member',
    short: 'PGNSW',
    benefits: [
      'Everything in Associate',
      'Unlimited article publishing',
      'Tier 2 learning content and workshops',
      'Speaking opportunities at Guild events',
    ],
  },
  ROLE_FELLOW: {
    label: 'Fellow',
    short: 'FGNSW',
    benefits: [
      'Everything in Member',
      'Fellow-only masterclasses',
      'Judging panel for Guild awards',
      'Featured spotlights',
    ],
  },
}

const tierMeta = computed(() => {
  const t = currentUser?.value?.tier
  return TIER_META[t] || { label: 'Member', short: 'PGNSW', benefits: [] }
})

const mainSiteUrl = (import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <div class="mb-8">
      <p class="text-[10px] uppercase tracking-[3px] text-[#8b1e21] font-bold mb-2">Membership</p>
      <h1 class="text-3xl font-extrabold text-[#111418]">Your Membership</h1>
      <p class="text-sm text-gray-500 mt-2">
        Manage your subscription, tier, and billing information.
      </p>
    </div>

    <!-- Current tier summary -->
    <div class="rounded-xl border border-[#eae8e4] bg-[#111418] text-white p-6 md:p-8 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p class="text-[10px] uppercase tracking-widest text-[#d86d70] font-bold">Current tier</p>
        <p class="font-serif text-2xl font-bold mt-1">
          {{ currentUser?.name || 'Member' }}
          <span class="text-[#d86d70]">· {{ tierMeta.label }}</span>
        </p>
        <p class="text-sm text-white/60 mt-1">{{ tierMeta.short }}</p>
      </div>
      <RouterLink
        to="/profile"
        class="inline-flex items-center gap-2 shrink-0 border border-white/25 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2.5 hover:bg-white/10 transition-colors no-underline"
      >
        <Icon icon="lucide:user" class="w-3.5 h-3.5" />
        View profile
      </RouterLink>
    </div>

    <!-- Subscription management -->
    <SubscriptionCard class="mb-6" />

    <!-- Tier benefits -->
    <div class="rounded-xl border border-[#eae8e4] bg-white p-6">
      <h2 class="text-sm font-bold text-[#111418] mb-4">What your tier includes</h2>
      <ul class="space-y-3">
        <li
          v-for="b in tierMeta.benefits"
          :key="b"
          class="flex items-start gap-3 text-sm text-gray-600"
        >
          <span class="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-[#8b1e21]/10 flex items-center justify-center">
            <Icon icon="lucide:check" class="w-3 h-3 text-[#8b1e21]" />
          </span>
          {{ b }}
        </li>
      </ul>
    </div>

    <!-- Help / links -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RouterLink
        to="/settings"
        class="rounded-xl border border-[#eae8e4] bg-white p-5 hover:border-gray-300 transition no-underline flex items-start gap-3"
      >
        <Icon icon="lucide:settings" class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-[#111418]">Account settings</p>
          <p class="text-xs text-gray-500 mt-1">Password, notifications, and preferences.</p>
        </div>
      </RouterLink>
      <a
        :href="`${mainSiteUrl}/membership`"
        target="_blank"
        rel="noopener"
        class="rounded-xl border border-[#eae8e4] bg-white p-5 hover:border-gray-300 transition no-underline flex items-start gap-3"
      >
        <Icon icon="lucide:external-link" class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-[#111418]">Learn about tiers</p>
          <p class="text-xs text-gray-500 mt-1">Open the public membership page.</p>
        </div>
      </a>
    </div>
  </div>
</template>