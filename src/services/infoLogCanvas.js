import html2canvas from 'html2canvas'
import * as THREE from 'three'

export async function createInfoLogTexture(containerEl) {
    const canvas = await html2canvas(containerEl, { backgroundColor: null, scale: 2 })
    return new THREE.CanvasTexture(canvas)
}

export async function updateInfoLog(texture, containerEl) {
    const canvas = await html2canvas(containerEl, { backgroundColor: null, scale: 2 })
    texture.image = canvas
    texture.needsUpdate = true
}

