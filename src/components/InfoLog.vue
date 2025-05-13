<template>
  <div class="info-log">
    <h1 class="status">{{ backendStatus }}</h1>
    <div v-if="isLocalhost">
      <h2>Todo</h2>
      <p v-for="(item, index) in todoList" :key="index">{{ item }}</p>
    </div>
    <div v-else>
      <p>Press B to upload a file</p>
      <p>Use WASD or arrow keys to move around</p>
      <p>Currently supports images and gifs</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      backendStatus: 'Checking...',
      isLocalhost: false
    };
  },
  mounted() {
    this.isLocalhost = window.location.hostname === 'localhost';
    this.checkBackendStatus();
  },
  methods: {
    async checkBackendStatus() {
      console.log('InfoLog: Checking backend status...');
      try {
        const apiUrl = process.env.VUE_APP_API_URL; // or whichever var you use
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
          console.log('InfoLog: Backend is online');
          this.backendStatus = 'ONLINE';
        } else {
          console.log('InfoLog: Backend is offline');
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
