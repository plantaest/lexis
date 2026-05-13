export function toReadableDate(dateString: string) {
  return new Intl.DateTimeFormat(mw.config.get('wgUserLanguage'), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString));
}
