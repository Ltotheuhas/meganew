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
      infoLogComponent: null,
      infoLogContainer: null,
      infoLogTexture: null,
    };
  },
  mounted() {
    this.initThreeJS().then(() => {
      this.loadObjectsFromBackend();
      this.setupPeriodicUpdate();
    });
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
      const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
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
      this.infoLogComponent = createApp(InfoLog);
      this.infoLogContainer = document.createElement('div');
      document.body.appendChild(this.infoLogContainer);
      this.infoLogComponent.mount(this.infoLogContainer);

      await nextTick(); // Wait for Vue to render the component

      const canvas = await this.createInfoLogCanvas();
      this.infoLogTexture = new THREE.CanvasTexture(canvas);
      const infoLogAspect = canvas.width / canvas.height;
      const infoLogPlaneGeometry = new THREE.PlaneGeometry(16, 16 / infoLogAspect);
      const infoLogPlaneMaterial = new THREE.MeshBasicMaterial({ map: this.infoLogTexture, transparent: true });
      const infoLogPlane = new THREE.Mesh(infoLogPlaneGeometry, infoLogPlaneMaterial);

      // Position InfoLog Plane
      infoLogPlane.position.set(0, 2, 0);
      scene.add(infoLogPlane);

      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
    },
    async createInfoLogCanvas() {
      if (!this.infoLogContainer) {
        throw new Error('infoLogContainer is not defined');
      }

      return await html2canvas(this.infoLogContainer, {
        backgroundColor: null,
        scale: 2,
        ignoreElements: (element) => element.tagName === 'CANVAS' && element.hasAttribute('data-engine')
      });
    },
    async updateInfoLogTexture() {
      const canvas = await this.createInfoLogCanvas();
      this.infoLogTexture.image = canvas;
      this.infoLogTexture.needsUpdate = true;
    },
    setupPeriodicUpdate() {
      setInterval(this.updateInfoLogTexture, 5000); // Update every 5 seconds
    },
    async saveObjectsToBackend(objectToSave) {
      const apiUrl = process.env.VUE_APP_API_URL;
      try {
        console.log("saveObjectsToBackend - Saving object:", objectToSave); // Debug log for object data

        const response = await fetch(`${apiUrl}/objects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(objectToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to save object to backend');
        }

        console.log('Object saved to backend successfully');
      } catch (error) {
        console.error('Error saving object to backend:', error);
      }
    },
    async loadObjectsFromBackend() {
      const apiUrl = process.env.VUE_APP_API_URL;
      try {
        const response = await fetch(`${apiUrl}/objects`);

        if (!response.ok) {
          console.error('Error status:', response.status, response.statusText);
          throw new Error('Failed to load objects from backend');
        }

        const objects = await response.json();
        console.log('Loaded objects:', objects);

        const objectPromises = objects.map(obj => {
          if (obj.type === 'image') {
            return this.loadImageFromData(obj);
          } else if (obj.type === 'gif') {
            return this.loadGIFFromData(obj);
          } else if (obj.type === 'model') {
            return this.loadModelFromData(obj);
          }
        });
        await Promise.all(objectPromises);

      } catch (error) {
        console.error('Error loading objects from backend:', error);
      }
    },
    async addImage(filePath) {
      const textureLoader = new THREE.TextureLoader();

      console.log("addImage - filePath received:", filePath);

      // Use the filePath to load the image texture from the server
      textureLoader.load(
        `${process.env.VUE_APP_API_URL}${filePath}`, // Ensure your API URL is correctly set
        async (texture) => {
          // Calculate the aspect ratio of the image
          const aspect = texture.image.width / texture.image.height;
          const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect); // Adjust dimensions based on aspect ratio
          const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true // Enable transparency
          });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);

          // Position the plane in front of the camera
          const distance = 5; // Adjust as needed for your scene
          const vector = new THREE.Vector3(0, 0, -distance);
          vector.applyQuaternion(this.camera.quaternion);
          plane.position.copy(this.camera.position).add(vector);
          plane.lookAt(this.camera.position); // Make sure it faces the camera

          // Add the plane to the scene
          this.scene.add(plane);

          // Push the object with the correct structure
          const objectToSave = {
            type: 'image',
            filePath: filePath, // Ensure the filePath is assigned here
            position: plane.position.clone(),
            rotation: plane.rotation.clone(),
            uuid: plane.uuid
          };

          console.log("Adding object to scene and saving:", objectToSave);
          this.objects.push(objectToSave);

          // Save the updated objects list to the backend
          await this.saveObjectsToBackend(objectToSave);
        },
        undefined,
        (err) => {
          console.error('Error loading texture:', err); // Handle any loading errors
        }
      );
    },
    async addGIF(filePath) {
      console.log("addGIF - filePath received:", filePath);

      // Fetch the GIF file from the server
      const response = await fetch(`${process.env.VUE_APP_API_URL}${filePath}`);
      const arrayBuffer = await response.arrayBuffer();

      // Parse and decompress GIF frames (assuming `parseGIF` and `decompressFrames` functions are available)
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      // Set up canvas for rendering GIF frames
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const aspect = canvas.width / canvas.height;
      const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true // Enable transparency
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // Position the plane in front of the camera
      const distance = 5;
      const vector = new THREE.Vector3(0, 0, -distance);
      vector.applyQuaternion(this.camera.quaternion);
      plane.position.copy(this.camera.position).add(vector);
      plane.lookAt(this.camera.position);

      this.scene.add(plane);
      console.log("Plane added to the scene with GIF texture.");

      // Animate the GIF frames
      let frameIndex = 0;
      const animateGIF = () => {
        const frame = frames[frameIndex];
        context.putImageData(
          new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height),
          frame.dims.left,
          frame.dims.top
        );
        texture.needsUpdate = true;

        // Move to the next frame or loop back to the start
        frameIndex = (frameIndex + 1) % frames.length;

        const delayIsInMilliseconds = frame.delay < 10 ? false : true;
        const frameDelay = delayIsInMilliseconds ? frame.delay : frame.delay * 10;

        setTimeout(animateGIF, frameDelay); // Use delay for frame rate control
      };
      animateGIF();

      // Save the object with the correct structure to the backend
      const objectToSave = {
        type: 'gif',
        filePath: filePath,
        position: plane.position.clone(),
        rotation: plane.rotation.clone(),
        uuid: plane.uuid
      };

      console.log("Saving GIF object to backend:", objectToSave);
      this.objects.push(objectToSave);
      await this.saveObjectsToBackend(objectToSave);
    },
    async addModel(filePath, extension) {
      const loader = this.getLoader(extension);
      if (!loader) {
        console.error(`Unsupported model file type: ${extension}`);
        return;
      }

      console.log("addModel - filePath received:", filePath); // Debugging log

      // Load the model directly from the server file path
      const modelData = {
        type: 'model',
        extension,
        filePath,
        position: { x: 0, y: 0, z: 0 }, // Initial position placeholder
        rotation: { x: 0, y: 0, z: 0, order: 'XYZ' }, // Initial rotation placeholder
        uuid: THREE.MathUtils.generateUUID()
      };

      return new Promise((resolve) => {
        loader.load(
          `${process.env.VUE_APP_API_URL}${filePath}`,
          (model) => {
            // Determine whether model is a scene (e.g., GLTF) or directly usable object
            let sceneObject = model.scene || model;

            // Calculate the bounding box and limit the height
            const boundingBox = new THREE.Box3().setFromObject(sceneObject);
            const modelHeight = boundingBox.max.y - boundingBox.min.y;
            const maxHeight = 5; // Set your desired maximum height here

            console.log("Calculated model height:", modelHeight);

            // Scale down if the model's height exceeds maxHeight
            if (modelHeight > maxHeight) {
              const scale = maxHeight / modelHeight;
              sceneObject.scale.set(scale, scale, scale);
              console.log(`Model scaled by factor of ${scale} to fit within max height of ${maxHeight}`);
            }

            // Position the model in front of the camera
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

            this.scene.add(sceneObject); // Add the model to the scene
            this.objects.push(modelData); // Save reference to the model

            this.saveObjectsToBackend(modelData).then(() => {
              resolve(sceneObject); // Resolve the promise
            });
          },
          undefined,
          (err) => {
            console.error('Error loading model:', err); // Handle any loading errors
            resolve(null); // Resolve with null if there's an error
          }
        );
      });
    },
    loadImageFromData(obj) {
      const textureLoader = new THREE.TextureLoader();
      console.log('Loading image from data:', obj);

      if (obj.filePath) {
        textureLoader.load(
          `${process.env.VUE_APP_API_URL}${obj.filePath}`,
          (texture) => {
            // Check if texture image is loaded properly
            if (texture.image && texture.image.width && texture.image.height) {
              const aspect = texture.image.width / texture.image.height;
              const scale = obj.scale || 2; // Optionally use 'scale' property from obj, default to 2

              // Create plane geometry and material using the texture
              const planeGeometry = new THREE.PlaneGeometry(scale, scale / aspect);
              const planeMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true // Enable transparency
              });

              // Create and configure the plane mesh
              const plane = new THREE.Mesh(planeGeometry, planeMaterial);
              plane.position.copy(obj.position || new THREE.Vector3(0, 0, 0)); // Default position if not set
              plane.rotation.copy(obj.rotation || new THREE.Euler(0, 0, 0)); // Default rotation if not set

              this.scene.add(plane); // Add the plane to the scene

              // Save the object reference for future cleanup
              this.objects.push(plane);

              console.log(`Image ${obj.filePath} loaded and added to the scene.`);
            } else {
              console.error('Texture image dimensions unavailable for:', obj.filePath);
            }
          },
          undefined,
          (err) => {
            console.error(`Error loading texture from ${obj.filePath}:`, err);
          }
        );
      } else {
        console.error('No file path found for image object:', obj);
      }
    },
    async loadGIFFromData(obj) {
      console.log('Loading GIF from data:', obj);

      const response = await fetch(`${process.env.VUE_APP_API_URL}${obj.filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      // Create a canvas for rendering the GIF
      const canvas = document.createElement('canvas');
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      const ctx = canvas.getContext('2d');

      const texture = new THREE.CanvasTexture(canvas);
      const aspect = canvas.width / canvas.height;
      const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true // Enable transparency
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // Set position and rotation based on the object data
      plane.position.copy(obj.position || new THREE.Vector3(0, 0, 0));
      plane.rotation.copy(obj.rotation || new THREE.Euler(0, 0, 0));

      this.scene.add(plane);
      this.objects.push(plane);

      // Animate the GIF frames
      let frameIndex = 0;

      const animateGIF = () => {
        // Check for the delay of the current frame
        const frame = frames[frameIndex];
        const delayIsInMilliseconds = frame.delay < 10 ? false : true;
        const frameDelay = delayIsInMilliseconds ? frame.delay : frame.delay * 10;

        ctx.putImageData(
          new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          ),
          frame.dims.left,
          frame.dims.top
        );
        texture.needsUpdate = true;

        frameIndex = (frameIndex + 1) % frames.length;
        setTimeout(() => {
          requestAnimationFrame(animateGIF);
        }, frameDelay);
      };

      animateGIF();

      console.log(`GIF ${obj.filePath} loaded and added to the scene.`);
    },
    async loadModelFromData(obj) {
      console.log('Loading model from data:', obj); // Debugging log

      // Extract the file extension from the filePath
      const filePath = obj.filePath;
      const extension = filePath.split('.').pop().toLowerCase(); // Extract extension after last dot

      const loader = this.getLoader(extension);
      if (!loader) {
        console.error(`No loader available for extension: ${extension}`);
        return;
      }

      const url = `${process.env.VUE_APP_API_URL}${obj.filePath}`;

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            let sceneObject = gltf.scene ? gltf.scene : gltf;

            // Set position and rotation
            sceneObject.position.set(obj.position.x, obj.position.y, obj.position.z);
            sceneObject.rotation.set(obj.rotation._x, obj.rotation._y, obj.rotation._z, obj.rotation._order);
            sceneObject.uuid = obj.uuid;

            // Calculate bounding box and limit the height
            const boundingBox = new THREE.Box3().setFromObject(sceneObject);
            const modelHeight = boundingBox.max.y - boundingBox.min.y;
            const maxHeight = 5; // Set your desired maximum height here

            // Scale down if the model's height exceeds maxHeight
            if (modelHeight > maxHeight) {
              const scale = maxHeight / modelHeight;
              sceneObject.scale.set(scale, scale, scale);
            }

            this.scene.add(sceneObject);
            resolve(sceneObject);
          },
          undefined,
          (error) => {
            console.error('Error loading model:', error);
            reject(error);
          }
        );
        console.log(`Model ${obj.filePath} loaded and added to the scene.`);
      });
    },
    getLoader(extension) {
      console.log(`getLoader called with extension: ${extension}`); // Add logging
      switch (extension.toLowerCase()) {
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
          console.error(`Unsupported model file type: ${extension}`);
          return null;
      }
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