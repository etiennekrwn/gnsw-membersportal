<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import {
  isArticleSaved,
  toggleSaveArticle,
  toggleMuteAuthor,
  toggleFollowAuthor,
  isAuthorMuted,
  isAuthorFollowed,
} from '../../data/feedActions.js'

const props = defineProps({
  article: { type: Object, required: true },
})

const router = useRouter()
const saved = ref(isArticleSaved(props.article.id))
const muted = ref(isAuthorMuted(props.article.author.name))
const followed = ref(isAuthorFollowed(props.article.author.name))
const actionMessage = ref('')
const feedDate = computed(() => {
  const date = new Date(props.article.date)

  if (Number.isNaN(date.getTime())) {
    return props.article.date
      .replace(/,?\s*\d{4}/, '')
      .replace(/^([A-Za-z]+)\s+(\d{1,2})$/, '$2 $1')
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
})

function openArticle() {
  router.push(`/article/${props.article.id}`)
}

function flash(message) {
  actionMessage.value = message
  setTimeout(() => { actionMessage.value = '' }, 1500)
}

function onSave(event) {
  event.preventDefault()
  event.stopPropagation()
  saved.value = toggleSaveArticle(props.article.id)
  flash(saved.value ? 'Saved' : 'Removed from saved')
}

function onMute(event) {
  event.preventDefault()
  event.stopPropagation()
  muted.value = toggleMuteAuthor(props.article.author.name)
  flash(muted.value ? 'Author muted' : 'Author unmuted')
}

function onFollow(event) {
  event.preventDefault()
  event.stopPropagation()
  followed.value = toggleFollowAuthor(props.article.author.name)
  flash(followed.value ? 'Following author' : 'Unfollowed author')
}
</script>

<template>
  <article class="flex items-start justify-between gap-6 py-8 border-b border-[#eae8e4] group">

    <div class="flex-1 min-w-0 cursor-pointer" @click="openArticle">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-6 h-6 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
          <span class="text-white text-[9px] font-semibold">{{ article.author.initials }}</span>
        </div>
        <span class="text-xs text-gray-600">{{ article.author.name }}</span>
        <span v-if="followed" class="text-[9px] uppercase tracking-wider font-bold text-[#8b1e21]">Following</span>
      </div>

      <h2 class="text-xl font-bold text-[#111418] leading-snug mb-2 group-hover:text-[#8b1e21] transition-colors line-clamp-2">
        {{ article.title }}
      </h2>

      <p class="font-source-serif text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {{ article.excerpt }}
      </p>

      <div class="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-gray-400 whitespace-nowrap overflow-hidden">
        <span class="flex items-center gap-1 shrink-0">
          <Icon icon="lucide:thumbs-up" class="w-3.5 h-3.5" />
          {{ article.claps }}
        </span>
        <span class="flex items-center gap-1 shrink-0">
          <Icon icon="lucide:message-circle" class="w-3.5 h-3.5" />
          {{ article.comments }}
        </span>
        <span class="shrink-0 ">{{ feedDate }}</span>
        <span class="shrink-0">{{ article.readTime }} min read</span>
        <span v-if="actionMessage" class="text-[#8b1e21] font-semibold truncate">{{ actionMessage }}</span>
      </div>
    </div>

    <div class="flex flex-col items-end gap-3 shrink-0">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="p-2 rounded-full text-gray-400 hover:text-[#8b1e21] hover:bg-[#faf9f5] transition"
          :class="{ 'text-[#8b1e21]': saved }"
          :aria-label="saved ? 'Remove from saved' : 'Save article'"
          @click="onSave"
        >
          <Icon :icon="saved ? 'lucide:bookmark' : 'lucide:bookmark-plus'" class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-2 rounded-full text-gray-400 hover:text-[#111418] hover:bg-[#faf9f5] transition"
          :class="{ 'text-[#111418]': followed }"
          :aria-label="followed ? 'Unfollow author' : 'Follow author'"
          @click="onFollow"
        >
          <Icon :icon="followed ? 'lucide:user-check' : 'lucide:user-plus'" class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-2 rounded-full text-gray-400 hover:text-[#111418] hover:bg-[#faf9f5] transition"
          :class="{ 'text-[#111418]': muted }"
          :aria-label="muted ? 'Unmute author' : 'Mute author'"
          @click="onMute"
        >
          <Icon :icon="muted ? 'lucide:volume-x' : 'lucide:volume-2'" class="w-4 h-4" />
        </button>
      </div>

      <div
        class="w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden bg-gray-100 cursor-pointer"
        @click="openArticle"
      >
        <img :src="article.thumbnail" :alt="article.title" class="w-full h-full object-cover" />
      </div>
    </div>

  </article>
</template>

