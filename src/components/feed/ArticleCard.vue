<script setup>
defineProps({
  article: { type: Object, required: true },
})
</script>

<template>
  <article class="flex items-start justify-between gap-6 py-8 border-b border-[#eae8e4] cursor-pointer group">

    <!-- Left: text content -->
    <div class="flex-1 min-w-0">

      <!-- Author row -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-6 h-6 rounded-full bg-[#111418] flex items-center justify-center shrink-0">
          <span class="text-white text-[9px] font-semibold">{{ article.author.initials }}</span>
        </div>
        <span class="text-xs text-gray-600">{{ article.author.name }}</span>
      </div>

      <!-- Title -->
      <h2 class="font-['Playfair_Display'] text-lg font-bold text-[#111418] leading-snug mb-2 group-hover:text-[#8b1e21] transition-colors line-clamp-2">
        {{ article.title }}
      </h2>

      <!-- Excerpt -->
      <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {{ article.excerpt }}
      </p>

      <!-- Meta row -->
      <div class="flex items-center gap-4 text-xs text-gray-400">
        <span>{{ article.date }}</span>
        <span>{{ article.readTime }} min read</span>
        <span class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          {{ article.claps }}
        </span>
        <span class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {{ article.comments }}
        </span>
      </div>

    </div>

    <!-- Right: thumbnail -->
    <div class="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden bg-gray-100">
      <img
        :src="article.thumbnail"
        :alt="article.title"
        class="w-full h-full object-cover"
      />
    </div>

  </article>
</template>