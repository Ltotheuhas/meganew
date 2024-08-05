<template>
    <div class="upload-menu">
      <input type="file" @change="handleFileUpload" />
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        this.$emit('upload', file);
      },
    },
  };
  </script>
  
  <style>
  .upload-menu {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>
  