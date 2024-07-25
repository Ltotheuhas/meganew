<template>
  <div>
    <ThreeJSScene ref="threeScene" />
    <button v-if="isMobile" @click="toggleUploadMenu">Upload Files</button>
    <UploadMenu v-if="showUploadMenu" @upload="handleUpload" />
  </div>
</template>

<script>
import ThreeJSScene from './ThreeJSScene.vue';
import UploadMenu from './UploadMenu.vue';

export default {
  name: 'WhiteCubeRoom',
  components: {
    ThreeJSScene,
    UploadMenu,
  },
  data() {
    return {
      showUploadMenu: false,
    };
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
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
      switch (event.key.toLowerCase()) {
        case 'b':
          this.toggleUploadMenu();
          break;
        case 'c':
          this.$refs.threeScene.clearObjects();
          break;
        default:
          break;
      }
    },
    handleUpload(file) {
      const fileSizeLimit = 10 * 1024 * 1024;

      if (file.size > fileSizeLimit) {
        alert('File size exceeds the limit of ' + fileSizeLimit / 1024 / 1024 + 'MB.');
        return;
      }

      const url = URL.createObjectURL(file);
      const extension = file.name.split('.').pop().toLowerCase();

      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          this.$refs.threeScene.addImage(url);
          break;
        case 'mp3':
        case 'wav':
          this.$refs.threeScene.addAudio(url);
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
          this.$refs.threeScene.addModel(url, extension);
          break;
        default:
          console.error('Unsupported file type');
      }

      // Close the upload menu and lock the mouse into camera mode
      this.showUploadMenu = false;
      if (this.$refs.threeScene.controls) {
        this.$refs.threeScene.controls.lock();
      }
    },
  },
};
</script>

<style>
button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
