<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import * as THREE from "three";
import {
  ref,
  onMounted,
} from "vue";
import { useThree } from "@/composables/useThree";
import { useControls } from "@/composables/useControls";
import { loadImage, loadGIF, loadModel } from "@/services/threeLoaders";
import { fetchObjects } from "@/services/objectService";
import { createSceneActions } from "@/services/sceneActions";
import { CSS3DRenderer, CSS3DObject }
  from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export default {
  name: "ThreeJSScene",
  setup() {
    const threeContainer = ref(null);
    const { scene, camera, renderer } = useThree(threeContainer);
    // grab ALL the things useControls returns
    const { controls, joystickStart, joystickMove, joystickEnd } = useControls(
      camera,
      renderer.domElement
    );

    // Use your existing sceneActions to handle persistence
    const { addImage, addGIF, addModel } = createSceneActions(scene, camera);

    // We'll keep track of every image plane you add for dynamic LOD swaps:
    const imagePlanes = [];

    // Wrap your addImage so we can capture the mesh when it's created:
    function addImageWithLOD(uploadResult) {
      addImage(uploadResult, (mesh) => {
        // mesh.userData.textureUrls was set in sceneActions
        imagePlanes.push(mesh);
      });
    }

    onMounted(async () => {
      const loader = new THREE.TextureLoader();
      loader.load(require("@/assets/megaworld.png"), (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 4 / aspect),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          })
        );
        plane.position.set(0, 4, 0);
        scene.add(plane);
        (function rotate() {
          requestAnimationFrame(rotate);
          plane.rotation.y += 0.01;
        })();
      });

      // --- Rehydrate saved objects, now including images ---
      const objs = await fetchObjects();
      objs.forEach((obj) => {
        const url =
          obj.type === "model"
            ? `${process.env.VUE_APP_API_URL}${obj.filePath}`
            : `${process.env.VUE_APP_API_URL}${obj.filePaths.original || obj.filePaths.large
            }`;
        const pos = new THREE.Vector3(
          obj.position.x,
          obj.position.y,
          obj.position.z
        );
        const rot = obj.rotation.isEuler
          ? new THREE.Euler(
            obj.rotation._x,
            obj.rotation._y,
            obj.rotation._z,
            obj.rotation._order
          )
          : obj.rotation;

        if (obj.type === "image") {
          // loadImage from threeLoaders adds the mesh immediately:
          loadImage(scene, url, pos, rot, (mesh) => {
            mesh.userData.textureUrls = obj.filePaths;
            mesh.userData.currentTextureSize = "large";
            imagePlanes.push(mesh);
          });
        } else if (obj.type === "gif") {
          loadGIF(scene, url, pos, rot);
        } else if (obj.type === "model") {
          loadModel(scene, url, pos, rot);
        }
      });

      const cssScene = new THREE.Scene();
      const cssRenderer = new CSS3DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0';
      cssRenderer.domElement.style.left = '0';
      cssRenderer.domElement.style.pointerEvents = 'none';   //  ← keeps pointer-lock
      threeContainer.value.appendChild(cssRenderer.domElement);

      const catcher = document.createElement('div');
      catcher.style.cssText = `
        position:absolute; inset:0;
        pointer-events:none;
        background:transparent;
        z-index:10;
      `;

      threeContainer.value.appendChild(catcher);

      catcher.addEventListener('click', () => {
        controls.lock();                      // enter pointer-lock
      });

      controls.addEventListener('unlock', () => {
        /* enable clicks again */
        catcher.style.pointerEvents = 'auto';
      });

      controls.addEventListener('lock', () => {
        /* once locked, don't eat any more clicks */
        catcher.style.pointerEvents = 'none';
      });

      catcher.style.pointerEvents = 'auto';

      /* distance in front of camera */
      const d = 2;

      /* viewport extents at that distance (world-units) */
      const vExtent = 2 * d *
        Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
      const hExtent = vExtent * camera.aspect;

      /* build the iframe */
      const frame = document.createElement('iframe');
      frame.src = 'https://megaworld.xyz/';     // stays live, GIF plays
      frame.style.border = 'none';
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.pointerEvents = 'none';

      /* ► inject <meta name="viewport" content="width=360"> once the page is ready */
      frame.addEventListener('load', () => {
        const doc = frame.contentDocument;              // same-origin → accessible
        if (doc && !doc.querySelector('meta[name=viewport]')) {
          const meta = doc.createElement('meta');
          meta.name = 'viewport';
          meta.content = `width=1000px`;
          doc.head.appendChild(meta);
          // If the site’s CSS looks at window.innerWidth on load, force a reflow:
          doc.defaultView.dispatchEvent(new Event('resize'));
        }
      });

      /* wrap in CSS3DObject — initial size = 1×1 CSS px */
      const cssObj = new CSS3DObject(frame);

      /* scale from CSS px to world-units
         CSS3DRenderer maps 1 world-unit == 1 CSS px at z = 0 / perspective 1000 */
      const SCALE = hExtent / window.innerWidth;   // world-units per CSS px
      cssObj.scale.setScalar(SCALE);

      /* face the camera and push forward d */
      cssObj.quaternion.copy(camera.quaternion);
      cssObj.position.copy(camera.position)
        .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(d));

      cssScene.add(cssObj);

      function animate() {
        requestAnimationFrame(animate);
        updateLOD();
        renderer.render(scene, camera);
        cssRenderer.render(cssScene, camera);   // ← add this line
      }
      animate();

      window.addEventListener('resize', () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        cssRenderer.setSize(w, h);

        /* recompute world extents & rescale */
        const v = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
        const hWorld = v * camera.aspect;
        const scale = hWorld / w;
        cssObj.scale.setScalar(scale);
      });

      controls.addEventListener('unlock', () => {
        catcher.style.display = 'block';
      });
    });

    const lodLoader = new THREE.TextureLoader();

    function updateLOD() {
      imagePlanes.forEach((plane) => {
        const urls = plane.userData.textureUrls;
        if (!urls) return; // skip any plane without LOD data

        // measure distance from camera to plane
        const dist = camera.position.distanceTo(plane.position);

        // pick which LOD we want
        let desiredSize;
        if (dist > 20) desiredSize = "small";
        else if (dist > 8) desiredSize = "medium";
        else desiredSize = "large";

        // only swap if it’s different than what we’ve got
        const current = plane.userData.currentTextureSize;
        if (desiredSize !== current) {
          console.log(
            `Image ${plane.uuid
            }: switching from ${current.toUpperCase()} → ${desiredSize.toUpperCase()}`
          );

          // build the URL and load it
          const url = `${process.env.VUE_APP_API_URL}${urls[desiredSize]}`;
          lodLoader.load(url, (texture) => {
            plane.material.map = texture;
            plane.material.needsUpdate = true;
            plane.userData.currentTextureSize = desiredSize;
          });
        }
      });
    }

    // Insert our LOD step into the render loop
    (function animateLoop() {
      requestAnimationFrame(animateLoop);
      updateLOD();
      renderer.render(scene, camera);
    })();

    return {
      threeContainer,
      controls,
      joystickStart,
      joystickMove,
      joystickEnd,
      addImage: addImageWithLOD,
      addGIF,
      addModel,
    };
  },
};
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.three-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
