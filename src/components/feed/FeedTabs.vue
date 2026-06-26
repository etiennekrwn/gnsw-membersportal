<script setup>
defineProps({
  activeTab: { type: String, required: true },
})

const emit = defineEmits(['update:activeTab'])

const tabs = ['For You', 'Featured', 'Latest', 'Saved']
</script>

<template>
  <div class="flex items-center gap-0 border-b border-[#eae8e4] overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="emit('update:activeTab', tab)"
      :class="[
        'px-4 py-3 text-sm transition-colors relative shrink-0',
        activeTab === tab
          ? 'text-[#111418] font-medium'
          : 'text-gray-400 hover:text-gray-600'
      ]"
    >
      {{ tab }}
      <span
        v-if="activeTab === tab"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111418] rounded-full"
      />
    </button>
  </div>
</template>
