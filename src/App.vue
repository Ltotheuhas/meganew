<template>
  <v-app class="fill-height">
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
