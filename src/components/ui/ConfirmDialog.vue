<template>
  <Teleport to="body">
    <transition name="confirm-fade">
      <div v-if="open" class="fixed inset-0 z-[100000] flex items-center justify-center p-4" @keydown.esc="$emit('cancel')">
        <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />
        <div
          class="relative bg-white w-full max-w-sm shadow-xl border border-[#eae8e4] p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto"
          role="alertdialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="flex items-start gap-4">
            <div :class="['w-10 h-10 shrink-0 flex items-center justify-center rounded-full', danger ? 'bg-red-50' : 'bg-[#faf9f5]']">
              <Icon :icon="danger ? 'lucide:triangle-alert' : 'lucide:info'" class="w-5 h-5" :class="danger ? 'text-red-600' : 'text-[#8b1e21]'" />
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-bold text-[#111418] leading-snug">{{ title }}</h3>
              <p class="mt-2 text-sm text-gray-500 leading-relaxed">{{ message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              ref="confirmBtn"
              :disabled="busy"
              :class="[
                'px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60',
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#8b1e21] hover:bg-[#6d1819]',
              ]"
              @click="$emit('confirm')"
            >
              {{ busy ? confirmBusyText : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { watch, nextTick, ref } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  confirmBusyText: { type: String, default: 'Working…' },
  cancelText: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
const confirmBtn = ref(null)

// Lock background scroll while open; focus the confirm button for keyboard users.
watch(() => props.open, async (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    confirmBtn.value?.focus()
  }
})
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.15s ease;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
