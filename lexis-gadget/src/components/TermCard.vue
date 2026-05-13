<script setup lang="ts">
import { highlightParts } from '@/utils/highlightParts.ts';

defineProps<{
  term: string;
  aliases: string;
  targets: string;
  keyword: string;
}>();
</script>

<template>
  <button class="card">
    <span class="flex gap-2">
      <span class="font-bold">
        <template v-for="(part, i) in highlightParts(term, keyword)" :key="i">
          <mark v-if="part.match">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </span>
      <span class="card__aliases italic" v-if="aliases">
        <template v-for="(part, i) in highlightParts(aliases, keyword)" :key="i">
          <mark v-if="part.match">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </span>
    </span>
    <span class="card__targets">
      <template v-for="(part, i) in highlightParts(targets, keyword)" :key="i">
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

.card__aliases {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.card__targets {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
