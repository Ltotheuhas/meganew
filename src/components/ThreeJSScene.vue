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


      function animate() {
        requestAnimationFrame(animate);
        updateLOD();
        renderer.render(scene, camera);
      }
      animate();
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
