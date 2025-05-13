// src/composables/useControls.js
import { onMounted, onBeforeUnmount } from 'vue'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

export function useControls(camera, domElement, joystickXRef, joystickYRef) {
    const controls = new PointerLockControls(camera, domElement)
    const move = { forward: false, backward: false, left: false, right: false }
    let speed = 10
    let lastTime = 0
    let touchStart = { x: 0, y: 0 }

    function onKeyDown(e) {
        switch (e.key) {
            case 'w': case 'W': case 'ArrowUp': move.forward = true; break
            case 's': case 'S': case 'ArrowDown': move.backward = true; break
            case 'a': case 'A': case 'ArrowLeft': move.left = true; break
            case 'd': case 'D': case 'ArrowRight': move.right = true; break
            case '+': case '=': speed += 2; console.log(`Speed: ${speed}`); break
            case '-': case '_': speed = Math.max(2, speed - 2); console.log(`Speed: ${speed}`); break
        }
    }
    function onKeyUp(e) {
        switch (e.key) {
            case 'w': case 'W': case 'ArrowUp': move.forward = false; break
            case 's': case 'S': case 'ArrowDown': move.backward = false; break
            case 'a': case 'A': case 'ArrowLeft': move.left = false; break
            case 'd': case 'D': case 'ArrowRight': move.right = false; break
        }
    }
    function onPointerError() {
        console.error('Pointer lock error')
    }
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            touchStart.x = e.touches[0].clientX
            touchStart.y = e.touches[0].clientY
        }
    }
    function onTouchMove(e) {
        if (e.touches.length === 1) {
            const dx = e.touches[0].clientX - touchStart.x
            const dy = e.touches[0].clientY - touchStart.y
            // yaw & pitch
            controls.getObject().rotation.y -= dx * 0.002
            controls.getObject().rotation.x -= dy * 0.002
            controls.getObject().rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, controls.getObject().rotation.x))
            touchStart.x = e.touches[0].clientX
            touchStart.y = e.touches[0].clientY
        }
    }

    function animate(time) {
        requestAnimationFrame(animate)
        const dt = (time - lastTime) / 1000
        lastTime = time

        const jx = joystickXRef.value
        const jy = joystickYRef.value

        if (jx || jy) {
            controls.moveForward(jy * speed * dt)
            controls.moveRight(jx * speed * dt)
        } else {
            if (move.forward) controls.moveForward(speed * dt)
            if (move.backward) controls.moveForward(-speed * dt)
            if (move.left) controls.moveRight(-speed * dt)
            if (move.right) controls.moveRight(speed * dt)
        }
    }

    onMounted(() => {
        document.addEventListener('pointerlockerror', onPointerError)
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        domElement.addEventListener('click', () => controls.lock())
        document.addEventListener('touchstart', onTouchStart)
        document.addEventListener('touchmove', onTouchMove)
        requestAnimationFrame(animate)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('pointerlockerror', onPointerError)
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('keyup', onKeyUp)
        document.removeEventListener('touchstart', onTouchStart)
        document.removeEventListener('touchmove', onTouchMove)
    })

    return { controls }
}
