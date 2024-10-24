<template>
  <v-app class="app-background">
    <v-main>
      <v-container class="d-flex flex-column justify-center align-center fill-height py-0 container-max-width">
        <v-row class="w-100 justify-center mb-0" style="flex-grow: 0;">
          <v-col cols="12" class="text-center" style="padding-bottom: 0;">
            <v-img :src="require('@/assets/megaworld.png')" class="mb-0" />
            <v-img :src="require('@/assets/pics/xyzchoose-30.png')" class="mb-0" />
          </v-col>
        </v-row>
        <v-row class="w-100 justify-center mt-0 px-sm-12" style="flex-grow: 0;">
          <v-col cols="4" class="text-center">
            <router-link :to="{ name: 'Home', query: { theme: 'idontcare' } }">
              <v-img :src="require('@/assets/pics/xyzindexyes-29.png')" alt="Basic" class="img-theme" />
            </router-link>
          </v-col>
          <v-col cols="4" class="text-center">
            <router-link :to="{ name: 'Home', query: { theme: 'pinkdre4m' } }">
              <v-img :src="require('@/assets/pics/xyzindexyes-30.png')" alt="Pink Dre4m" class="img-theme mt-12" />
            </router-link>
          </v-col>
          <v-col cols="4" class="text-center">
            <router-link :to="{ name: 'Home', query: { theme: 'greencat' } }">
              <v-img :src="require('@/assets/pics/xyzindexyes-31.png')" alt="Dark" class="img-theme" />
            </router-link>
          </v-col>
        </v-row>
      </v-container>

      <!-- Add the escape button fixed to the bottom-right -->
      <v-btn class="escape-btn" @click="$router.push({ name: 'Space' })" color="primary">
        Escape
      </v-btn>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "ThemeSelector",
};
</script>

<style scoped>
.app-background {
  background: url('@/assets/pics/aaaalittlepo.png') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
}

.container-max-width {
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
}

.v-img {
  max-width: 100%;
  height: auto;
}

.img-theme {
  max-width: 100%;
  height: auto;
  padding-bottom: 0;
}

/* Style the escape button */
.escape-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000; /* Make sure the button is always on top */
}
</style>
