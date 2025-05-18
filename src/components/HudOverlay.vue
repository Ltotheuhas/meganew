<template>
  <div class="hud pointer-events-none select-none">
    <!-- backend status pane -->
    <InfoLog class="info-log" />

    <!-- upload button -->
    <button class="upload-btn pointer-events-auto" @click="toggle">
      Upload&nbsp;Files
    </button>

    <!-- file-picker dialog -->
    <div
      v-if="showMenu"
      class="upload-backdrop pointer-events-auto"
      @click.self="toggle"
    >
      <UploadMenu @upload="handleUpload" />
    </div>
  </div>
</template>

<script setup>
/* global defineEmits, defineExpose */ /* ← silences no-undef */

import { ref } from "vue";
import InfoLog from "./InfoLog.vue";
import UploadMenu from "./UploadMenu.vue";

const emit = defineEmits(["upload", "menu-open", "menu-close"]);

const showMenu = ref(false);

function toggle() {
  showMenu.value = !showMenu.value;
  showMenu.value ? emit("menu-open") : emit("menu-close");
}

function handleUpload(file) {
  emit("upload", file); // bubble to App.vue
  showMenu.value = false;
  emit("upload-done");
}

defineExpose({ toggle });
</script>

<style scoped>
.hud {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
  z-index: 20;
  /*  ↓ everything inside the HUD will blend “exclusion” by default */
  mix-blend-mode: exclusion;
}

/* ---------- Upload button ---------- */
.upload-btn {
  margin: 15px 0 0 25px;
  padding: 0.4rem 0.9rem;
  background: transparent; /* let the blend do the colour */
  color: #fff; /* any light colour works   */
  border: 1px solid currentColor; /* thin Web 1.0 outline     */
  font-family: monospace; /* retro flavour            */
  font-weight: 700;
  pointer-events: auto; /* stay clickable           */
  mix-blend-mode: inherit; /* use the hud’s exclusion  */
}

/* ---------- Backdrop for the modal ---------- */
.upload-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

/* ---------- Info-log panel ---------- */
.info-log {
  margin-left: 25px;
  background: transparent;
  color: #fff; /* inverted by blend */
  font-family: monospace;
  mix-blend-mode: inherit;
}
@keyframes spin {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(360deg);
  }
}
</style>
