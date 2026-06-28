<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  icon: { type: String, default: 'lucide:inbox' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="text-center py-16 px-6 border border-dashed border-[#eae8e4] rounded-xl bg-[#faf9f5]">
    <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#eae8e4] mb-4">
      <Icon :icon="icon" class="w-5 h-5 text-gray-400" />
    </div>
    <h3 class="font-source-serif text-xl font-bold text-[#111418] mb-2">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">{{ description }}</p>
    <slot />
  </div>
</template>

