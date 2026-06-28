<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import {
  getCourseById,
  isCourseLocked,
  getContinueLessonRoute,
} from '../data/courses.js'

const route = useRoute()
const currentUser = inject('currentUser')

const course = computed(() => getCourseById(route.params.courseId))
const locked = computed(() =>
  course.value ? isCourseLocked(currentUser.value?.tier, course.value) : false
)
const continueRoute = computed(() =>
  course.value ? getContinueLessonRoute(course.value) : '/learning'
)
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <template v-if="course">
      <div class="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-slate-400">
        <RouterLink to="/learning" class="hover:text-[#111418] transition-colors flex items-center gap-1.5">
          <Icon icon="lucide:arrow-left" class="w-3 h-3" />
          Learning
        </RouterLink>
        <span class="text-slate-300">/</span>
        <span class="text-[#8b1e21] font-semibold">{{ course.category }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div class="lg:col-span-3">
          <div class="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-8">
            <img :src="course.thumbnail" :alt="course.title" class="w-full h-full object-cover" />
          </div>

          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {{ course.level }}
            </span>
            <span class="text-xs text-gray-400">{{ course.duration }}</span>
            <span class="text-xs text-gray-400">{{ course.modules }} modules · {{ course.lessons }} lessons</span>
          </div>

          <h1 class="font-source-serif text-3xl md:text-4xl font-extrabold text-[#111418] mb-4 leading-tight">
            {{ course.title }}
          </h1>
          <p class="text-sm text-gray-500 mb-2">Instructor: {{ course.instructor }}</p>
          <p class="text-[15px] text-gray-700 leading-relaxed mb-8">{{ course.description }}</p>

          <div v-if="locked" class="p-5 border border-[#eae8e4] rounded-lg bg-[#faf9f5] flex items-start gap-4">
            <Icon icon="lucide:lock" class="w-5 h-5 text-[#8b1e21] shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-[#111418] mb-1">Membership required</p>
              <p class="text-sm text-gray-500">This course requires a higher membership tier to enroll and continue.</p>
            </div>
          </div>

          <div v-else class="flex flex-wrap items-center gap-4">
            <RouterLink
              :to="continueRoute"
              class="inline-flex items-center gap-2 bg-[#111418] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#2a3038] transition no-underline"
            >
              <Icon icon="lucide:play" class="w-4 h-4" />
              {{ course.progress > 0 ? 'Continue Course' : 'Start Course' }}
            </RouterLink>
            <div v-if="course.progress > 0" class="flex items-center gap-3 text-sm text-gray-500">
              <div class="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#8b1e21] rounded-full" :style="{ width: `${course.progress}%` }"></div>
              </div>
              <span class="font-medium">{{ course.progress }}% complete</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-5">Course Modules</h2>
          <div class="border border-[#eae8e4] rounded-lg divide-y divide-[#eae8e4] bg-white">
            <div
              v-for="(mod, index) in course.moduleList"
              :key="mod.id"
              class="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p class="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Module {{ index + 1 }}</p>
                <p class="text-sm font-medium text-[#111418]">{{ mod.title }}</p>
              </div>
              <span class="text-xs text-gray-400">{{ mod.lessonCount }} lessons</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-24">
      <h1 class="font-source-serif text-3xl font-bold text-[#111418] mb-4">Course Not Found</h1>
      <RouterLink to="/learning" class="text-[#8b1e21] font-semibold hover:underline">Back to Learning</RouterLink>
    </div>
  </div>
</template>

