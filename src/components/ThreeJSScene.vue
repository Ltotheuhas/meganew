<template>
  <div ref="threeContainer" class="three-container" :class="{ blurred: blur }"></div>
</template>

<script>
import * as THREE from "three";
import {
  ref,
  onMounted,
} from "vue";
import { useThree } from "@/composables/useThree";
import { useControls } from "@/composables/useControls";
import { loadImage, loadGIF, loadVideo, loadModel } from "@/services/threeLoaders";
import { fetchObjects } from "@/services/objectService";
import { createSceneActions } from "@/services/sceneActions";

export default {
  name: "ThreeJSScene",
  props: { blur: { type: Boolean, default: false } },
  setup() {
    const ROOM = new URLSearchParams(location.search).get('room') || 'default';
    const threeContainer = ref(null);
    const { scene, camera, renderer } = useThree(threeContainer);
    // grab ALL the things useControls returns
    const { controls, joystickStart, joystickMove, joystickEnd } = useControls(
      camera,
      renderer.domElement
    );

    // Use your existing sceneActions to handle persistence
    const { addImage, addGIF, addModel } = createSceneActions(scene, camera, ROOM);

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
          new THREE.PlaneGeometry(8, 8 / aspect),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
          })
        );
        plane.position.set(0, 6, 0);
        scene.add(plane);
        (function rotate() {
          requestAnimationFrame(rotate);
          plane.rotation.y += 0.01;
        })();
      });

      // --- Rehydrate saved objects, now including images ---
      const objs = await fetchObjects(ROOM);
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
          const fp = obj.filePaths || {};
          const vurl = `${process.env.VUE_APP_API_URL}${fp.videoWebm || fp.videoMp4 || fp.original}`;
          (fp.videoWebm || fp.videoMp4 ? loadVideo : loadGIF)(scene, vurl, pos, rot);
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

        // hysteresis thresholds to avoid thrash
        const cur = plane.userData.currentTextureSize || 'large';
        let desiredSize = cur;
        if (dist > (cur === 'medium' ? 22 : 20)) desiredSize = "small";
        else if (dist > (cur === 'large' ? 10 : 8)) desiredSize = "medium";
        else if (dist <= 8) desiredSize = "large";

        // only swap if it’s different than what we’ve got
        if (desiredSize !== cur) {
          console.log(
            `Image ${plane.uuid
            }: switching from ${cur.toUpperCase()} → ${desiredSize.toUpperCase()}`
          );

          // build the URL and load it
          const url = `${process.env.VUE_APP_API_URL}${urls[desiredSize]}`;
          lodLoader.load(url, (texture) => {
            const old = plane.material.map;
            plane.material.map = texture;
            plane.material.needsUpdate = true;
            plane.userData.currentTextureSize = desiredSize;
            if (old && old.dispose) old.dispose();
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
  /*transition: filter 160ms ease;*/
}

.three-container.blurred {
  filter: blur(6px);
}
</style>
