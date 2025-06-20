<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject }
    from 'three/examples/jsm/renderers/CSS3DRenderer.js';

defineProps(['scene', 'camera', 'container']);

onMounted(() => {
    const d = 5, PHONE_W = 360;
    const cssScene = new THREE.Scene();
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(cssRenderer.domElement);

    const iframe = document.createElement('iframe');
    iframe.src = 'https://megaworld.xyz/';
    iframe.style.width = PHONE_W + 'px';
    iframe.style.border = 'none';
    iframe.style.pointerEvents = 'none';

    const obj = new CSS3DObject(iframe);
    const extent = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    obj.scale.setScalar(extent / camera.aspect / PHONE_W);
    obj.quaternion.copy(camera.quaternion);
    obj.position.copy(camera.position)
        .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(d));
    cssScene.add(obj);

    // piggy-back on main render loop
    function renderCSS() { cssRenderer.render(cssScene, camera); requestAnimationFrame(renderCSS); }
    renderCSS();
});
</script>
