<script setup>
import { inject } from 'vue'

const currentUser = inject('currentUser')
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <h1 class="font-source-serif text-3xl font-extrabold text-[#111418] mb-2">Profile</h1>
    <p class="text-gray-500 text-sm mb-10">Your Guild membership and public writer profile.</p>

    <div class="border border-[#eae8e4] rounded-xl p-6 bg-white flex items-start gap-5">
      <div class="w-16 h-16 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
        <span class="text-white text-lg font-bold">{{ currentUser?.initials ?? '?' }}</span>
      </div>
      <div>
        <h2 class="text-xl font-bold text-[#111418] mb-1">{{ currentUser?.name ?? 'Member' }}</h2>
        <p class="text-sm text-[#8b1e21] font-semibold mb-2">{{ currentUser?.tierLabel ?? 'Member' }} · {{ currentUser?.tierShort }}</p>
        <p class="text-sm text-gray-500 leading-relaxed">{{ currentUser?.bio ?? 'No bio added yet.' }}</p>
        <p class="text-xs text-gray-400 mt-4">Member since {{ currentUser?.joinDate ?? '—' }}</p>
      </div>
    </div>
  </div>
</template>

