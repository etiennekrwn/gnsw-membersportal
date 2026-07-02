<script setup>
/**
 * ArticleBody.vue
 * Renders article body content with consistent styling matching the draft editor.
 * Accepts either structured blocks (from mockArticles) or HTML (from Tiptap editor).
 */
defineProps({
  blocks: {
    type: Array,
    default: null,
  },
  html: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="article-body">
    <!-- Structured blocks mode (Article.vue style) -->
    <template v-if="blocks">
      <template v-for="(block, index) in blocks" :key="index">
        <p
          v-if="block.type === 'paragraph'"
          class="article-paragraph"
        >
          {{ block.text }}
        </p>

        <blockquote
          v-else-if="block.type === 'pullquote'"
          class="article-blockquote"
        >
          <p class="article-blockquote-text">
            {{ block.text }}
          </p>
        </blockquote>

        <h2
          v-else-if="block.type === 'heading'"
          class="article-heading-2"
        >
          {{ block.text }}
        </h2>
      </template>
    </template>

    <!-- HTML mode (Tiptap editor output) -->
    <div
      v-else-if="html"
      class="article-html"
      v-html="html"
    />
  </div>
</template>

<style scoped>
/* Shared font for all article content — matches draft editor */
.article-body {
  font-family: 'Source Serif 4', Georgia, serif;
}

/* --- Structured blocks styles --- */

.article-paragraph {
  font-size: 16px;
  color: #374151;
  line-height: 1.75;
  margin-bottom: 1.5rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-blockquote {
  border-left: 4px solid #8b1e21;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin: 1rem 0;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-blockquote-text {
  font-size: 16px;
  line-height: 1.75;
  color: #6b7280;
  margin: 0;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-heading-2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111418;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

/* --- HTML mode styles — match the structured blocks exactly --- */

.article-html {
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(p) {
  font-size: 16px;
  color: #374151;
  line-height: 1.75;
  margin-bottom: 1.5rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(blockquote) {
  border-left: 4px solid #8b1e21;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin: 1rem 0;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(blockquote p) {
  font-size: 16px;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111418;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111418;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 16px;
  line-height: 1.75;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 16px;
  line-height: 1.75;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(li) {
  margin-bottom: 0.25rem;
  font-family: 'Source Serif 4', Georgia, serif;
}

.article-html :deep(code) {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
  color: #8b1e21;
}

.article-html :deep(pre) {
  background: #111827;
  color: #f3f4f6;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
}

.article-html :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.article-html :deep(a) {
  color: #8b1e21;
  text-decoration: underline;
}

.article-html :deep(mark) {
  background: #fef9c3;
  padding: 0 0.125rem;
}

.article-html :deep(hr) {
  border: none;
  border-top: 1px solid #eae8e4;
  margin: 2rem 0;
}

.article-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.article-html :deep(td),
.article-html :deep(th) {
  border: 1px solid #eae8e4;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.article-html :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  text-align: left;
}

.article-html :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 0.25rem;
}
</style>