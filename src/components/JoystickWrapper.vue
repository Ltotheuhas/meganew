<template>
  <!-- forward all props + events -->
  <VueJoystick
    stickColor="lightgrey"
    size="100"
    throttle="100"
    ref="root"
    v-bind="props"
    @start="onStart"
    @move="onMove"
    @stop="onEnd"
  />
</template>

<script setup>
/* global defineEmits, defineProps */
import { ref, onMounted, onBeforeUnmount } from "vue";
import VueJoystick from "vue-joystick-component";

const props = defineProps({
  size: { type: [Number, String], default: 100 },
  stickColor: { type: String, default: "lightgrey" },
  throttle: { type: [Number, String], default: 100 },
});
const emit = defineEmits(["joystick-start", "joystick-move", "joystick-end"]);

const root = ref(null); // the joystick DOM node
const pid = ref(null); // pointerId of the finger that touched the stick

function onPointerDown(e) {
  pid.value = e.pointerId;
}
function onStart() {
  emit("joystick-start", { id: pid.value });
}
function onMove(v) {
  emit("joystick-move", { id: pid.value, dx: v.x, dy: v.y });
}
function onEnd() {
  emit("joystick-end", { id: pid.value });
  pid.value = null;
}

onMounted(() => {
  // tap into the underlying div the library renders
  root.value.$el.addEventListener("pointerdown", onPointerDown, {
    passive: false,
  });
});
onBeforeUnmount(() => {
  if (root.value)
    root.value.$el.removeEventListener("pointerdown", onPointerDown);
});
</script>
