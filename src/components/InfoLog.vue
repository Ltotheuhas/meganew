<template>
    <div class="info-log">
      <div v-if="isLocalhost">
        <h2>Todo</h2>
        <p v-for="(item, index) in todoList" :key="index">{{ item }}</p>
      </div>
      <div v-else>
        <p>Press B to upload a file</p>
        <p>Press C to clear all objects</p>
        <p>Use WASD or arrow keys to move around</p>
        <p>Phone controls may or may not work rn</p>
        <p>Currently supports image files and obj files</p>
        <p>EVEN GIFS WORK WHICH WAS WAY MORE FUCKING WORK THAN EXPECTED</p>
        <p>Objects SHOULD BE saved to local storage so they reappear even when refreshed</p>
        <p>But thats broken rn</p>
      </div>
    </div>
  </template>
  
  <script>
export default {
  data() {
    return {
      isLocalhost: false,
      todoList: [
        'idk',
      ]
    };
  },
  mounted() {
    this.isLocalhost = window.location.hostname === 'localhost';
  }
};
</script>

<style scoped>
.info-log {
  text-align: center;
  background-color: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
}
</style>