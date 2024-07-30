<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
// import { X3DLoader } from 'three/examples/jsm/loaders/X3DLoader.js';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';
import { parseGIF, decompressFrames } from 'gifuct-js';
import InfoLog from './InfoLog.vue';
import { createApp, nextTick } from 'vue';
import html2canvas from 'html2canvas';

export default {
  name: 'ThreeJSScene',
  data() {
    return {
      move: {
        forward: false,
        backward: false,
        left: false,
        right: false,
      },
      touchStart: { x: 0, y: 0 },
      objects: [],
      canvas: document.createElement('canvas'),
      ctx: null,
      frames: [],
      frameIndex: 0,
      playing: true,
    };
  },
  mounted() {
    this.initThreeJS();
    this.loadObjectsFromBackend();
  },
  methods: {
    async initThreeJS() {
      // Setup
      const container = this.$refs.threeContainer;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.rotation.order = 'YXZ'; // Ensure proper rotation order
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Lighting
      const light = new THREE.AmbientLight(0xffffff); // white light
      scene.add(light);

      // Grid Helper
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);

      // Axes Helper
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // White Cube Room
      const geometry = new THREE.BoxGeometry(100, 100, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Load Megaworld Image
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
        plane.position.set(0, 4, 0);
        scene.add(plane);

        // Animation loop for rotating the image plane
        const animate = () => {
          requestAnimationFrame(animate);

          if (this.move.forward) controls.moveForward(0.1);
          if (this.move.backward) controls.moveForward(-0.1);
          if (this.move.left) controls.moveRight(-0.1);
          if (this.move.right) controls.moveRight(0.1);

          plane.rotation.y += 0.01;

          renderer.render(scene, camera);
        };
        animate();
      });

      // Controls
      const controls = new PointerLockControls(camera, renderer.domElement);
      this.controls = controls;

      // Pointer lock error handler
      const onPointerLockError = () => {
        console.error('Pointer lock error occurred.');
      };

      // Add event listeners for pointer lock error
      document.addEventListener('pointerlockerror', onPointerLockError);

      document.addEventListener('click', () => {
        if (!this.$parent.showUploadMenu) { // Only lock if upload menu is not open
          controls.lock();
        }
      });

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

      // Load InfoLog Component as Texture
      const infoLogComponent = createApp(InfoLog);
      const infoLogContainer = document.createElement('div');
      document.body.appendChild(infoLogContainer);
      infoLogComponent.mount(infoLogContainer);

      await nextTick(); // Wait for Vue to render the component

      const canvas = await html2canvas(infoLogContainer, {
        backgroundColor: null,
        scale: 2
      });

      const infoLogTexture = new THREE.CanvasTexture(canvas);
      const infoLogAspect = canvas.width / canvas.height;
      const infoLogPlaneGeometry = new THREE.PlaneGeometry(16, 16 / infoLogAspect);
      const infoLogPlaneMaterial = new THREE.MeshBasicMaterial({ map: infoLogTexture, transparent: true });
      const infoLogPlane = new THREE.Mesh(infoLogPlaneGeometry, infoLogPlaneMaterial);

      // Position InfoLog Plane
      infoLogPlane.position.set(0, 2, 0);
      scene.add(infoLogPlane);

      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
    },
    async saveObjectsToBackend() {
      try {
        const response = await fetch('http://localhost:3000/objects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.objects),
        });
        if (!response.ok) {
          throw new Error('Failed to save objects to backend');
        }
        console.log('Objects saved to backend successfully');
      } catch (error) {
        console.error('Error saving objects to backend:', error);
      }
    },
    async loadObjectsFromBackend() {
      try {
        const response = await fetch('http://localhost:3000/objects');
        if (!response.ok) {
          throw new Error('Failed to load objects from backend');
        }
        const objects = await response.json();
        this.objects = objects;
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
            default:
              console.warn('Unknown object type:', obj.type);
          }
        });
      } catch (error) {
        console.error('Error loading objects from backend:', error);
      }
    },
    loadObject(obj) {
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
        default:
          console.warn('Unknown object type:', obj.type);
      }
    },
    async getFileTypeFromBlobUrl(blobUrl) {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return blob.type.split('/')[1]; // Get the extension part
    },
    async addImage(url) {
      console.log(`addImage called with URL: ${url}`);

      const extension = await this.getFileTypeFromBlobUrl(url);
      console.log(`Detected file type: ${extension}`);

      const textureLoader = new THREE.TextureLoader();

      if (extension === 'gif') {
        console.log(`Detected GIF file, proceeding to load GIF: ${url}`);
        const base64 = await this.blobToBase64(url);
        const plane = await this.loadGIF(base64, this.scene);
        this.objects.push({
          type: 'image',
          base64,  // Save base64 data
          position: plane.position.clone(),
          rotation: plane.rotation.clone(),
          uuid: plane.uuid
        });
        await this.saveObjectsToBackend();
      } else {
        console.log(`Loading non-GIF image from URL: ${url}`);
        textureLoader.load(url, async (texture) => {
          const aspect = texture.image.width / texture.image.height;
          const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
          const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);

          const distance = 5;
          const vector = new THREE.Vector3(0, 0, -distance);
          vector.applyQuaternion(this.camera.quaternion);
          plane.position.copy(this.camera.position).add(vector);

          plane.lookAt(this.camera.position);

          this.scene.add(plane);
          this.objects.push({
            type: 'image',
            url,
            position: plane.position.clone(),
            rotation: plane.rotation.clone(),
            uuid: plane.uuid
          });
          await this.saveObjectsToBackend();
        });
      }
    },
    async blobToBase64(blobUrl) {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    loadImageFromData(obj) {
      const textureLoader = new THREE.TextureLoader();

      console.log('Loading image from data:', obj);

      if (obj.base64) {
        this.loadGIF(obj.base64, this.scene, obj.position, obj.rotation);
      } else if (obj.url) {
        textureLoader.load(obj.url, (texture) => {
          const aspect = texture.image.width / texture.image.height;
          const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
          const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.position.copy(obj.position);
          plane.rotation.copy(obj.rotation);
          this.scene.add(plane);
        }, undefined, (err) => {
          console.error('Error loading texture:', err);
        });
      } else {
        console.error('No URL or base64 data found for image:', obj);
      }
    },
    async loadGIF(base64, scene, position = null, rotation = null) {
      const arrayBuffer = this.base64ToArrayBuffer(base64);
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      const canvas = document.createElement('canvas');
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      const ctx = canvas.getContext('2d');

      const texture = new THREE.CanvasTexture(canvas);
      const aspect = canvas.width / canvas.height;
      const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      console.log('Initial plane position:', plane.position);
      console.log('Initial plane rotation:', plane.rotation);

      if (position) {
        plane.position.copy(position);
        console.log('Loaded position:', position);
      } else {
        const distance = 5; // Distance in front of the camera
        const vector = new THREE.Vector3(0, 0, -distance);
        vector.applyQuaternion(this.camera.quaternion);
        plane.position.copy(this.camera.position).add(vector);
        console.log('Calculated position in front of camera:', plane.position);
      }

      if (rotation) {
        plane.rotation.copy(rotation);
        console.log('Loaded rotation:', rotation);
      } else {
        plane.lookAt(this.camera.position);
        console.log('Calculated rotation to face camera:', plane.rotation);
      }

      scene.add(plane);

      let frameIndex = 0;
      const animateGIF = () => {
        requestAnimationFrame(animateGIF);
        const frame = frames[frameIndex];
        ctx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), frame.dims.left, frame.dims.top);
        texture.needsUpdate = true;
        frameIndex = (frameIndex + 1) % frames.length;
      };
      animateGIF();

      this.objects.push({ type: 'image', base64, position: plane.position.clone(), rotation: plane.rotation.clone(), uuid: plane.uuid });
      await this.saveObjectsToBackend();

      return plane;
    },
    base64ToArrayBuffer(base64) {
      const binaryString = window.atob(base64.split(',')[1]);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    },
    renderFrame() {
      const frame = this.frames[this.frameIndex];
      const { dims, patch } = frame;
      this.ctx.putImageData(new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height), dims.left, dims.top);

      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    },
    async addAudio(url) {
      const audio = new Audio(url);
      const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);

      // Calculate the position in front of the camera
      const distance = 5; // Distance in front of the camera
      const vector = new THREE.Vector3(0, 0, -distance);
      vector.applyQuaternion(this.camera.quaternion);
      button.position.copy(this.camera.position).add(vector);

      button.userData = { onClick: () => audio.play() };
      this.scene.add(button);
      this.objects.push({ type: 'audio', url, position: button.position.clone(), uuid: button.uuid });
      await this.saveObjectsToBackend();
    },
    getLoader(extension) {
      switch (extension) {
        case 'gltf':
        case 'glb':
          return new GLTFLoader();
        case 'obj':
          return new OBJLoader();
        case 'fbx':
          return new FBXLoader();
        case 'stl':
          return new STLLoader();
        case 'dae':
          return new ColladaLoader();
        case '3ds':
          return new TDSLoader();
        case 'ply':
          return new PLYLoader();
        /*case 'x3d':
          return new X3DLoader();*/
        case 'wrl':
          return new VRMLLoader();
        default:
          console.error('Unsupported model file type');
          return null;
      }
    },
    async addModel(url, extension) {
      const loader = this.getLoader(extension);
      if (!loader) return;

      // Fetch the model blob and convert it to base64
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result;
        const modelData = {
          type: 'model',
          extension,
          data: base64,
          position: { x: 0, y: 0, z: 0 }, // Initial position placeholder
          rotation: { x: 0, y: 0, z: 0, order: 'XYZ' }, // Initial rotation placeholder
          uuid: THREE.MathUtils.generateUUID()
        };

        // Load the model and get its final position and rotation
        const sceneObject = await this.loadModelFromData(modelData);

        // Calculate the position in front of the camera
        const distance = 5; // Distance in front of the camera
        const vector = new THREE.Vector3(0, 0, -distance);
        vector.applyQuaternion(this.camera.quaternion);
        sceneObject.position.copy(this.camera.position).add(vector);
        sceneObject.position.y = 0; // Set y position to ground level

        // Rotate the model to face the camera along the Z-axis
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Zero out the Y component to align horizontally
        cameraDirection.normalize();
        const targetPosition = sceneObject.position.clone().add(cameraDirection);
        sceneObject.lookAt(targetPosition);
        sceneObject.rotation.x = 0; // Ensure no tilt in the X-axis
        sceneObject.rotation.z = 0; // Ensure no tilt in the Z-axis

        // Update the model data with the final position and rotation
        modelData.position = sceneObject.position.clone();
        modelData.rotation = sceneObject.rotation.clone();

        this.objects.push(modelData);
        await this.saveObjectsToBackend();
      };
    },
    async loadModelFromData(obj) {
      console.log('Loading model from data:', obj); // Debugging log
      const loader = this.getLoader(obj.extension);
      if (!loader) return;

      // Create a blob URL from the base64 data
      const response = await fetch(obj.data);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        loader.load(url, (gltf) => {
          let sceneObject;
          if (gltf.scene) {
            sceneObject = gltf.scene;
          } else {
            sceneObject = gltf;
          }

          // Set position and rotation
          sceneObject.position.set(obj.position.x, obj.position.y, obj.position.z);
          sceneObject.rotation.set(obj.rotation._x, obj.rotation._y, obj.rotation._z, obj.rotation._order);

          sceneObject.uuid = obj.uuid; // Assign the saved UUID

          this.scene.add(sceneObject);
          resolve(sceneObject); // Resolve with the scene object
        });
      });
    },
    clearObjects() {
      console.log('Clearing all objects from the scene and local storage.'); // Debugging log

      // Iterate through the objects array
      this.objects.forEach(async obj => {
        if (obj && obj.uuid) { // Check if the object and its UUID are valid
          const threeObject = this.scene.getObjectByProperty('uuid', obj.uuid);
          if (threeObject) {
            this.scene.remove(threeObject);
            console.log(`Removed object with UUID: ${obj.uuid}`); // Debugging log

            // Dispose of the object's geometry and material to free up memory
            if (threeObject.geometry) threeObject.geometry.dispose();
            if (threeObject.material) {
              if (Array.isArray(threeObject.material)) {
                threeObject.material.forEach(material => material.dispose());
              } else {
                threeObject.material.dispose();
              }
            }
          } else {
            console.warn(`Object with UUID: ${obj.uuid} not found in the scene.`); // Debugging log
          }

          // Remove the object from the backend database
          try {
            const response = await fetch(`http://localhost:3000/objects/${obj._id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              console.log(`Object with ID: ${obj._id} removed from database.`); // Debugging log
            } else {
              console.error(`Failed to remove object with ID: ${obj._id} from database.`); // Debugging log
            }
          } catch (error) {
            console.error(`Error removing object with ID: ${obj._id} from database:`, error); // Debugging log
          }
        } else {
          console.warn('Encountered invalid object or object without UUID:', obj); // Debugging log
        }
      });

      // Clear the objects array
      this.objects = [];

      console.log('All objects have been cleared.'); // Debugging log
    }
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
</style>