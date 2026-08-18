<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getArticleById, getRelatedArticles, mockArticles } from '../data/mockArticles.js'
import ArticleBody from '../components/article/ArticleBody.vue'

const route = useRoute()
const shareMessage = ref("")

// Current article
const post = computed(() => getArticleById(route.params.id))

// Related articles
const relatedPosts = computed(() => getRelatedArticles(route.params.id, 3))

// Like state
const isLiked = ref(false)
const likeCount = ref(post.value?.likes ?? 42)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

// View count (mock, static per load)
const viewCount = computed(() => post.value?.views ?? 1204)

// Share action
const handleShare = async () => {
  if (!post.value) return;

  const shareUrl = window.location.href;
  const shareData = {
    title: post.value.title,
    text: post.value.excerpt,
    url: shareUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    shareMessage.value = "Link copied";
    setTimeout(() => {
      shareMessage.value = "";
    }, 2000);
  } catch (error) {
    if (error.name === "AbortError") return;

    shareMessage.value = "Could not share link";
    setTimeout(() => {
      shareMessage.value = "";
    }, 2000);
  }
};

// Comments
const commentDraft = ref("")
const comments = ref([
  {
    id: 1,
    author: "Ngozi Adeyemi",
    initials: "NA",
    date: "2 days ago",
    text: "This is exactly the framework I needed before my keynote next month. The section on pacing landed hardest for me.",
    likes: 6,
  },
  {
    id: 2,
    author: "Tunde Bakare",
    initials: "TB",
    date: "1 day ago",
    text: "Solid breakdown. I'd add that rehearsal out loud, not just in your head, changes how these techniques actually land.",
    likes: 3,
  },
])

const commentCount = computed(() => comments.value.length)

const submitComment = () => {
  const text = commentDraft.value.trim()
  if (!text) return

  comments.value.unshift({
    id: Date.now(),
    author: "You",
    initials: "YO",
    date: "Just now",
    text,
    likes: 0,
  })
  commentDraft.value = ""
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <template v-if="post">
      <!-- Breadcrumb -->
      <div class="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-slate-400">
        <RouterLink
          to="/"
          class="hover:text-[#111418] transition-colors flex items-center gap-1.5"
        >
          <Icon icon="lucide:arrow-left" class="w-3 h-3" />
          Home
        </RouterLink>
        <span class="text-slate-300">/</span>
        <span class="text-[#8b1e21] font-semibold">{{ post.category }}</span>
      </div>

      <!-- Article header -->
      <header class="mb-8">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <span class="px-2.5 py-1 text-[9px] uppercase tracking-[2px] font-bold bg-[#8b1e21]/10 text-[#8b1e21] border border-[#8b1e21]/20">
            {{ post.category }}
          </span>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:calendar" class="w-3 h-3" />
            {{ post.date }}
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon icon="lucide:clock" class="w-3 h-3" />
            {{ post.readTime }} min read
          </div>
        </div>

        <h1 class="text-3xl md:text-4xl font-extrabold text-[#111418] leading-tight mb-6">
          {{ post.title }}
        </h1>

        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#111418] flex items-center justify-center shrink-0 rounded-full">
            <span class="text-white text-xs font-bold">{{ post.author.initials }}</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-[#111418]">
              {{ post.author.name }}
              <span class="text-[#8b1e21] text-xs font-bold ml-1">
                {{ post.author.credential }}
              </span>
            </p>
            <p class="text-[11px] text-slate-400">{{ post.author.role }}</p>
          </div>
        </div>

        <!-- Engagement bar: top -->
        <div class="flex items-center justify-between border-y border-[#eae8e4] py-3">
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
              {{ viewCount.toLocaleString() }}
            </div>
            <a
              href="#comments"
              class="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-[#111418] transition-colors"
            >
              <Icon icon="lucide:message-circle" class="w-4 h-4" />
              {{ commentCount }}
            </a>
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

      <!-- Featured image -->
      <div class="aspect-[16/9] overflow-hidden bg-[#eae8e4] rounded-lg mb-10">
        <img
          :src="post.image"
          :alt="post.title"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- Article body -->
      <article>
        <ArticleBody :blocks="post.body" />

        <!-- Tags -->
        <div class="mt-12 pt-8 border-t border-[#eae8e4] flex flex-wrap items-center gap-2">
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
              {{ viewCount.toLocaleString() }} views
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

        <!-- Author Bio -->
        <div class="mt-10 p-6 border border-[#eae8e4] bg-[#faf9f5] flex gap-5 rounded-lg">
          <div class="w-14 h-14 bg-[#111418] flex items-center justify-center shrink-0 rounded-full">
            <span class="text-white text-sm font-bold">{{ post.author.initials }}</span>
          </div>
          <div>
            <p class="text-sm font-bold text-[#111418] mb-0.5">
              {{ post.author.name }}
              <span class="text-[#8b1e21] text-xs font-bold ml-1">
                {{ post.author.credential }}
              </span>
            </p>
            <p class="text-[11px] text-[#8b1e21] uppercase tracking-[1.5px] font-semibold mb-3">
              {{ post.author.role }}
            </p>
            <p class="text-sm text-slate-500 leading-relaxed">
              {{ post.author.bio }}
            </p>
          </div>
        </div>
      </article>

      <!-- Comments -->
      <section id="comments" class="mt-14 pt-10 border-t border-[#eae8e4]">
        <h2 class="text-lg font-bold text-[#111418] mb-6">
          Comments <span class="text-slate-400 font-semibold">({{ commentCount }})</span>
        </h2>

        <!-- Comment form -->
        <div class="flex gap-4 mb-10">
          <div class="w-9 h-9 bg-[#111418] flex items-center justify-center shrink-0 rounded-full">
            <span class="text-white text-[10px] font-bold">YO</span>
          </div>
          <div class="flex-1">
            <textarea
              v-model="commentDraft"
              rows="3"
              class="w-full text-sm text-[#111418] border border-[#eae8e4] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#8b1e21]/40 transition-colors"
            />
            <div class="mt-2 flex justify-end">
              <button
                type="button"
                :disabled="!commentDraft.trim()"
                class="px-4 py-2 text-[10px] uppercase tracking-[1.5px] font-bold bg-[#111418] text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8b1e21] transition-colors"
                @click="submitComment"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>

        <!-- Comment list -->
        <div class="space-y-6">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="flex gap-4"
          >
            <div class="w-9 h-9 bg-[#eae8e4] flex items-center justify-center shrink-0 rounded-full">
              <span class="text-[#111418] text-[10px] font-bold">{{ comment.initials }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-semibold text-[#111418]">{{ comment.author }}</span>
                <span class="text-[10px] text-slate-400">{{ comment.date }}</span>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed mb-2">{{ comment.text }}</p>
              <button
                type="button"
                class="flex items-center gap-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-slate-400 hover:text-[#8b1e21] transition-colors"
              >
                <Icon icon="lucide:heart" class="w-3 h-3" />
                {{ comment.likes }}
              </button>
            </div>
          </div>

          <p v-if="!comments.length" class="text-sm text-slate-400 text-center py-8">
            Be the first to comment.
          </p>
        </div>
      </section>

      <!-- Related Articles -->
      <section class="mt-16 pt-10 border-t border-[#eae8e4]">
        <div class="mb-8">
          <span class="text-[10px] uppercase tracking-[3px] text-[#8b1e21] font-bold block mb-1">
            Continue Reading
          </span>
          <h2 class="text-2xl font-bold text-[#111418]">
            Related Articles
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RouterLink
            v-for="item in relatedPosts"
            :key="item.id"
            :to="`/article/${item.id}`"
            class="group flex flex-col cursor-pointer"
          >
            <div class="relative overflow-hidden aspect-[4/3] mb-4 bg-gray-100 rounded-lg">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-[9px] uppercase tracking-[2px] font-bold text-[#8b1e21]">
                {{ item.category }}
              </span>
              <span class="text-slate-300 text-[10px]">.</span>
              <span class="text-[10px] text-slate-400">{{ item.readTime }} min</span>
            </div>
            <h3 class="text-lg font-bold text-[#111418] leading-snug mb-2 group-hover:text-[#8b1e21] transition-colors duration-200">
              {{ item.title }}
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed flex-grow line-clamp-2">
              {{ item.excerpt }}
            </p>
          </RouterLink>
        </div>
      </section>

    </template>

    <div v-else class="text-center py-24">
      <h1 class="text-3xl font-bold text-[#111418] mb-4">Article Not Found</h1>
      <RouterLink to="/" class="text-[#8b1e21] font-semibold hover:underline">Return Home</RouterLink>
    </div>
  </div>
</template>