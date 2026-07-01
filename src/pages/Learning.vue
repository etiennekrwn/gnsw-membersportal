<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import {
  getCourseCategories,
  getInProgressCourse,
  filterCourses,
  getContinueLessonRoute,
  isCourseLocked,
} from '../data/courses.js'

const router = useRouter()
const currentUser = inject('currentUser')

const searchQuery = ref('')
const activeCategory = ref('All')
const showFilters = ref(false)

const categories = computed(() => ['All', ...getCourseCategories()])
const resumeCourse = computed(() => getInProgressCourse())

const filteredCourses = computed(() =>
  filterCourses({ query: searchQuery.value, category: activeCategory.value })
)

function goToCourse(courseId) {
  router.push(`/learning/${courseId}`)
}

function continueCourse() {
  if (!resumeCourse.value) return
  router.push(getContinueLessonRoute(resumeCourse.value))
}

function setCategory(category) {
  activeCategory.value = category
  showFilters.value = false
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-[#111418] mb-2">Learning</h1>
        <p class="text-gray-500 text-sm">Expand your skills with specialized courses and masterclasses.</p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative w-full md:w-64">
          <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-[#eae8e4] rounded-md focus:outline-none focus:border-[#8b1e21] focus:ring-1 focus:ring-[#8b1e21] transition bg-white"
          />
        </div>
        <div class="relative shrink-0">
          <button
            type="button"
            class="p-2 border border-[#eae8e4] rounded-md text-gray-500 hover:text-[#111418] hover:bg-gray-50 transition bg-white"
            aria-label="Filter by category"
            @click="showFilters = !showFilters"
          >
            <Icon icon="lucide:sliders-horizontal" class="w-4 h-4" />
          </button>
          <div
            v-if="showFilters"
            class="absolute right-0 top-full mt-2 w-48 bg-white border border-[#eae8e4] rounded-lg shadow-lg z-10 py-1"
          >
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="w-full text-left px-4 py-2 text-sm hover:bg-[#faf9f5] transition"
              :class="activeCategory === cat ? 'text-[#8b1e21] font-semibold' : 'text-gray-600'"
              @click="setCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resume Learning -->
    <div
      v-if="resumeCourse"
      class="mb-12 bg-[#111418] rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row"
    >
      <div class="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
        <span class="text-[#8b1e21] text-[10px] font-bold uppercase tracking-[2px] mb-3 block">Resume Learning</span>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          {{ resumeCourse.title }}
        </h2>
        <p v-if="resumeCourse.currentLesson" class="text-gray-400 text-sm mb-6 leading-relaxed">
          Continue your journey. {{ resumeCourse.currentLesson.moduleTitle }}: {{ resumeCourse.currentLesson.lessonTitle }} awaits.
        </p>
        <p v-else class="text-gray-400 text-sm mb-6 leading-relaxed">{{ resumeCourse.description }}</p>

        <div class="mb-6">
          <div class="flex justify-between text-xs text-white mb-2 font-medium">
            <span>Progress</span>
            <span>{{ resumeCourse.progress }}%</span>
          </div>
          <div class="h-2 w-full bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-[#8b1e21] rounded-full" :style="{ width: `${resumeCourse.progress}%` }"></div>
          </div>
        </div>

        <button
          type="button"
          class="bg-white text-[#111418] px-6 py-2.5 rounded-md text-sm font-semibold w-fit hover:bg-gray-100 transition flex items-center gap-2"
          @click="continueCourse"
        >
          <Icon icon="lucide:play" class="w-4 h-4" />
          Continue Course
        </button>
      </div>
      <div class="md:w-1/2 min-h-[250px] relative">
        <img :src="resumeCourse.thumbnail" :alt="resumeCourse.title" class="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>

    <!-- Course Library -->
    <div>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-[#111418]">
          Course Library
          <span v-if="activeCategory !== 'All'" class="text-sm font-normal text-gray-400 ml-2">{{ activeCategory }}</span>
        </h3>
        <button
          v-if="activeCategory !== 'All' || searchQuery"
          type="button"
          class="text-[#8b1e21] text-xs font-semibold uppercase tracking-wider hover:underline"
          @click="searchQuery = ''; activeCategory = 'All'"
        >
          Clear filters
        </button>
      </div>

      <EmptyState
        v-if="filteredCourses.length === 0"
        icon="lucide:book-open"
        title="No courses match your search"
        description="Try a different keyword or category, or clear your filters to see the full library."
      >
        <button
          type="button"
          class="text-sm font-semibold text-[#8b1e21] hover:underline"
          @click="searchQuery = ''; activeCategory = 'All'"
        >
          View all courses
        </button>
      </EmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="border border-[#eae8e4] rounded-lg overflow-hidden bg-white hover:shadow-md transition group cursor-pointer flex flex-col"
          @click="goToCourse(course.id)"
        >
          <div class="h-44 relative overflow-hidden bg-gray-100">
            <img :src="course.thumbnail" :alt="course.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#111418] shadow-sm uppercase tracking-wider">
              {{ course.category }}
            </div>
            <div
              v-if="isCourseLocked(currentUser?.tier, course)"
              class="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <span class="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Icon icon="lucide:lock" class="w-3 h-3" />
                Locked
              </span>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col">
            <h4 class="text-lg font-bold text-[#111418] mb-2 leading-snug group-hover:text-[#8b1e21] transition line-clamp-2">
              {{ course.title }}
            </h4>
            <p class="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
              <Icon icon="lucide:user" class="w-3.5 h-3.5" />
              {{ course.instructor }}
            </p>

            <div class="mt-auto">
              <div class="flex items-center justify-between text-xs text-gray-400 font-medium mb-3 pt-4 border-t border-[#eae8e4]">
                <span class="flex items-center gap-1.5"><Icon icon="lucide:clock" class="w-3.5 h-3.5"/> {{ course.duration }}</span>
                <span class="flex items-center gap-1.5"><Icon icon="lucide:layers" class="w-3.5 h-3.5"/> {{ course.modules }} modules</span>
              </div>

              <div class="w-full flex items-center gap-3">
                <div class="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-[#8b1e21] rounded-full" :style="{ width: `${course.progress}%` }"></div>
                </div>
                <span class="text-[10px] font-bold text-gray-500 w-6 text-right">{{ course.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

