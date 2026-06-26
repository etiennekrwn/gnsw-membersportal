<script setup>
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-label="Loading">
    <div class="w-8 h-8 border-2 border-[#eae8e4] border-t-[#8b1e21] rounded-full animate-spin"></div>
    <p class="text-sm text-gray-400">Loading…</p>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
