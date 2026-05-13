export const getSelectedText = (): string => {
  const activeElement = document.activeElement;

  /**
   * Input / textarea selection
   */
  if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
    const start = activeElement.selectionStart ?? 0;
    const end = activeElement.selectionEnd ?? 0;

    return activeElement.value.slice(start, end);
  }

  /**
   * contenteditable selection
   */
  if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
    return window.getSelection()?.toString() ?? '';
  }

  /**
   * Normal page selection
   */
  return window.getSelection()?.toString() ?? '';
};

export const normalizeSelectedText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};
