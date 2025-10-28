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
    const { controls, joystickStart, joystickMove, joystickEnd } = useControls(
      camera,
      renderer.domElement
    );

    const { addImage, addGIF, addModel } = createSceneActions(scene, camera, ROOM);

    const imagePlanes = [];
    const videoPlanes = [];

    function addImageWithLOD(uploadResult) {
      addImage(uploadResult, (mesh) => {
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
          const useVideo = (fp.videoWebm || fp.videoMp4);
          const loader = useVideo ? loadVideo : loadGIF;
          loader(scene, vurl, pos, rot, (mesh) => {
            if (useVideo) {
              // set up edge-trigger flags and stash a src we can restore on unload
              initVideoFlags(mesh);
              mesh.userData.src = vurl;
              videoPlanes.push(mesh);
            }
          });
        }
        else if (obj.type === "model") {
          loadModel(scene, url, pos, rot);
        }
      });


      setInterval(() => { updateLOD(); manageVideos(); }, 200);
      (function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); })();
    });

    const lodLoader = new THREE.TextureLoader();
    const tmpMat = new THREE.Matrix4();
    const frustum = new THREE.Frustum();

    function inView(obj) {
      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(tmpMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      return frustum.intersectsObject(obj);
    }

    function updateLOD() {
      imagePlanes.forEach((plane) => {
        const urls = plane.userData.textureUrls;
        if (!urls) return;

        // measure distance from camera to plane
        const dist = camera.position.distanceTo(plane.position);
        const visible = inView(plane);

        // hard unload far + out-of-view
        if (!visible && dist > 120) {
          if (plane.userData.currentTextureSize !== 'none') {
            const old = plane.material.map;
            plane.material.map = null;
            plane.userData.currentTextureSize = 'none';
            if (old && old.dispose) old.dispose();
          }
          return;
        }
        // restore if unloaded and close enough
        if (plane.userData.currentTextureSize === 'none' && dist < 40) {
          const url = `${process.env.VUE_APP_API_URL}${urls.medium || urls.large}`;
          lodLoader.load(url, (texture) => {
            plane.material.map = texture;
            plane.material.needsUpdate = true;
            plane.userData.currentTextureSize = 'medium';
          });
          return;
        }

        // hysteresis thresholds to avoid thrash
        const cur = plane.userData.currentTextureSize || 'large';
        let desiredSize = cur;
        if (!visible) desiredSize = 'small';
        else if (dist > (cur === 'medium' ? 22 : 20)) desiredSize = "small";
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

    // attach to each video mesh once
    function initVideoFlags(mesh) {
      if (!mesh.userData) mesh.userData = {};
      Object.assign(mesh.userData, {
        _playing: false,
        _pendingPlay: false,
        _lastToggleAt: 0,
      });
    }

    const TOGGLE_COOLDOWN_MS = 200;

    async function setVideoPlaying(mesh, shouldPlay) {
      const v = mesh.userData.video;
      if (!v) return;

      const now = performance.now();
      if (now - mesh.userData._lastToggleAt < TOGGLE_COOLDOWN_MS) return;

      if (shouldPlay) {
        if (mesh.userData._playing || mesh.userData._pendingPlay) return;
        mesh.userData._pendingPlay = true;
        mesh.userData._lastToggleAt = now;

        // make autoplay succeed
        v.muted = true;
        v.playsInline = true;
        v.autoplay = false;

        try {
          await v.play();
          mesh.userData._playing = true;
        } catch (_e) { void 0; } finally {
          mesh.userData._pendingPlay = false;
        }
      } else {
        if (!mesh.userData._playing) return;
        mesh.userData._lastToggleAt = now;
        try { v.pause(); } catch (_e) { void 0; }
        mesh.userData._playing = false;
      }
    }

    // --- Video budget manager ---
    const MAX_PLAYING = 8;
    const PAUSE_DIST = 45;
    const UNLOAD_DIST = 90;

    function pauseVideoMesh(m) {
      const v = m.userData.video; if (!v) return;
      if (!v.paused) v.pause();
      m.userData.videoState = 'paused';
    }

    function unloadVideoMesh(m) {
      const v = m.userData.video; if (!v) return;
      // ensure it's considered not playing
      m.userData._playing = false;
      try {
        v.pause();
        v.removeAttribute('src');
        v.load();
      } catch (e) { void 0; }

      const tex = m.material.map;
      if (tex) { tex.dispose(); m.material.map = null; }
      m.userData.videoState = 'unloaded';
    }

    function manageVideos() {
      const candidates = [];
      for (const m of videoPlanes) {
        const d = camera.position.distanceTo(m.position);
        const visible = inView(m);

        if (!visible && d > UNLOAD_DIST) {
          // fully unload far, out-of-view
          setVideoPlaying(m, false);
          unloadVideoMesh(m);
          continue;
        }

        if (!visible || d > PAUSE_DIST) {
          // pause but keep texture
          setVideoPlaying(m, false);
          continue;
        }

        // near & visible → candidate to play
        candidates.push([d, m]);
      }

      // play only the closest N
      candidates.sort((a, b) => a[0] - b[0]);
      let playing = 0;
      for (const [, m] of candidates) {
        if (playing < MAX_PLAYING) {
          // if previously unloaded, restore texture source
          if (m.userData.videoState === 'unloaded' && m.userData.src) {
            const v = m.userData.video;
            try {
              v.src = m.userData.src;
              m.material.map = new THREE.VideoTexture(v);
              m.material.map.colorSpace = THREE.SRGBColorSpace;
              m.material.map.minFilter = THREE.LinearFilter;
              m.material.map.magFilter = THREE.LinearFilter;
              m.material.map.generateMipmaps = false;
            } catch (_e) { void 0; }
          }
          setVideoPlaying(m, true);
          m.userData.videoState = 'playing';
          playing++;
        } else {
          setVideoPlaying(m, false);
          m.userData.videoState = 'paused';
        }
      }
    }

    // pause all videos when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) videoPlanes.forEach(pauseVideoMesh);
    });

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
