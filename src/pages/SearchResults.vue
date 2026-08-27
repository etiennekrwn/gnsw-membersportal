<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { searchFeedArticles } from '../data/search.js'
import { filterCourses } from '../data/courses.js'
import { getEvents } from '../data/events.js'
import { searchWriting } from '../data/writing.js'

const route = useRoute()

const query = computed(() => String(route.query.q ?? '').trim())

// Live feed articles are fetched asynchronously from the server.
const feedResults = ref([])
const feedLoading = ref(false)
watch(
  query,
  async (q) => {
    feedLoading.value = true
    feedResults.value = await searchFeedArticles(q)
    feedLoading.value = false
  },
  { immediate: true }
)
const courses = computed(() => (query.value ? filterCourses({ query: query.value.toLowerCase() }) : []))
const events = computed(() =>
  query.value
    ? getEvents().filter(e =>
        e.title.toLowerCase().includes(query.value.toLowerCase()) ||
        e.city.toLowerCase().includes(query.value.toLowerCase()) ||
        e.type.toLowerCase().includes(query.value.toLowerCase())
      )
    : []
)
const localWriting = computed(() => (query.value ? searchWriting(query.value) : { drafts: [], published: [] }))
const hasResults = computed(
  () =>
    feedResults.value.length +
    courses.value.length +
    events.value.length +
    localWriting.value.drafts.length +
    localWriting.value.published.length > 0
)
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <h1 class="text-3xl font-extrabold text-[#111418] mb-2">Search</h1>
    <p v-if="query" class="text-gray-500 text-sm mb-8">
      Results for <span class="font-semibold text-[#111418]">"{{ query }}"</span>
    </p>
    <p v-else class="text-gray-500 text-sm mb-8">Enter a search term in the header to find articles, courses, events, and your writing.</p>

    <EmptyState
      v-if="query && !hasResults"
      icon="lucide:search-x"
      title="No results found"
      description="Try a different keyword or check your spelling."
    />

    <div v-else-if="hasResults" class="space-y-10">
      <section v-if="feedResults.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Articles</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="article in feedResults"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ article.title }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ article.excerpt }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="courses.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Courses</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="course in courses"
            :key="course.id"
            :to="`/learning/${course.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ course.title }}</p>
            <p class="text-xs text-gray-500">{{ course.instructor }} · {{ course.category }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="events.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Events</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="event in events"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ event.title }}</p>
            <p class="text-xs text-gray-500">{{ event.date }} · {{ event.city }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="localWriting.drafts.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Your Drafts</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="draft in localWriting.drafts"
            :key="draft.id"
            :to="`/my-writing/${draft.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ draft.title }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ draft.excerpt }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="localWriting.published.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Your Published Work</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="post in localWriting.published"
            :key="post.id"
            :to="post.articleId ? `/article/${post.articleId}` : '/my-writing'"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ post.title }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ post.excerpt }}</p>
          </RouterLink>
        </div>
      </section>
    </div>

    <EmptyState
      v-else-if="!query"
      icon="lucide:search"
      title="Search the portal"
      description="Find articles, courses, events, and your own drafts from the search bar above."
    />
  </div>
</template>

