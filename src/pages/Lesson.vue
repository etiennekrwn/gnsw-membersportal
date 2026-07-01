<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getCourseById } from '../data/courses.js'

const route = useRoute()

const course = computed(() => getCourseById(route.params.courseId))
const lessonTitle = computed(() => {
  if (!course.value?.currentLesson) return 'Lesson'
  return course.value.currentLesson.lessonTitle
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <template v-if="course">
      <div class="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-slate-400">
        <RouterLink :to="`/learning/${course.id}`" class="hover:text-[#111418] transition-colors flex items-center gap-1.5">
          <Icon icon="lucide:arrow-left" class="w-3 h-3" />
          {{ course.title }}
        </RouterLink>
      </div>

      <div class="aspect-video rounded-xl overflow-hidden bg-[#111418] mb-8 flex items-center justify-center relative">
        <img :src="course.thumbnail" :alt="course.title" class="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div class="relative z-10 text-center px-6">
          <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4">
            <Icon icon="lucide:play" class="w-7 h-7 text-[#111418] ml-1" />
          </div>
          <p class="text-white text-sm font-medium">Video player coming soon</p>
        </div>
      </div>

      <h1 class="text-2xl md:text-3xl font-bold text-[#111418] mb-3">{{ lessonTitle }}</h1>
      <p class="text-sm text-gray-500 mb-8">
        This lesson view is a placeholder. Full video playback, notes, and quizzes will be added in a later phase.
      </p>

      <div class="flex items-center gap-3">
        <RouterLink
          :to="`/learning/${course.id}`"
          class="inline-flex items-center gap-2 border border-[#eae8e4] px-4 py-2 rounded-md text-sm font-semibold text-[#111418] hover:bg-gray-50 transition no-underline"
        >
          Back to Course
        </RouterLink>
        <RouterLink
          to="/learning"
          class="text-sm font-semibold text-[#8b1e21] hover:underline no-underline"
        >
          Course Library
        </RouterLink>
      </div>
    </template>

    <div v-else class="text-center py-24">
      <h1 class="text-3xl font-bold text-[#111418] mb-4">Lesson Not Found</h1>
      <RouterLink to="/learning" class="text-[#8b1e21] font-semibold hover:underline">Back to Learning</RouterLink>
    </div>
  </div>
</template>

