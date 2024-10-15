<template>
  <div>
    <ThreeJSScene ref="threeScene" :joystickX="joystickX" :joystickY="joystickY" />
    <div class="joystick-wrapper">
      <Joystick v-if="isMobile" stickColor="lightgrey" size="100" throttle="100" @move="handleJoystickMove"
        @stop="handleJoystickStop" />
    </div>
    <button v-if="isMobile" class="upload_button" @click="toggleUploadMenu">Upload Files</button>
    <UploadMenu v-if="showUploadMenu" @upload="handleUpload" />
  </div>
</template>

<script>
import Joystick from 'vue-joystick-component';
import ThreeJSScene from './components/ThreeJSScene.vue';
import UploadMenu from './components/UploadMenu.vue';

export default {
  components: {
    ThreeJSScene,
    UploadMenu,
    Joystick,
  },
  data() {
    return {
      showUploadMenu: false,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      swipeTouch: { x: 0, y: 0 },
      isTouchOnJoystick: false,
      joystickX: 0, // Reactive joystick X value
      joystickY: 0  // Reactive joystick Y value
    };
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('touchend', this.handleTouchEnd);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  },
  methods: {
    toggleUploadMenu() {
      this.showUploadMenu = !this.showUploadMenu;
      if (this.showUploadMenu) {
        // Unlock the mouse from Pointer Lock mode
        document.exitPointerLock();
      } else {
        // Lock the mouse back into Pointer Lock mode if controls are initialized
        if (this.$refs.threeScene.controls && this.$refs.threeScene.controls.isLocked === false) {
          this.$refs.threeScene.controls.lock();
        }
      }
    },
    handleKeydown(event) {
      if (event.key.toLowerCase() === 'b') {
        this.toggleUploadMenu();
      }
    },
    handleTouchStart(event) {
      const joystickElement = this.$el.querySelector('.joystick-wrapper');
      if (!joystickElement) return;

      const touch = event.touches[0];
      const rect = joystickElement.getBoundingClientRect();

      // Check if the touch is within the joystick area
      this.isTouchOnJoystick = touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom;

      console.log('Touch on Joystick:', this.isTouchOnJoystick); // Debugging

      if (!this.isTouchOnJoystick) {
        this.swipeTouch.x = touch.clientX;
        this.swipeTouch.y = touch.clientY;

        // Initialize yaw and pitch only if not touching the joystick
        const { rotation } = this.$refs.threeScene.controls.object;
        this.$refs.threeScene.yaw = rotation.y;
        this.$refs.threeScene.pitch = rotation.x;
      }
    },
    handleTouchMove(event) {
      if (this.isTouchOnJoystick) {
        console.log('Skipping rotateCamera due to joystick use');
        return; // Skip rotateCamera if using joystick
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - this.swipeTouch.x;
      const deltaY = touch.clientY - this.swipeTouch.y;

      console.log('Calling rotateCamera with:', deltaX, deltaY); // Debugging

      if (this.$refs.threeScene) {
        this.$refs.threeScene.rotateCamera(deltaX, deltaY);
      }

      this.swipeTouch.x = touch.clientX;
      this.swipeTouch.y = touch.clientY;
    },
    handleTouchEnd() {
      this.isTouchOnJoystick = false;
    },
    handleJoystickMove({ x, y }) {
      this.joystickX = x;
      this.joystickY = y;
    },
    handleJoystickStop() {
      this.joystickX = 0;
      this.joystickY = 0;
    },
    async handleUpload(file) {
      const fileSizeLimit = 10 * 1024 * 1024; // 10MB limit

      if (file.size > fileSizeLimit) {
        alert('File size exceeds the limit of ' + fileSizeLimit / 1024 / 1024 + 'MB.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const apiUrl = process.env.VUE_APP_API_URL; // Your backend URL
        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        console.log("Upload result:", result);
        const filePath = result.filePath;

        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
          case 'jpg':
          case 'jpeg':
          case 'png':
            this.$refs.threeScene.addImage(filePath);
            break;
          case 'gif':
            this.$refs.threeScene.addGIF(filePath);
            break;
          case 'mp3':
          case 'wav':
            this.$refs.threeScene.addAudio(filePath);
            break;
          case 'gltf':
          case 'glb':
          case 'obj':
          case 'fbx':
          case 'stl':
          case 'dae':
          case '3ds':
          case 'ply':
          case 'x3d':
          case 'wrl':
            this.$refs.threeScene.addModel(filePath, extension);
            break;
          default:
            console.error('Unsupported file type');
        }

        this.showUploadMenu = false;
        if (this.$refs.threeScene.controls) {
          this.$refs.threeScene.controls.lock();
        }

      } catch (error) {
        console.error('Error uploading file:', error);
      }
    },
  },
};
</script>

<style>
.upload_button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.joystick-wrapper {
  position: absolute;
  bottom: 35px;
  left: 35px;
  z-index: 10;
}
</style>
