<template>
    <div>
      <div ref="threeContainer" class="three-container"></div>
      <button @click="toggleMenu">Upload Files</button>
      <UploadMenu v-if="showMenu" @upload="handleUpload" />
    </div>
  </template>
  
  <script>
  import * as THREE from 'three';
  import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
  import UploadMenu from '@/components/UploadMenu.vue';
  
  export default {
    components: {
      UploadMenu,
    },
    data() {
      return {
        showMenu: false,
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
      };
    },
    mounted() {
      this.initThreeJS();
    },
    methods: {
      initThreeJS() {
        const container = this.$refs.threeContainer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
  
        const light = new THREE.AmbientLight(0xffffff);
        this.scene.add(light);
  
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        document.addEventListener('click', () => this.controls.lock());
  
        const animate = () => {
          requestAnimationFrame(animate);
          this.renderer.render(this.scene, this.camera);
        };
        animate();
  
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
  
        this.camera.position.set(0, 2, 5);
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
      handleUpload(file) {
        // Handle different file types
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
      },
      addImage(url) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
          const aspect = texture.image.width / texture.image.height;
          const planeGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
          const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.position.set(0, 0, 0); // Adjust position as needed
          this.scene.add(plane);
        });
      },
      addAudio(url) {
        // Create a button or a 3D object that represents the audio file
        const audio = new Audio(url);
        const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0, 0); // Adjust position as needed
  
        // Add click event to play audio
        button.userData = { onClick: () => audio.play() };
        this.scene.add(button);
      },
      addModel(url) {
        const loader = new THREE.GLTFLoader();
        loader.load(url, (gltf) => {
          gltf.scene.position.set(0, 0, 0); // Adjust position as needed
          this.scene.add(gltf.scene);
        });
      },
    },
  };
  </script>
  
  <style>
  .three-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  </style>
  