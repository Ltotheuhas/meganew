<template>
    <div class="controls">
      <button class="control-btn up" @touchstart="moveStart('forward')" @touchend="moveEnd('forward')">↑</button>
      <button class="control-btn left" @touchstart="moveStart('left')" @touchend="moveEnd('left')">←</button>
      <button class="control-btn down" @touchstart="moveStart('backward')" @touchend="moveEnd('backward')">↓</button>
      <button class="control-btn right" @touchstart="moveStart('right')" @touchend="moveEnd('right')">→</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      moveStart(direction) {
        this.$emit('moveStart', direction);
      },
      moveEnd(direction) {
        this.$emit('moveEnd', direction);
      },
    },
  };
  </script>
  
  <style>
  .controls {
    position: absolute;
    left: 10px;
    top: 100%;
    transform: translateY(-100%);
    display: grid;
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(3, 50px);
    gap: 2px;
    width: 170px;
    height: 170px;
    z-index: 1000;
  }
  
  .control-btn {
    width: 50px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    touch-action: none;
  }
  
  .control-btn.up {
    grid-column: 2;
    grid-row: 1;
  }
  
  .control-btn.left {
    grid-column: 1;
    grid-row: 2;
  }
  
  .control-btn.down {
    grid-column: 2;
    grid-row: 3;
  }
  
  .control-btn.right {
    grid-column: 3;
    grid-row: 2;
  }
  </style>
  