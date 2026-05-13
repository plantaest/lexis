import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PiniaColada } from '@pinia/colada';
import App from './App.vue';
import { showPanel } from '@/stores/showPanel.ts';
import './global.css';

const root = document.createElement('div');

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(PiniaColada, {
  queryOptions: {
    placeholderData: (prev) => prev,
  },
});

app.mount(root);

const showPanelEvent = (event: JQuery.Event) => {
  event.preventDefault();
  showPanel.value = true;
};

mw.hook('wikipage.content').add(() => {
  const skin = mw.config.get('skin');

  if (skin === 'contenttranslation') {
    $('#user-tools').prepend(root);
  } else {
    const selector = '#lexis-gadget';

    if ($(selector).length === 0) {
      mw.util.addPortletLink(
        mw.config.get('skin') === 'minerva' ? 'p-personal' : 'p-cactions',
        '/wiki/Project:Lexis',
        'Lexis',
        'lexis-gadget',
        'Lexis',
      );
      $(selector).on('click', showPanelEvent);
    }
  }
});
