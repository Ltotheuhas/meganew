// src/composables/useThree.js
import * as THREE from 'three'
import { onMounted, onBeforeUnmount } from 'vue'

export function useThree(containerRef) {
    THREE.Cache.enabled = true;

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false
    })

    let animReq

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function onWheel(e) {
        camera.fov = Math.max(5, Math.min(175, camera.fov + e.deltaY * 0.05))
        camera.updateProjectionMatrix()
    }

    onMounted(() => {
        // Rotation order to avoid gimbal lock
        camera.rotation.order = 'YXZ'

        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0xffffff, 1)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

        containerRef.value.appendChild(renderer.domElement)

        scene.add(new THREE.AmbientLight(0xffffff))
        scene.add(new THREE.GridHelper(20, 20))
        scene.add(new THREE.AxesHelper(6))

        camera.position.set(0, 2, 2)
        window.addEventListener('resize', onResize)
        window.addEventListener('wheel', onWheel)
    })

    onBeforeUnmount(() => {
        cancelAnimationFrame(animReq)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('wheel', onWheel)

        // dispose renderer & DOM
        renderer.dispose()
        if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement)
        }

        // dispose scene geometries/materials
        scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
                mats.forEach(m => {
                    for (const key of ['map', 'alphaMap', 'aoMap', 'bumpMap', 'emissiveMap', 'roughnessMap']) {
                        if (m[key]) m[key].dispose()
                    }
                    m.dispose()
                })
            }
        })
    })

    return { scene, camera, renderer }
}
