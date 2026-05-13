import { getSelectedText, normalizeSelectedText } from '@/utils/selection.ts';
import { triggerSearch } from '@/utils/searchController.ts';

const MAX_SELECTION_LENGTH = 1000;

/**
 * Ignore repeated copy
 */
const DUPLICATE_WINDOW_MS = 1500;

let lastCopiedText = '';
let lastCopiedAt = 0;

const isInsideLexis = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  return !!target.closest('[data-id="lexis-root"]') || !!target.closest('.cdx-popover');
};

const shouldSkipDuplicate = (text: string): boolean => {
  const now = Date.now();
  const isDuplicate = text === lastCopiedText;
  const isWithinWindow = now - lastCopiedAt < DUPLICATE_WINDOW_MS;

  if (isDuplicate && isWithinWindow) {
    return true;
  }

  lastCopiedText = text;
  lastCopiedAt = now;

  return false;
};

export const registerCopySearch = (): void => {
  document.addEventListener(
    'copy',
    async (event: ClipboardEvent) => {
      /**
       * Ignore Lexis internal copy
       */
      if (isInsideLexis(event.target)) {
        return;
      }

      /**
       * Wait for selection stabilization
       */
      requestAnimationFrame(async () => {
        let text = normalizeSelectedText(getSelectedText());

        if (!text) {
          return;
        }

        if (text.length > MAX_SELECTION_LENGTH) {
          text = text.slice(0, MAX_SELECTION_LENGTH);
        }

        /**
         * Prevent spam
         */
        if (shouldSkipDuplicate(text)) {
          return;
        }

        await triggerSearch({
          text,
          autoSearch: true,
        });
      });
    },
    /**
     * IMPORTANT:
     * capture phase
     */
    true,
  );
};
