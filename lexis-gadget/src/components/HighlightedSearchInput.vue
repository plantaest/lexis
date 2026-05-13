<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';

export type HighlightPart = {
  start: number;
  end: number;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    highlights?: HighlightPart[];
    rows?: number;
    placeholder?: string;
    maxlength?: number;
  }>(),
  {
    highlights: () => [],
    rows: 2,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'ctrl-enter': [];
}>();

const textareaRef = useTemplateRef<HTMLTextAreaElement>('textarea');
const backdropRef = useTemplateRef<HTMLDivElement>('backdrop');

const escapeHtml = (text: string): string => {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

/**
 * Merge overlapping highlights:
 *
 * [0, 5]
 * [3, 8]
 *
 * =>
 *
 * [0, 8]
 */
const mergedHighlights = computed<HighlightPart[]>(() => {
  const sorted = [...props.highlights].sort((a, b) => a.start - b.start);
  const merged: HighlightPart[] = [];

  for (const item of sorted) {
    const last = merged.at(-1);

    if (!last) {
      merged.push({ ...item });
      continue;
    }

    if (item.start <= last.end) {
      last.end = Math.max(last.end, item.end);
      continue;
    }

    merged.push({ ...item });
  }

  return merged;
});

const highlightedHtml = computed(() => {
  const text = props.modelValue;

  if (!text) {
    return '';
  }

  let html = '';
  let currentIndex = 0;

  for (const highlight of mergedHighlights.value) {
    html += escapeHtml(text.slice(currentIndex, highlight.start));
    html += `<mark>${escapeHtml(text.slice(highlight.start, highlight.end))}</mark>`;
    currentIndex = highlight.end;
  }

  html += escapeHtml(text.slice(currentIndex));

  /**
   * Important:
   * preserve empty last line
   */
  html += '\u200b';

  return html;
});

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

const syncScroll = () => {
  const textarea = textareaRef.value;
  const backdrop = backdropRef.value;

  if (!textarea || !backdrop) {
    return;
  }

  backdrop.scrollTop = textarea.scrollTop;
  backdrop.scrollLeft = textarea.scrollLeft;
};

const onKeydown = (event: KeyboardEvent): void => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    emit('ctrl-enter');
  }
};
</script>

<template>
  <div class="highlighted-search-input">
    <div ref="backdrop" class="backdrop" aria-hidden="true">
      <div class="highlights" v-html="highlightedHtml" />
    </div>

    <textarea
      ref="textarea"
      class="textarea"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      spellcheck="false"
      @input="onInput"
      @scroll="syncScroll"
      @keydown="onKeydown"
    />
  </div>
</template>

<style scoped>
.highlighted-search-input {
  position: relative;
  width: 100%;
}

.backdrop,
.textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 4px 8px;
  border-radius: 2px;
  font: inherit;
  line-height: 1.375rem;
  letter-spacing: inherit;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid var(--border-color-subtle);
}

.backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  color: transparent;
  background-color: var(--background-color-neutral-subtle);
}

.highlights {
  min-height: 100%;
}

.highlights :deep(mark) {
  padding: 2px 0;
  border-radius: 2px;
  background-color: light-dark(#ffcf4f, #735421); /* yellow 200/800 */
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  color: transparent;
}

.textarea {
  position: relative;
  z-index: 2;
  resize: vertical;
  background: transparent;
}

.textarea::placeholder {
  color: var(--color-placeholder);
}

.textarea:focus {
  outline: 2px solid var(--border-color-progressive--focus, #36c);
  outline-offset: -2px;
}
</style>
