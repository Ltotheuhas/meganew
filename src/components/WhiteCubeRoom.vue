<template>
  <div ref="threeContainer" class="three-container"></div>
  <div v-if="showLandscapePrompt" class="landscape-prompt">
    Please rotate your device to landscape mode.
  </div>
  <div v-if="isMobile" class="controls">
    <button class="control-btn up" @touchstart="onMoveStart('forward')" @touchend="onMoveEnd('forward')">↑</button>
    <button class="control-btn left" @touchstart="onMoveStart('left')" @touchend="onMoveEnd('left')">←</button>
    <button class="control-btn down" @touchstart="onMoveStart('backward')" @touchend="onMoveEnd('backward')">↓</button>
    <button class="control-btn right" @touchstart="onMoveStart('right')" @touchend="onMoveEnd('right')">→</button>
  </div>
</template>

<script>
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export default {
  name: 'WhiteCubeRoom',
  data() {
    return {
      showLandscapePrompt: false,
      isMobile: false,
      move: {
        forward: false,
        backward: false,
        left: false,
        right: false,
      },
      touchStart: { x: 0, y: 0 },
    };
  },
  mounted() {
    this.checkOrientation();
    window.addEventListener('resize', this.checkOrientation);
    window.addEventListener('orientationchange', this.checkOrientation);
    this.initThreeJS();
  },
  methods: {
    checkOrientation() {
      this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (this.isMobile && window.innerHeight > window.innerWidth) {
        this.showLandscapePrompt = true;
      } else {
        this.showLandscapePrompt = false;
      }
    },
    initThreeJS() {
      // Setup
      const container = this.$refs.threeContainer;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.rotation.order = 'YXZ';  // Ensure proper rotation order
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Lighting
      const light = new THREE.AmbientLight(0xFFFFFF); // white light
      scene.add(light);

      // Grid Helper
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);

      // Axes Helper
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // White Cube Room
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Load Image Texture
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(require('@/assets/megaworld.png'));

      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Wait for texture to load before setting up the plane geometry
      textureLoader.load(require('@/assets/megaworld.png'), function(texture) {
        const aspect = texture.image.width / texture.image.height;
        const planeWidth = 4;
        const planeHeight = planeWidth / aspect;

        // Create Plane Geometry for Image
        const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // Position Plane at Center and adjust z-coordinate
        plane.position.set(0, 2, 0);
        scene.add(plane);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          if (this.move.forward) controls.moveForward(0.1);
          if (this.move.backward) controls.moveForward(-0.1);
          if (this.move.left) controls.moveRight(-0.1);
          if (this.move.right) controls.moveRight(0.1);

          // Rotate the image plane
          plane.rotation.y += 0.01;

          renderer.render(scene, camera);
        };
        animate();
      }.bind(this));

      // Controls
      const controls = new PointerLockControls(camera, renderer.domElement);

      // Pointer lock error handler
      const onPointerLockError = () => {
        console.error('Pointer lock error occurred.');
      };

      // Add event listeners for pointer lock error
      document.addEventListener('pointerlockerror', onPointerLockError);

      document.addEventListener('click', () => controls.lock());

      const move = this.move;

      const onKeyDown = (event) => {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            move.forward = true;
            break;
          case 'ArrowDown':
          case 'KeyS':
            move.backward = true;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            move.left = true;
            break;
          case 'ArrowRight':
          case 'KeyD':
            move.right = true;
            break;
        }
      };

      const onKeyUp = (event) => {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            move.forward = false;
            break;
          case 'ArrowDown':
          case 'KeyS':
            move.backward = false;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            move.left = false;
            break;
          case 'ArrowRight':
          case 'KeyD':
            move.right = false;
            break;
        }
      };

      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      // Touch controls for mobile (look around)
      const onTouchStart = (event) => {
        this.touchStart.x = event.touches[0].clientX;
        this.touchStart.y = event.touches[0].clientY;
      };

      const onTouchMove = (event) => {
        const touchMoveX = event.touches[0].clientX - this.touchStart.x;
        const touchMoveY = event.touches[0].clientY - this.touchStart.y;

        camera.rotation.y -= touchMoveX * 0.002;
        camera.rotation.x -= touchMoveY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        this.touchStart.x = event.touches[0].clientX;
        this.touchStart.y = event.touches[0].clientY;
      };

      document.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      camera.position.set(0, 2, 5);
    },
    onMoveStart(direction) {
      this.move[direction] = true;
    },
    onMoveEnd(direction) {
      this.move[direction] = false;
    },
  },
  beforeUnmount() {
    // Cleanup event listeners
    window.removeEventListener('resize', this.checkOrientation);
    window.removeEventListener('orientationchange', this.checkOrientation);
    document.removeEventListener('pointerlockerror', this.onPointerLockError);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
  },
};
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.landscape-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
  text-align: center;
  font-size: 18px;
}

.controls {
  position: absolute;
  left: 10px;
  top: 100%;
  transform: translateY(-100%);
  display: grid;
  grid-template-columns: repeat(3, 50px);
  grid-template-rows: repeat(3, 50px);
  gap: 2px;
  width: 170px; /* 3 * 50px + 2 * 10px (gap) */
  height: 170px; /* 3 * 50px + 2 * 10px (gap) */
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
