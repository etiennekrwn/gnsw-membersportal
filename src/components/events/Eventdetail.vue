<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getEventById, getEvents } from '../../data/events.js'

const route = useRoute()
const router = useRouter()
const currentUser = inject('currentUser')

const event = ref(null)
const allEvents = ref([])
const rsvpDone = ref(false)

const upcomingEvents = computed(() =>
  allEvents.value.filter((e) => e.id !== route.params.id).slice(0, 4)
)

function loadEvent(id) {
  allEvents.value = getEvents()
  event.value = getEventById(id)
  // Check if user already RSVP'd (persisted in localStorage)
  rsvpDone.value = !!localStorage.getItem(`gnsw_rsvp_${id}`)
}

function handleRsvp() {
  localStorage.setItem(`gnsw_rsvp_${event.value.id}`, JSON.stringify({
    userId: currentUser.value?.id,
    userName: currentUser.value?.name,
    eventId: event.value.id,
    eventTitle: event.value.title,
    rsvpAt: new Date().toISOString(),
  }))
  rsvpDone.value = true
}

function cancelRsvp() {
  localStorage.removeItem(`gnsw_rsvp_${event.value.id}`)
  rsvpDone.value = false
}

onMounted(() => loadEvent(route.params.id))
watch(() => route.params.id, (id) => loadEvent(id))
</script>

<template>
  <div class="min-h-screen bg-white">

    <div v-if="!event" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p class="text-sm text-gray-400">This event could not be found.</p>
      <RouterLink to="/events" class="text-xs font-semibold uppercase tracking-widest text-[#8b1e21]">
        Back to Events
      </RouterLink>
    </div>

    <template v-else>

      <!-- Hero image -->
      <div class="w-full h-56 md:h-72 overflow-hidden relative bg-[#111418]">
        <img :src="event.image" :alt="event.title" class="w-full h-full object-cover opacity-60" />
        <button
          @click="router.back()"
          class="absolute top-5 left-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" width="14" height="14" />
          Back
        </button>
      </div>

      <!-- Body -->
      <div class="max-w-5xl mx-auto px-6 py-10">
        <div class="flex flex-col lg:flex-row gap-12">

          <!-- Main content -->
          <div class="flex-1 min-w-0">

            <!-- Type + date -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 bg-[#8b1e21]/10 text-[#8b1e21] border border-[#8b1e21]/20">
                {{ event.type }}
              </span>
              <div class="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon icon="lucide:calendar" width="13" height="13" />
                {{ event.date }} · {{ event.time }}
              </div>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl font-bold text-[#111418] leading-snug mb-3">
              {{ event.title }}
            </h1>

            <!-- Location -->
            <div class="flex items-center gap-1.5 text-sm text-gray-400 mb-8 pb-8 border-b border-[#eae8e4]">
              <Icon icon="lucide:map-pin" width="14" height="14" class="text-[#8b1e21] shrink-0" />
              {{ event.location }}
            </div>

            <!-- Description -->
            <div class="space-y-4 mb-10">
              <p
                v-for="(para, i) in event.description.split('\n\n')"
                :key="i"
                class="text-sm text-gray-600 leading-relaxed"
              >
                {{ para }}
              </p>
            </div>

            <!-- Highlights -->
            <div class="border border-[#eae8e4] p-6 mb-10">
              <div class="flex items-center gap-2 mb-4">
                <Icon icon="lucide:tag" width="14" height="14" class="text-[#8b1e21]" />
                <span class="text-[10px] uppercase tracking-widest font-bold text-[#111418]">What to Expect</span>
              </div>
              <ul class="space-y-2.5">
                <li v-for="(point, i) in event.highlights" :key="i" class="flex items-start gap-3 text-sm text-gray-500">
                  <span class="mt-2 w-1 h-1 bg-[#8b1e21] shrink-0 block rounded-full"></span>
                  {{ point }}
                </li>
              </ul>
            </div>

            <!-- RSVP -->
            <div>
              <!-- Already RSVP'd -->
              <div v-if="rsvpDone" class="flex items-center gap-4">
                <div class="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                  <Icon icon="lucide:check-circle" width="16" height="16" />
                  You're attending this event
                </div>
                <button
                  @click="cancelRsvp"
                  class="text-xs text-gray-400 hover:text-[#8b1e21] transition-colors underline cursor-pointer"
                >
                  Cancel RSVP
                </button>
              </div>

              <!-- RSVP button -->
              <button
                v-else
                @click="handleRsvp"
                class="flex items-center gap-2 px-8 py-3.5 bg-[#111418] hover:bg-[#8b1e21] text-white text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer"
              >
                Reserve My Seat
                <Icon icon="lucide:arrow-right" width="14" height="14" />
              </button>
            </div>

          </div>

          <!-- Right sidebar: upcoming events -->
          <aside class="w-full lg:w-64 xl:w-72 shrink-0">
            <div class="sticky top-20">
              <p class="text-[10px] uppercase tracking-widest font-bold text-[#111418] mb-5 pb-4 border-b border-[#eae8e4]">
                Upcoming Events
              </p>
              <div class="flex flex-col divide-y divide-[#eae8e4]">
                <RouterLink
                  v-for="item in upcomingEvents"
                  :key="item.id"
                  :to="`/events/${item.id}`"
                  class="group flex items-stretch gap-3 py-4 first:pt-0 no-underline"
                >
                  <div class="w-14 h-14 shrink-0 overflow-hidden rounded bg-[#eae8e4]">
                    <img :src="item.image" :alt="item.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div class="flex flex-col justify-center min-w-0">
                    <span class="text-[10px] uppercase tracking-wider font-bold text-[#8b1e21] mb-0.5">{{ item.date }}</span>
                    <h4 class="text-sm text-[#111418] leading-snug group-hover:text-[#8b1e21] transition-colors line-clamp-2">
                      {{ item.title }}
                    </h4>
                  </div>
                </RouterLink>
              </div>
              <RouterLink
                to="/events"
                class="mt-5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#111418] transition-colors no-underline"
              >
                View All Events
                <Icon icon="lucide:arrow-right" width="12" height="12" />
              </RouterLink>
            </div>
          </aside>

        </div>
      </div>

    </template>
  </div>
</template>

