<script setup lang="ts">
import type { SearchMatch } from '@/types/SearchMatch.ts';
import { ref } from 'vue';
import { useTabNavigation } from '@/composables/useTabNavigation.ts';
import { referenceRepository } from '@/repositories/referenceRepository.ts';
import { termRepository } from '@/repositories/termRepository.ts';

const props = defineProps<{
  index: number;
  result: SearchMatch;
}>();

const nav = useTabNavigation();

const expanded = ref(false);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const onClickReferenceId = async (referenceId: string) => {
  const referenceEntity = await referenceRepository.getReference(
    props.result.term.dictionaryId,
    referenceId,
  );

  if (referenceEntity) {
    nav.push('/reference/update', { referenceEntity });
  }
};

const onClickTermLemma = async (term: string) => {
  const termEntity = await termRepository.getTerm(props.result.term.dictionaryId, term);

  if (termEntity) {
    nav.push('/term/update', { termEntity });
  }
};
</script>

<template>
  <div class="card-wrapper">
    <button class="card" @click="toggleExpanded">
      <span class="flex flex-col gap-1 min-w-0">
        <span class="font-bold"> {{ result.term.term }}</span>
        <span class="card__targets flex gap-2">
          <span
            class="card__target flex gap-1"
            v-for="(target, index) in result.term.translations.map((t) => t.target)"
            :key="index"
          >
            <span class="target__index">{{ index + 1 }}</span>
            <span class="target__translation">
              {{ target }}
            </span>
          </span>
        </span>
      </span>

      <span class="card__index">
        {{ index + 1 }}
      </span>
    </button>

    <transition name="expand">
      <div v-if="expanded" class="details flex flex-col gap-2">
        <a
          class="details__title w-fit font-bold cdx-docs-link"
          @click.prevent="onClickTermLemma(result.term.term)"
        >
          {{ result.term.term }}
        </a>

        <div class="details__item flex flex-col gap-1">
          <div class="detail__key">Từ điển</div>

          <div class="detail__value font-mono">
            <a
              class="cdx-docs-link"
              @click.prevent="
                nav.push('/dictionary/info', { dictionaryId: result.term.dictionaryId })
              "
            >
              {{ result.term.dictionaryId }}
            </a>
          </div>
        </div>

        <div class="details__item flex flex-col gap-1" v-if="result.term.aliases.length > 0">
          <div class="detail__key">Biến thể</div>

          <div class="detail__value">
            {{ result.term.aliases.join(', ') }}
          </div>
        </div>

        <div
          class="flex flex-col gap-2"
          v-for="(translation, index) in result.term.translations"
          :key="index"
        >
          <div class="divider--dotted" />

          <div class="details__item flex flex-col gap-1">
            <div class="detail__key">Bản dịch {{ index + 1 }}</div>

            <div class="detail__value font-bold">
              {{ translation.target }}
            </div>
          </div>

          <div class="details__item flex flex-col gap-1" v-if="translation.note">
            <div class="detail__key">Ghi chú</div>

            <div class="detail__value">
              {{ translation.note }}
            </div>
          </div>

          <div class="details__item flex flex-col gap-1" v-if="translation.references.length > 0">
            <div class="detail__key">Tham khảo</div>

            <span
              class="detail__value"
              v-for="(reference, index) in translation.references"
              :key="index"
            >
              <span>– </span>
              <span class="ref__type font-mono">
                {{ reference.type }}
              </span>
              <a
                v-if="reference.type === 'ref'"
                class="cdx-docs-link"
                @click.prevent="onClickReferenceId(reference.id)"
              >
                {{ reference.id }}
              </a>
              <a
                v-if="reference.type === 'inline' && reference.url"
                class="cdx-docs-link"
                :href="reference.url"
                target="_blank"
              >
                {{ reference.content }}
              </a>
              <span v-else-if="reference.type === 'inline'">
                {{ reference.content }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card {
  background-color: var(--background-color-neutral);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  border-radius: 2px;
  padding-block: 0.5rem;
  padding-inline: 0.625rem;
  text-align: left;

  &:hover {
    border-color: var(--border-color-interactive--hover);
  }
}

.card__index {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
  display: flex;
  background-color: var(--background-color-interactive--active);
  border-radius: 2px;
  aspect-ratio: 1;
  width: 25px;
  justify-content: center;
  align-items: center;
  min-width: 25px;
}

.target__index {
  background-color: var(--background-color-interactive--active);
  padding-inline: 0.25rem;
  border-radius: 2px;
}

.card__targets {
  flex-wrap: wrap;
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.details {
  padding: 0.5rem 0.75rem;
  border-left: 6px dotted var(--border-color-subtle);
}

.detail__key {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
}

.ref__type {
  font-size: var(--font-size-x-small);
  color: var(--color-subtle);
  margin-right: 0.25rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 120ms ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
