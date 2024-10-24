/* global dataLayer */

import { createApp } from 'vue'; 
import App from './App.vue'; 
import router from './router';

import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

// Google Analytics setup
router.afterEach((to) => {
    if (typeof gtag === 'function') {
        gtag('config', 'G-YMNSW9SSFL', {
            page_path: to.fullPath,
        });
    }
});

createApp(App)
    .use(router)
    .use(vuetify)
    .mount('#app');

// Load Google Analytics script
const script = document.createElement('script');
script.async = true;
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YMNSW9SSFL';
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-YMNSW9SSFL');