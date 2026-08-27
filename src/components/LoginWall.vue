<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const wallOpen = inject('wallOpen')
const wallIntent = inject('wallIntent')
const closeWall = inject('closeWall')

const router = useRouter()

const mainSiteUrl = (import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

const content = computed(() => {
  const intent = wallIntent?.value || {}
  const map = {
    article: {
      eyebrow: 'Member-only content',
      title: 'This article is for Guild members',
      body: 'Join The Guild to read the full article, follow the writer, and join the conversation.',
    },
    comment: {
      eyebrow: 'Join the conversation',
      title: 'Members discuss every article',
      body: "Log in to leave a comment, or join The Guild to add your voice to Nigeria's speechwriters.",
    },
    like: {
      eyebrow: 'Show some love',
      title: 'Claps and reactions are for members',
      body: 'Log in to clap for this article, or join The Guild to start sharing your reactions.',
    },
    save: {
      eyebrow: 'Read it later',
      title: 'Save articles as a member',
      body: 'Join The Guild to build your own reading list of articles and speeches.',
    },
    follow: {
      eyebrow: 'Stay in the loop',
      title: 'Follow writers in The Guild',
      body: 'Log in to follow your favourite speechwriters, or join The Guild to build your following list.',
    },
    write: {
      eyebrow: 'Publish your voice',
      title: 'Your speechwriting deserves a stage',
      body: 'Join The Guild to publish articles, speeches, and essays read by members nationwide.',
    },
  }
  return map[intent.kind] || {
    eyebrow: 'Just for members',
    title: 'This is member-only content',
    body: 'Join The Guild, the home of Nigerian speechwriting, to unlock everything members share.',
  }
})

function goLogin() {
  const redirect = router.currentRoute.value.fullPath
  closeWall()
  router.push({ name: 'Login', query: redirect && redirect !== '/' ? { redirect } : {} })
}

function goJoin() {
  closeWall()
  window.open(mainSiteUrl + '/membership', '_blank', 'noopener')
}
</script>

<template>
  <div
    v-if="wallOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-[#111418]/70 backdrop-blur-sm p-4"
    @click.self="closeWall"
  >
    <div
      class="w-full max-w-md bg-[#111418] text-white shadow-2xl border border-white/10 relative p-8 md:p-10 text-center max-h-[calc(100dvh-2rem)] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-1"
        aria-label="Close"
        @click="closeWall"
      >
        <Icon icon="lucide:x" width="20" height="20" />
      </button>

      <span class="block text-[10px] uppercase tracking-[3px] text-[#d86d70] font-bold mb-3">
        {{ content.eyebrow }}
      </span>
      <h2 class="font-serif text-2xl md:text-3xl text-white mb-3 leading-tight">
        {{ content.title }}
      </h2>
      <p class="text-sm text-white/70 leading-relaxed mb-8">
        {{ content.body }}
      </p>

      <div class="space-y-3">
        <button
          type="button"
          class="w-full px-6 py-3 bg-white text-[#111418] text-xs font-bold uppercase tracking-[1.5px] hover:bg-[#f0ece6] transition-colors"
          @click="goLogin"
        >
          Log in - I'm a member
        </button>
        <button
          type="button"
          class="w-full px-6 py-3 border border-white/30 text-white text-xs font-bold uppercase tracking-[1.5px] hover:bg-white/10 transition-colors"
          @click="goJoin"
        >
          Join the Guild
        </button>
        <button
          type="button"
          class="w-full py-2 text-[11px] uppercase tracking-wide text-white/50 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-0"
          @click="closeWall"
        >
          Continue browsing
        </button>
      </div>
    </div>
  </div>
</template>