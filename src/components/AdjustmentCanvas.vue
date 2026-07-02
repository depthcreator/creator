<template>
  <canvas ref="canvas" height="0" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup"></canvas>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect, onUnmounted } from "vue"

interface AlignmentState {
  left: HTMLImageElement | null
  right: HTMLImageElement | null
  leftName: string
  rightName: string
  xOffset: number
  yOffset: number
  rotation: number
}

const props = defineProps<{
  alignmentState: AlignmentState
}>()

const canvas = ref(null as HTMLCanvasElement | null)

function draw(left: HTMLImageElement, right: HTMLImageElement, xOffset: number, yOffset: number, rotation: number) {
  canvas.value!.width = left.width
  canvas.value!.height = left.height

  let context = canvas.value!.getContext('2d')!
  context.globalAlpha = 0.5

  context.drawImage(left, 0, 0, left.width, left.height, 0, 0, left.width, left.height)
  context.save()
  context.translate(xOffset + right.width / 2, yOffset + right.height / 2)
  context.rotate(rotation * Math.PI / 180)
  context.drawImage(right, -right.width / 2, -right.height / 2)
  context.restore()
}

onMounted(() => {
  watchEffect(() => {
    if (props.alignmentState.left && props.alignmentState.right) {
      draw(props.alignmentState.left, props.alignmentState.right, props.alignmentState.xOffset, props.alignmentState.yOffset, props.alignmentState.rotation)
    } else {
      canvas.value!.height = 0
    }
  })
  document.body.addEventListener('keydown', keydown)
})
onUnmounted(() => document.body.removeEventListener('keydown', keydown))

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
    case 'q':
      props.alignmentState.rotation = Math.round((props.alignmentState.rotation - 0.1) * 100) / 100
      break
    case 'e':
      props.alignmentState.rotation = Math.round((props.alignmentState.rotation + 0.1) * 100) / 100
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
</style>