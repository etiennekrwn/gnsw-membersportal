<template>
  <div class="relative" :class="wrapperClass">
    <input
      :type="show ? 'text' : 'password'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full"
      :style="{ paddingRight: '2.5rem' }"
      :class="inputClass"
      v-bind="$attrs"
    />
    <button
      type="button"
      :aria-label="show ? 'Hide password' : 'Show password'"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      @click="show = !show"
    >
      <Icon :icon="show ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

defineProps({
  modelValue: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  wrapperClass: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const show = ref(false)
</script>
