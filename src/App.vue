<template>
  <div>
    <ThreeJSScene ref="threeScene" />
    <div v-if="isMobile" class="joystick-wrapper">
      <JoystickWrapper
        @joystick-start="onJoyStart"
        @joystick-move="onJoyMove"
        @joystick-end="onJoyEnd"
      />
    </div>
    <button v-if="isMobile" class="upload_button" @click="toggleUploadMenu">
      Upload Files
    </button>
    <UploadMenu v-if="showUploadMenu" @upload="handleUpload" />
  </div>
</template>

<script>
import JoystickWrapper from "@/components/JoystickWrapper.vue";
import ThreeJSScene from "./components/ThreeJSScene.vue";
import UploadMenu from "./components/UploadMenu.vue";

export default {
  components: {
    ThreeJSScene,
    UploadMenu,
    JoystickWrapper,
  },
  data() {
    return {
      showUploadMenu: false,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    toggleUploadMenu() {
      this.showUploadMenu = !this.showUploadMenu;
      if (this.showUploadMenu) {
        // Unlock the mouse from Pointer Lock mode
        document.exitPointerLock();
      } else {
        // Lock the mouse back into Pointer Lock mode if controls are initialized
        if (
          this.$refs.threeScene.controls &&
          this.$refs.threeScene.controls.isLocked === false
        ) {
          this.$refs.threeScene.controls.lock();
        }
      }
    },
    handleKeydown(event) {
      if (event.key.toLowerCase() === "b") {
        this.toggleUploadMenu();
      }
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
        alert(
          "File size exceeds the limit of " +
            fileSizeLimit / 1024 / 1024 +
            "MB."
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const apiUrl = process.env.VUE_APP_API_URL; // Your backend URL
        const response = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const result = await response.json();
        console.log("Upload result:", result);

        const extension = file.name.split(".").pop().toLowerCase();

        switch (extension) {
          case "jpg":
          case "jpeg":
          case "png":
            this.$refs.threeScene.addImage(result);
            break;
          case "gif":
            this.$refs.threeScene.addGIF(result);
            break;
          case "mp3":
          case "wav":
            this.$refs.threeScene.addAudio(result);
            break;
          case "gltf":
          case "glb":
          case "obj":
          case "fbx":
          case "stl":
          case "dae":
          case "3ds":
          case "ply":
          case "x3d":
          case "wrl":
            this.$refs.threeScene.addModel(result, extension);
            break;
          default:
            console.error("Unsupported file type");
        }

        this.showUploadMenu = false;
        if (this.$refs.threeScene.controls) {
          this.$refs.threeScene.controls.lock();
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    },
    onJoyStart(payload) {
      this.$refs.threeScene?.joystickStart(payload);
    },
    onJoyMove(payload) {
      this.$refs.threeScene?.joystickMove(payload);
    },
    onJoyEnd(payload) {
      this.$refs.threeScene?.joystickEnd(payload);
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
