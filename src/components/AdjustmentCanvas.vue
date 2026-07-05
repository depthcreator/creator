<template>
  <canvas ref="canvas" height="0" tabindex="0" @keydown="keydown" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue"
import type { AlignmentState } from "../functions/createAlignmentSession"

const props = defineProps<{
  alignmentState: AlignmentState
}>()

const canvas = ref(null as HTMLCanvasElement | null)

function draw(left: HTMLImageElement, right: HTMLImageElement, xOffset: number, yOffset: number) {
  canvas.value!.width = left.width
  canvas.value!.height = left.height

  let context = canvas.value!.getContext('2d')!
  context.globalAlpha = 0.5

  context.drawImage(left, 0, 0, left.width, left.height, 0, 0, left.width, left.height)
  context.drawImage(right, 0, 0, right.width, right.height, xOffset, yOffset, right.width, right.height)
}

onMounted(() => {
  watchEffect(() => {
    if (props.alignmentState.left && props.alignmentState.right) {
      draw(props.alignmentState.left, props.alignmentState.right, props.alignmentState.xOffset, props.alignmentState.yOffset)
    } else {
      canvas.value!.height = 0
    }
  })
})

function keydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      props.alignmentState.yOffset -=1
      break
    case 'ArrowDown':
      e.preventDefault()
      props.alignmentState.yOffset +=1
      break
    case 'ArrowLeft':
      e.preventDefault()
      props.alignmentState.xOffset -=1
      break
    case 'ArrowRight':
      e.preventDefault()
      props.alignmentState.xOffset +=1
      break
  }
}

const dragging = ref(false)
const startingPoint = ref({
  x: 0,
  y: 0
})
const startingOffset = ref({
  x: 0,
  y: 0
})

function mousedown(e: MouseEvent) {
  if (e.which == 1) {
    // not all browsers focus a tabindex element on click (e.g. Safari)
    canvas.value!.focus()
    dragging.value = true
    startingPoint.value = {x: e.screenX, y: e.screenY}
    startingOffset.value = {x: props.alignmentState.xOffset, y: props.alignmentState.yOffset}
  }
}

function mouseup() {
  dragging.value = false
}

function mousemove(e: MouseEvent) {
  if (dragging.value) {
    let ratio = canvas.value!.width / canvas.value!.clientWidth
    props.alignmentState.xOffset = startingOffset.value.x + Math.round((e.screenX - startingPoint.value.x) * ratio)
    props.alignmentState.yOffset = startingOffset.value.y + Math.round((e.screenY - startingPoint.value.y) * ratio)
  }
}
</script>

<style scoped lang="scss">
canvas {
  width: 100%;
  cursor: move;
}
canvas:focus {
  outline: 1px solid var(--indigo5);
}
</style>