<template>
  <div class="relative" ref="wrapRef">

    <!-- Avatar circle -->
    <button
      @click="open = !open"
      class="w-9 h-9 rounded-full bg-[#111418] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
    >
      <span class="text-white text-xs font-semibold tracking-wide">{{ user?.initials }}</span>
    </button>

    <!-- Dropdown -->
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
        class="absolute right-0 top-[calc(100%+10px)] w-52 bg-white border border-[#eae8e4] rounded-lg shadow-lg z-50 overflow-hidden"
      >
        <!-- User info -->
        <div class="px-4 py-3.5">
          <p class="text-sm font-semibold text-[#111418]">{{ user?.name }}</p>
          <p class="text-xs text-gray-400 mt-0.5 mb-2">{{ user?.email }}</p>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="tierPillClass">
            {{ user?.tierShort }}
          </span>
        </div>

        <hr class="border-[#eae8e4]" />

        <!-- Links -->
        <div class="py-1.5">
          <RouterLink
            to="/profile"
            @click="open = false"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5] transition-colors"
          >
            Profile
          </RouterLink>
          <RouterLink
            to="/membership"
            @click="open = false"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5] transition-colors"
          >
            Membership
          </RouterLink>
          <RouterLink
            to="/settings"
            @click="open = false"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-[#faf9f5] transition-colors"
          >
            Settings
          </RouterLink>
        </div>

        <hr class="border-[#eae8e4]" />

        <!-- Sign out -->
        <button
          @click="() => { open = false; emit('signout') }"
          class="w-full text-left px-4 py-2.5 text-sm text-[#8b1e21] hover:bg-[#faf9f5] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  user: { type: Object, default: null },
})
const emit = defineEmits(['signout'])

const open = ref(false)
const wrapRef = ref(null)

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

const tierPillClass = computed(() => {
  if (props.user?.tier === 'ROLE_ASSOCIATE') return 'bg-amber-50 text-amber-800'
  if (props.user?.tier === 'ROLE_MEMBER')    return 'bg-blue-50 text-blue-800'
  if (props.user?.tier === 'ROLE_FELLOW')    return 'bg-red-50 text-[#8b1e21]'
  return ''
})
</script>