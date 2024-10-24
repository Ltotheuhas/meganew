<template>
    <v-app :class="currentTheme.background">
      <v-main>
        <v-container>
          <v-sheet class="px-6 py-4" :class="currentTheme.contentBackground">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
          </v-sheet>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  export default {
    data() {
      return {
        themes: {
          idontcare: {
            background: 'theme-idontcare',
            contentBackground: 'content-idontcare'
          },
          pinkdre4m: {
            background: 'theme-pinkdre4m',
            contentBackground: 'content-pinkdre4m'
          },
          greencat: {
            background: 'theme-greencat',
            contentBackground: 'content-greencat'
          }
        },
        title: "Welcome to MegaWorld!",
        description: "An online fantasy world where everyone can share content without registration."
      };
    },
    computed: {
      currentTheme() {
        // Get the theme from the query parameter and return the relevant styles
        const theme = this.$route.query.theme || 'idontcare'; // default theme
        return this.themes[theme];
      }
    }
  };
  </script>
  
  <style scoped>
  /* Define your theme background styles */
  .theme-idontcare {
    background-color: #3BFF00;
  }
  .theme-pinkdre4m {
    background: url('@/assets/pics/xyzpinkdreamback-18.png') no-repeat center center fixed;
    background-size: cover;
  }
  .theme-greencat {
    background: url('@/assets/pics/xyzwalllpaappper-03.png') no-repeat center center fixed;
    background-size: cover;
  }
  
  /* Define your content styles */
  .content-idontcare {
    background-color: #DCDADA;
  }
  .content-pinkdre4m {
    background-color: rgba(255, 0, 251, 0.7);
  }
  .content-greencat {
    background-color: rgba(76, 175, 80, 0.7);
  }
  </style>
  