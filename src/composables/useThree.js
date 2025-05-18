// src/composables/useThree.js
import * as THREE from 'three'
import { onMounted, onBeforeUnmount } from 'vue'

export function useThree(containerRef) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
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
        containerRef.value.appendChild(renderer.domElement)

        scene.add(new THREE.AmbientLight(0xffffff))
        scene.add(new THREE.GridHelper(20, 20))
        scene.add(new THREE.AxesHelper(5))

        camera.position.set(0, 2, 2)
        window.addEventListener('resize', onResize)
        window.addEventListener('wheel', onWheel)

        const loop = () => {
            animReq = requestAnimationFrame(loop)
            renderer.render(scene, camera)
        }
        animReq = requestAnimationFrame(loop)
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
