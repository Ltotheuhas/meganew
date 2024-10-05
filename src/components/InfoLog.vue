<template>
  <div class="info-log">
    <h1 class="status">{{ backendStatus }}</h1>
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
      backendStatus: 'Checking...',
      todoList: [
        'idk',
      ]
    };
  },
  mounted() {
    this.isLocalhost = window.location.hostname === 'localhost';
    this.checkBackendStatus();
  },
  methods: {
    async checkBackendStatus() {
      try {
        console.log('Checking backend status...');
        const apiUrl = process.env.VUE_APP_API_URL;
        const response = await fetch(`${apiUrl}/health`);
        console.log('Response:', response);
        if (response.ok) {
          console.log('Backend is online');
          this.backendStatus = 'ONLINE';
        } else {
          console.log('Backend is offline');
          this.backendStatus = 'OFFLINE';
        }
      } catch (error) {
        console.error('Error checking backend status:', error);
        this.backendStatus = 'OFFLINE';
      }
    }
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: black;
}

.status {
  margin-bottom: 0;
}
</style>
