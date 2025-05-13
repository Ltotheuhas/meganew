// src/composables/useControls.js
import { reactive, onMounted, onBeforeUnmount } from "vue";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export function useControls(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);
  const move = { forward: false, backward: false, left: false, right: false };
  const joy = reactive({ dx: 0, dy: 0 });
  const joyIds = new Set(); // ← holds the pointerId(s) on the joystick
  let speed = 10;
  let lastTime = 0;

  function onKeyDown(e) {
    switch (e.key) {
      case "w":
      case "W":
      case "ArrowUp":
        move.forward = true;
        break;
      case "s":
      case "S":
      case "ArrowDown":
        move.backward = true;
        break;
      case "a":
      case "A":
      case "ArrowLeft":
        move.left = true;
        break;
      case "d":
      case "D":
      case "ArrowRight":
        move.right = true;
        break;
      case "+":
      case "=":
        speed += 2;
        console.log(`Speed: ${speed}`);
        break;
      case "-":
      case "_":
        speed = Math.max(2, speed - 2);
        console.log(`Speed: ${speed}`);
        break;
    }
  }
  function onKeyUp(e) {
    switch (e.key) {
      case "w":
      case "W":
      case "ArrowUp":
        move.forward = false;
        break;
      case "s":
      case "S":
      case "ArrowDown":
        move.backward = false;
        break;
      case "a":
      case "A":
      case "ArrowLeft":
        move.left = false;
        break;
      case "d":
      case "D":
      case "ArrowRight":
        move.right = false;
        break;
    }
  }
  function onPointerError() {
    console.error("Pointer lock error");
  }

  function animate(time) {
    requestAnimationFrame(animate);
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    if (joy.dx || joy.dy) {
      controls.moveForward(joy.dy * speed * dt);
      controls.moveRight(joy.dx * speed * dt);
    } else {
      if (move.forward) controls.moveForward(speed * dt);
      if (move.backward) controls.moveForward(-speed * dt);
      if (move.left) controls.moveRight(-speed * dt);
      if (move.right) controls.moveRight(speed * dt);
    }
  }

  /* ---------- exported hooks for the joystick wrapper ---------- */
  function joystickStart({ id }) {
    joyIds.add(id);
  }
  function joystickMove({ dx, dy }) {
    joy.dx = dx;
    joy.dy = dy;
  }
  function joystickEnd({ id }) {
    joyIds.delete(id);
    joy.dx = joy.dy = 0;
  }

  /* ---------- mobile look-around with any non-joystick finger --- */
  const last = new Map(); // pointerId → {x,y}
  function onPtrDown(e) {
    if (joyIds.has(e.pointerId)) return;
    last.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  function onPtrMove(e) {
    e.preventDefault();
    if (!last.has(e.pointerId)) return;
    const l = last.get(e.pointerId);
    camera.rotation.y -= (e.clientX - l.x) * 0.002;
    camera.rotation.x -= (e.clientY - l.y) * 0.002;
    camera.rotation.x = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, camera.rotation.x)
    );
    last.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  function onPtrUp(e) {
    last.delete(e.pointerId);
  }

  onMounted(() => {
    document.addEventListener("pointerlockerror", onPointerError);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    domElement.addEventListener("click", () => controls.lock());
    window.addEventListener("pointerdown", onPtrDown, { passive: false });
    window.addEventListener("pointermove", onPtrMove, { passive: false });
    window.addEventListener("pointerup", onPtrUp);
    window.addEventListener("pointercancel", onPtrUp);
    requestAnimationFrame(animate);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("pointerlockerror", onPointerError);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("pointerdown", onPtrDown);
    window.removeEventListener("pointermove", onPtrMove);
    window.removeEventListener("pointerup", onPtrUp);
    window.removeEventListener("pointercancel", onPtrUp);
  });

  return {
    controls, // PointerLockControls instance
    joystickStart, // called from JoystickWrapper
    joystickMove,
    joystickEnd,
  };
}
