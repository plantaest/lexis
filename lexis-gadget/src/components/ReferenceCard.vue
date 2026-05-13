<script setup lang="ts">
import { highlightParts } from '@/utils/highlightParts.ts';

defineProps<{
  id: string;
  content: string;
  keyword: string;
}>();
</script>

<template>
  <button class="card">
    <span class="card__id">
      <span class="card__id-name">ID</span>
      <span class="font-bold font-mono">
        <template v-for="(part, i) in highlightParts(id, keyword)" :key="i">
          <mark v-if="part.match">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </span>
    </span>
    <span class="card__content">
      <template v-for="(part, i) in highlightParts(content, keyword)" :key="i">
        <mark v-if="part.match">{{ part.text }}</mark>
        <span v-else>{{ part.text }}</span>
      </template>
    </span>
  </button>
</template>

<style scoped>
.card {
  background-color: var(--background-color-base);
  border: 1px solid var(--border-color-base);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 2px;
  padding-block: 0.5rem;
  padding-inline: 0.625rem;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: light-dark(var(--color-gray-100), var(--color-gray-900));
    border-color: var(--border-color-interactive--hover);
  }
}

.card__id {
  font-size: var(--font-size-x-small);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card__id-name {
  color: var(--color-placeholder);
}

.card__content {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
