<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getEvents } from '../data/events.js'

const router = useRouter()
const currentUser = inject('currentUser')

const events = ref([])
const activeFilter = ref('All')

const filterTabs = ['All', 'Featured Summit', 'Workshop', 'Public Lecture', 'Guild Meeting']

const filteredEvents = computed(() => {
  if (activeFilter.value === 'Reserved') {
    return events.value.filter((e) => !!localStorage.getItem(`gnsw_rsvp_${e.id}`))
  }
  if (activeFilter.value === 'All') return events.value
  return events.value.filter((e) => e.type === activeFilter.value)
})

onMounted(() => {
  events.value = getEvents()
})

function goToEvent(id) {
  router.push(`/events/${id}`)
}

function setFilter(tab) {
  activeFilter.value = tab
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class=" mx-auto ">

      <!-- Page title -->
      <div class=" mb-10">
        <h1 class="text-3xl font-bold text-[#111418]">Events</h1>
        <p class="text-sm text-gray-400 mt-1">Summits, workshops, masterclasses and public lectures from the Guild.</p>
      </div>

      <!-- Tabs row -->
      <div class="border-b border-[#eae8e4] flex items-center overflow-x-auto">
        <div class="flex items-center">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            @click="setFilter(tab)"
            class="shrink-0 px-1 mr-6 pb-3 text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer"
            :class="activeFilter === tab
              ? 'border-[#111418] text-[#111418] font-medium'
              : 'border-transparent text-gray-400 hover:text-[#111418]'"
          >
            {{ tab }}
          </button>
        </div>

        <div class="w-px h-4 bg-[#eae8e4] mx-4 shrink-0"></div>

        <button
          @click="setFilter('Reserved')"
          class="shrink-0 px-1 pb-3 text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer"
          :class="activeFilter === 'Reserved'
            ? 'border-[#111418] text-[#111418] font-medium'
            : 'border-transparent text-gray-400 hover:text-[#111418]'"
        >
          Reserved
        </button>
      </div>

      <!-- Events list -->
      <div>
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          @click="goToEvent(event.id)"
          class="flex items-center gap-6 py-6 border-b border-[#eae8e4] cursor-pointer group transition-colors"
        >
          <!-- Thumbnail -->
          <div class="w-16 h-16 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded bg-gray-100">
            <img
              :src="event.image"
              :alt="event.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-3 mb-1.5">
              <span class="text-xs font-semibold text-[#8b1e21]">{{ event.date }}</span>
              <span class="text-[10px] uppercase tracking-wider font-medium text-gray-400 border border-[#eae8e4] px-2 py-0.5">
                {{ event.type }}
              </span>
            </div>
            <h3 class="text-base font-bold text-[#111418] leading-snug group-hover:text-[#8b1e21] transition-colors line-clamp-1 mb-1">
              {{ event.title }}
            </h3>
            <div class="flex items-center gap-1.5 text-xs text-gray-400">
              <Icon icon="lucide:map-pin" width="11" height="11" />
              <span>{{ event.location }}</span>
            </div>
          </div>

          <!-- Arrow -->
          <div class="hidden sm:flex items-center text-gray-300 group-hover:text-[#8b1e21] group-hover:translate-x-1 transition-all duration-200 shrink-0">
            <Icon icon="lucide:arrow-right" width="16" height="16" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredEvents.length === 0" class="py-20 text-center">
          <p class="text-sm text-gray-400">
            {{ activeFilter === 'Reserved' ? "You haven't reserved a spot for any events yet." : 'No events in this category.' }}
          </p>
          <button
            v-if="activeFilter === 'Reserved'"
            @click="setFilter('All')"
            class="mt-4 text-xs font-semibold text-[#8b1e21] hover:underline cursor-pointer"
          >
            Browse all events
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

