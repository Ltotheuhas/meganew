<template>
  <div id="app">
    <WhiteCubeRoom />
  </div>
</template>

<script>
import WhiteCubeRoom from './components/WhiteCubeRoom.vue';

export default {
  name: 'App',
  components: {
    WhiteCubeRoom,
  },
};
</script>

<style>
#app {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
