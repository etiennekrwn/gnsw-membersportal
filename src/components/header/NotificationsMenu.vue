<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

// Local notification source (server-backed feed is a later step).
const NOTIF_KEY = 'gnsw_notifications_read'
const seed = [
  { id: 1, type: 'clap', text: 'Adaeze Okoye clapped on your article.', time: '2h ago' },
  { id: 2, type: 'comment', text: 'Emeka Nwosu commented on "The First Hour…".', time: '1d ago' },
  { id: 3, type: 'follow', text: 'Dr. Funmi Adeyemi started following you.', time: '3d ago' },
  { id: 4, type: 'system', text: 'Your Guild membership renewal is due soon.', time: '5d ago' },
]

const open = ref(false)
const wrapRef = ref(null)
const readIds = ref(new Set())

function load() {
  try {
    readIds.value = new Set(JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'))
  } catch {
    readIds.value = new Set()
  }
}

function persist() {
  localStorage.setItem(NOTIF_KEY, JSON.stringify([...readIds.value]))
}

load()

const unreadCount = computed(() => seed.filter(n => !readIds.value.has(n.id)).length)

const typeIcon = (t) => ({
  clap: 'lucide:hand',
  comment: 'lucide:message-circle',
  follow: 'lucide:user-plus',
  system: 'lucide:bell',
}[t] || 'lucide:bell')

function markAllRead() {
  seed.forEach(n => readIds.value.add(n.id))
  persist()
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) markAllRead()
}

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div class="relative" ref="wrapRef">
    <button
      class="relative p-2 text-gray-500 hover:text-[#111418] transition-colors cursor-pointer"
      aria-label="Notifications"
      @click="toggleOpen"
    >
      <Icon icon="lucide:bell" width="20" height="20" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 min-w-[14px] h-[14px] bg-[#8b1e21] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-[calc(100%+10px)] w-80 max-w-[90vw] bg-white border border-[#eae8e4] rounded-lg shadow-lg z-50 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-[#eae8e4] flex items-center justify-between">
          <p class="text-sm font-semibold text-[#111418]">Notifications</p>
          <span class="text-[10px] uppercase tracking-widest text-gray-400">Marked read</span>
        </div>
        <div class="max-h-80 overflow-y-auto divide-y divide-[#eae8e4]">
          <div
            v-for="n in seed"
            :key="n.id"
            class="flex items-start gap-3 px-4 py-3"
          >
            <span class="w-7 h-7 shrink-0 rounded-full bg-[#f2f0eb] flex items-center justify-center">
              <Icon :icon="typeIcon(n.type)" class="w-3.5 h-3.5 text-[#8b1e21]" />
            </span>
            <div class="min-w-0">
              <p class="text-[13px] text-[#111418] leading-snug">{{ n.text }}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ n.time }}</p>
            </div>
          </div>
        </div>
        <RouterLink
          to="/settings"
          @click="open = false"
          class="block px-4 py-3 text-center text-xs font-semibold text-[#8b1e21] border-t border-[#eae8e4] hover:bg-[#faf9f5] transition-colors no-underline"
        >
          Manage notifications
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>