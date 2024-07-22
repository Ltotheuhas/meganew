<template>
  <div>
    <div ref="threeContainer" class="three-container"></div>
    <div v-if="showLandscapePrompt" class="landscape-prompt">
      Please rotate your device to landscape mode.
    </div>
    <div v-if="isMobile" class="controls">
      <button class="control-btn up" @touchstart="onMoveStart('forward')" @touchend="onMoveEnd('forward')">↑</button>
      <button class="control-btn left" @touchstart="onMoveStart('left')" @touchend="onMoveEnd('left')">←</button>
      <button class="control-btn down" @touchstart="onMoveStart('backward')"
        @touchend="onMoveEnd('backward')">↓</button>
      <button class="control-btn right" @touchstart="onMoveStart('right')" @touchend="onMoveEnd('right')">→</button>
    </div>
    <button v-if="isMobile" @click="toggleUploadMenu">Upload Files</button>
    <UploadMenu v-if="showUploadMenu" @upload="handleUpload" />
  </div>
</template>

<script>
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import UploadMenu from './UploadMenu.vue';

export default {
  name: 'WhiteCubeRoom',
  components: {
    UploadMenu,
  },
  data() {
    return {
      showLandscapePrompt: false,
      isMobile: false,
      showUploadMenu: false,
      move: {
        forward: false,
        backward: false,
        left: false,
        right: false,
      },
      touchStart: { x: 0, y: 0 },
      objects: [], // Store objects to be rendered
    };
  },
  mounted() {
    this.checkOrientation();
    window.addEventListener('resize', this.checkOrientation);
    window.addEventListener('orientationchange', this.checkOrientation);
    this.initThreeJS();
    this.loadObjects();

    // Add keydown event listener
    window.addEventListener('keydown', this.handleKeydown);
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
    toggleUploadMenu() {
      this.showUploadMenu = !this.showUploadMenu;
      if (this.showUploadMenu) {
        // Unlock the mouse from Pointer Lock mode
        document.exitPointerLock();
      } else {
        // Lock the mouse back into Pointer Lock mode if controls are initialized
        if (this.controls && this.controls.isLocked === false) {
          this.controls.lock();
        }
      }
    },
    handleKeydown(event) {
      switch (event.key.toLowerCase()) {
        case 'u':
          this.toggleUploadMenu();
          break;
        case 'c':
          this.clearObjects();
          break;
        default:
          break;
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
      textureLoader.load(require('@/assets/megaworld.png'), (texture) => {
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
      });

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

      const animate = () => {
        requestAnimationFrame(animate);

        if (this.move.forward) controls.moveForward(0.1);
        if (this.move.backward) controls.moveForward(-0.1);
        if (this.move.left) controls.moveRight(-0.1);
        if (this.move.right) controls.moveRight(0.1);

        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      camera.position.set(0, 2, 5);
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
    },
    handleUpload(file) {
      const url = URL.createObjectURL(file);
      const extension = file.name.split('.').pop().toLowerCase();

      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          this.addImage(url);
          break;
        case 'mp3':
        case 'wav':
          this.addAudio(url);
          break;
        case 'gltf':
        case 'glb':
          this.addModel(url);
          break;
        default:
          console.error('Unsupported file type');
      }

      // Close the upload menu and lock the mouse into camera mode
      this.showUploadMenu = false;
      if (this.controls) {
        this.controls.lock();
      }
    },
    addImage(url) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(url, (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // Calculate the position in front of the camera
        const distance = 5; // Distance in front of the camera
        const vector = new THREE.Vector3(0, 0, -distance);
        vector.applyQuaternion(this.camera.quaternion);
        plane.position.copy(this.camera.position).add(vector);

        // Ensure the plane is facing the camera
        plane.lookAt(this.camera.position);

        this.scene.add(plane);
        this.objects.push({ type: 'image', url, position: plane.position.clone(), uuid: plane.uuid });
        this.saveObjects();
      });
    },
    addAudio(url) {
      const audio = new Audio(url);
      const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
      button.userData = { onClick: () => audio.play() };
      this.scene.add(button);
      this.objects.push({ type: 'audio', url, position: button.position.clone(), uuid: button.uuid });
      this.saveObjects();
    },
    addModel(url) {
      const loader = new THREE.GLTFLoader();
      loader.load(url, (gltf) => {
        gltf.scene.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
        this.scene.add(gltf.scene);
        this.objects.push({ type: 'model', url, position: gltf.scene.position.clone(), uuid: gltf.scene.uuid });
        this.saveObjects();
      });
    },
    saveObjects() {
      localStorage.setItem('threejs-objects', JSON.stringify(this.objects));
    },
    loadImageFromData(obj) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(obj.url, (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(obj.position);
        this.scene.add(plane);

        // Add rotation
        const animate = () => {
          requestAnimationFrame(animate);
          plane.rotation.y += 0.01;
        };
        animate();
      });
    },
    loadAudioFromData(obj) {
      const audio = new Audio(obj.url);
      const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.copy(obj.position);
      button.userData = { onClick: () => audio.play() };
      this.scene.add(button);
    },
    loadModelFromData(obj) {
      const loader = new THREE.GLTFLoader();
      loader.load(obj.url, (gltf) => {
        gltf.scene.position.copy(obj.position);
        this.scene.add(gltf.scene);
      });
    },
    loadObjects() {
      const savedObjects = localStorage.getItem('threejs-objects');
      if (savedObjects) {
        this.objects = JSON.parse(savedObjects);
        this.objects.forEach(obj => {
          switch (obj.type) {
            case 'image':
              this.loadImageFromData(obj);
              break;
            case 'audio':
              this.loadAudioFromData(obj);
              break;
            case 'model':
              this.loadModelFromData(obj);
              break;
          }
        });
      }
    },
    clearObjects() {
      this.objects.forEach(obj => {
        const threeObject = this.scene.getObjectByProperty('uuid', obj.uuid);
        if (threeObject) {
          this.scene.remove(threeObject);
        }
      });
      this.objects = [];
      localStorage.removeItem('threejs-objects');
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

    // Remove keydown event listener
    window.removeEventListener('keydown', this.handleKeydown);
  },
};
</script>

<style>
html,
body {
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
  width: 170px;
  /* 3 * 50px + 2 * 10px (gap) */
  height: 170px;
  /* 3 * 50px + 2 * 10px (gap) */
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
