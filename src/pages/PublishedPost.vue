<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getPublishedById } from '../data/writing.js'
import ArticleBody from '../components/article/ArticleBody.vue'

const route = useRoute()
const post = computed(() => getPublishedById(route.params.id))
const isLiked = ref(false)
const likeCount = ref(post.value?.claps ?? 0)
const shareMessage = ref('')

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const handleShare = async () => {
  if (!post.value) return
  const shareUrl = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: post.value.title, url: shareUrl })
      return
    }
    await navigator.clipboard.writeText(shareUrl)
    shareMessage.value = 'Link copied'
    setTimeout(() => { shareMessage.value = '' }, 2000)
  } catch (error) {
    if (error.name === 'AbortError') return
    shareMessage.value = 'Could not share link'
    setTimeout(() => { shareMessage.value = '' }, 2000)
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <template v-if="post">
      <!-- Breadcrumb -->
      <div class="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-slate-400">
        <RouterLink
          to="/my-writing?tab=Published"
          class="hover:text-[#111418] transition-colors flex items-center gap-1.5"
        >
          <Icon icon="lucide:arrow-left" class="w-3 h-3" />
          Published
        </RouterLink>
        <span class="text-slate-300">/</span>
        <span class="text-[#8b1e21] font-semibold">{{ post.title }}</span>
      </div>

      <!-- Article header -->
      <header class="mb-8">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <span class="px-2.5 py-1 text-[9px] uppercase tracking-[2px] font-bold bg-[#8b1e21]/10 text-[#8b1e21] border border-[#8b1e21]/20">
            Your Article
          </span>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:calendar" class="w-3 h-3" />
            {{ post.datePublished }}
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:clock" class="w-3 h-3" />
            {{ post.readTime }} min read
          </div>
        </div>

        <h1 class="text-3xl md:text-4xl font-extrabold text-[#111418] leading-tight mb-6">
          {{ post.title }}
        </h1>

        <!-- Engagement bar: top -->
        <div class="flex items-center justify-between border-y border-[#eae8e4] py-3 mb-10">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
              :class="isLiked ? 'text-[#8b1e21]' : 'text-slate-400 hover:text-[#111418]'"
              @click="toggleLike"
            >
              <Icon :icon="isLiked ? 'lucide:heart' : 'lucide:heart'" :fill="isLiked ? 'currentColor' : 'none'" class="w-4 h-4" />
              {{ likeCount }}
            </button>
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Icon icon="lucide:eye" class="w-4 h-4" />
              {{ post.views?.toLocaleString() ?? 0 }}
            </div>
          </div>
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] font-semibold text-slate-400 hover:text-[#111418] transition-colors"
              @click="handleShare"
            >
              <Icon icon="lucide:share-2" class="w-3.5 h-3.5" />
              Share
            </button>
            <span
              v-if="shareMessage"
              class="absolute right-0 top-full mt-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-[#8b1e21] whitespace-nowrap"
            >
              {{ shareMessage }}
            </span>
          </div>
        </div>
      </header>

      <!-- Cover image -->
      <div v-if="post.coverImage" class="aspect-[16/9] overflow-hidden bg-[#eae8e4] rounded-lg mb-10">
        <img :src="post.coverImage" :alt="post.title" class="h-full w-full object-cover" />
      </div>

      <!-- Article body -->
      <article>
        <ArticleBody :html="post.body" />

        <!-- Tags -->
        <div v-if="post.tags?.length" class="mt-12 pt-8 border-t border-[#eae8e4] flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-[2px] text-slate-400 mr-2">
            <Icon icon="lucide:tag" class="w-3 h-3" />
            Tags
          </div>
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-3 py-1 text-[10px] uppercase tracking-[1.5px] font-semibold border border-[#eae8e4] text-slate-500 hover:border-[#111418]/30 hover:text-[#111418] transition-colors cursor-pointer rounded-full"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Engagement bar: bottom -->
        <div class="mt-8 flex items-center justify-between border-y border-[#eae8e4] py-3">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
              :class="isLiked ? 'text-[#8b1e21]' : 'text-slate-400 hover:text-[#111418]'"
              @click="toggleLike"
            >
              <Icon icon="lucide:heart" :fill="isLiked ? 'currentColor' : 'none'" class="w-4 h-4" />
              {{ isLiked ? 'Liked' : 'Like' }} · {{ likeCount }}
            </button>
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Icon icon="lucide:eye" class="w-4 h-4" />
              {{ post.views?.toLocaleString() ?? 0 }} views
            </div>
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] font-semibold text-slate-400 hover:text-[#111418] transition-colors"
            @click="handleShare"
          >
            <Icon icon="lucide:share-2" class="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </article>
    </template>

    <div v-else class="text-center py-24">
      <h1 class="text-3xl font-bold text-[#111418] mb-4">Article Not Found</h1>
      <RouterLink to="/my-writing" class="text-[#8b1e21] font-semibold hover:underline">Back to My Writing</RouterLink>
    </div>
  </div>
</template>