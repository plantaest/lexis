<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="detail">
    <div class="detail__name">{{ name }}</div>
    <div class="detail__value">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: var(--background-color-neutral);
  border-radius: 2px;
}

.detail__name {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
}
</style>
