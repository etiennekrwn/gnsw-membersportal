<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getPublishedById } from '../data/writing.js'

const route = useRoute()
const post = computed(() => getPublishedById(route.params.id))
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <template v-if="post">
      <RouterLink
        to="/my-writing?tab=Published"
        class="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-slate-400 hover:text-[#111418] transition-colors no-underline mb-8"
      >
        <Icon icon="lucide:arrow-left" class="w-3 h-3" />
        Published
      </RouterLink>

      <span class="text-[10px] uppercase tracking-[2px] font-bold text-[#8b1e21] mb-3 block">Your Article</span>
      <h1 class="font-['Playfair_Display'] text-3xl md:text-4xl font-extrabold text-[#111418] mb-4 leading-tight">
        {{ post.title }}
      </h1>

      <div class="flex items-center gap-4 text-xs text-gray-400 mb-10">
        <span>{{ post.datePublished }}</span>
        <span>{{ post.readTime }} min read</span>
        <span class="flex items-center gap-1"><Icon icon="lucide:eye" class="w-3.5 h-3.5"/> {{ post.views }} views</span>
        <span class="flex items-center gap-1"><Icon icon="lucide:heart" class="w-3.5 h-3.5"/> {{ post.claps }} claps</span>
      </div>

      <div class="prose-gnsw">
        <p
          v-for="(paragraph, index) in (post.body ?? '').split('\n\n').filter(Boolean)"
          :key="index"
          class="text-[16px] text-gray-700 leading-relaxed mb-6"
        >
          {{ paragraph }}
        </p>
      </div>
    </template>

    <div v-else class="text-center py-24">
      <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#111418] mb-4">Article Not Found</h1>
      <RouterLink to="/my-writing" class="text-[#8b1e21] font-semibold hover:underline">Back to My Writing</RouterLink>
    </div>
  </div>
</template>
