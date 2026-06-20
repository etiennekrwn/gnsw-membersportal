<script setup>
import { mockEvents } from '../../data/mockEvents.js'

const typeColors = {
  'Summit': 'bg-red-50 text-[#8b1e21]',
  'Workshop': 'bg-blue-50 text-blue-700',
  'Online Session': 'bg-green-50 text-green-700',
}
</script>

<template>
  <aside class="w-72 shrink-0 pl-8 border-l border-[#eae8e4]">

    <h3 class="text-sm font-semibold text-[#111418] mb-5">Upcoming Events</h3>

    <div class="flex flex-col gap-5">
      <div
        v-for="event in mockEvents"
        :key="event.id"
        class="cursor-pointer group"
      >
        <!-- Type badge -->
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="typeColors[event.type] || 'bg-gray-100 text-gray-500'">
          {{ event.type }}
        </span>

        <!-- Title -->
        <p class="text-sm font-semibold text-[#111418] mt-1.5 mb-1 leading-snug group-hover:text-[#8b1e21] transition-colors">
          {{ event.title }}
        </p>

        <!-- Date & location -->
        <p class="text-xs text-gray-400">{{ event.date }} · {{ event.time }}</p>
        <p class="text-xs text-gray-400">{{ event.location }}</p>
      </div>
    </div>

  </aside>
</template>