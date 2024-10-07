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
    async handleUpload(file) {
      const fileSizeLimit = 10 * 1024 * 1024; // 10MB limit

      if (file.size > fileSizeLimit) {
        alert('File size exceeds the limit of ' + fileSizeLimit / 1024 / 1024 + 'MB.');
        return;
      }

      // Prepare the file for upload
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Upload the file to the backend
        const apiUrl = process.env.VUE_APP_API_URL; // Your backend URL
        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        const filePath = result.filePath; // Get the file path from the server response

        // Determine the file extension
        const extension = file.name.split('.').pop().toLowerCase();

        // Call the appropriate method to add the object to the scene
        switch (extension) {
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
            this.$refs.threeScene.addImage(filePath); // Pass the server file path to addImage
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

        // Close the upload menu and lock the mouse back into camera mode
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
button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
