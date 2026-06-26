<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { getEvents } from '../../data/events.js'
import { getRecommendedCourses } from '../../data/courses.js'

const props = defineProps({
  userTier: { type: String, default: 'ROLE_ASSOCIATE' },
})

const upcomingEvents = getEvents().slice(0, 3)

const levelColors = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-blue-50 text-blue-700',
  Advanced: 'bg-red-50 text-[#8b1e21]',
}

const recommendedCourses = computed(() =>
  getRecommendedCourses(props.userTier).slice(0, 4)
)
</script>

<template>
  <aside class="w-72 shrink-0 pl-8 border-l border-[#eae8e4] flex flex-col gap-10">

    <!-- Upcoming Events -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-5">Upcoming Events</h3>
      <div class="flex flex-col gap-5">
        <RouterLink
          v-for="event in upcomingEvents"
          :key="event.id"
          :to="`/events/${event.id}`"
          class="group no-underline cursor-pointer"
        >
          <span class="text-[10px] font-semibold uppercase tracking-wider text-[#8b1e21]">{{ event.date }}</span>
          <p class="text-sm font-semibold text-[#111418] mt-1 mb-1 leading-snug group-hover:text-[#8b1e21] transition-colors">
            {{ event.title }}
          </p>
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <Icon icon="lucide:map-pin" width="11" height="11" />
            <span>{{ event.city }}</span>
          </div>
        </RouterLink>
      </div>
      <RouterLink
        to="/events"
        class="mt-5 flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#111418] transition-colors no-underline"
      >
        View all events
        <Icon icon="lucide:arrow-right" width="11" height="11" />
      </RouterLink>
    </div>

    <!-- Recommended Learning -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-5">Recommended Learning</h3>
      <div v-if="recommendedCourses.length" class="flex flex-col gap-4">
        <RouterLink
          v-for="course in recommendedCourses"
          :key="course.id"
          :to="`/learning/${course.id}`"
          class="cursor-pointer group no-underline"
        >
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="levelColors[course.level]">
            {{ course.level }}
          </span>
          <h4 class="text-sm font-semibold text-[#111418] mt-1.5 mb-1 leading-snug group-hover:text-[#8b1e21] transition-colors">
            {{ course.title }}
          </h4>
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span>{{ course.lessons }} lessons</span>
            <span>{{ course.duration }}</span>
          </div>
        </RouterLink>
      </div>
      <p v-else class="text-xs text-gray-400 leading-relaxed">
        No courses available for your membership tier yet.
        <RouterLink to="/learning" class="text-[#8b1e21] font-semibold hover:underline">Browse learning</RouterLink>
      </p>
    </div>

  </aside>
</template>
