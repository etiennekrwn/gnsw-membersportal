<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { globalSearch, hasSearchResults } from '../data/search.js'

const route = useRoute()

const query = computed(() => String(route.query.q ?? '').trim())
const results = computed(() => globalSearch(query.value))
const hasResults = computed(() => hasSearchResults(results.value))
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <h1 class="font-['Playfair_Display'] text-3xl font-extrabold text-[#111418] mb-2">Search</h1>
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
      <section v-if="results.articles.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Articles</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="article in results.articles"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ article.title }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ article.excerpt }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="results.courses.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Courses</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="course in results.courses"
            :key="course.id"
            :to="`/learning/${course.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ course.title }}</p>
            <p class="text-xs text-gray-500">{{ course.instructor }} · {{ course.category }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="results.events.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Events</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="event in results.events"
            :key="event.id"
            :to="`/events/${event.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ event.title }}</p>
            <p class="text-xs text-gray-500">{{ event.date }} · {{ event.city }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="results.drafts.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Your Drafts</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="draft in results.drafts"
            :key="draft.id"
            :to="`/my-writing/${draft.id}`"
            class="block border border-[#eae8e4] rounded-lg p-4 hover:border-gray-300 transition no-underline bg-white"
          >
            <p class="text-sm font-semibold text-[#111418] mb-1">{{ draft.title }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ draft.excerpt }}</p>
          </RouterLink>
        </div>
      </section>

      <section v-if="results.published.length">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[#111418] mb-4">Your Published Work</h2>
        <div class="space-y-3">
          <RouterLink
            v-for="post in results.published"
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
