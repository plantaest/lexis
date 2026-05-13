<script setup lang="ts">
import { toReadableDate } from '@/utils/toReadableDate.ts';

defineProps<{
  title: string;
  updatedAt: string;
  enabled?: boolean;
}>();
</script>

<template>
  <button class="card" :class="{ 'card--enabled': enabled }">
    <span class="card__title">{{ title }}</span>
    <span class="card__updated-at">Cập nhật lúc {{ toReadableDate(updatedAt) }}</span>
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

.card--enabled {
  background-color: var(--background-color-progressive-subtle);

  &:hover {
    background-color: light-dark(var(--color-blue-100), var(--color-blue-900));
  }
}

.card__title {
  font-size: 0.875rem;
  font-weight: bold;

  /* conflict with Content Translation */
  width: 100%;
  padding: 0;
}

.card__updated-at {
  font-size: 0.75rem;
  color: var(--color-subtle);
}
</style>
