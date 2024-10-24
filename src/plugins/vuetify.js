// vuetify.js
import 'vuetify/styles'; // Ensure you include the vuetify styles
import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        idontcare: {
          primary: '#3BFF00',
          secondary: '#0036FF',
          background: '#ffffff',
          contentBackground: '#DCDADA',
        },
        pinkdre4m: {
          primary: '#FF00FF',
          secondary: '#000000',
          background: '#FFFFFF',
          contentBackground: '#FF00D4',
        },
        greencat: {
          primary: '#00FF06',
          secondary: '#000000',
          background: '#EC00FF',
          contentBackground: '#999999',
        },
      },
    },
  },
});

export default vuetify;
