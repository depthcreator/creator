<template>
  <div ref="container" class="container">
    <div ref="widthHolder" style="width: 100%;"></div>
    <canvas ref="preview" id="preview" height="0"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import calculateIntersection from  '../functions/calculateIntersection'

interface AlignmentState {
  left: HTMLImageElement | null
  right: HTMLImageElement | null
  leftName: string
  rightName: string
  xOffset: number
  yOffset: number
}

const props = defineProps<{
  alignmentState: AlignmentState
}>()

const container = ref(null as HTMLDivElement | null)
const widthHolder = ref(null as HTMLDivElement | null)
const preview = ref(null as HTMLCanvasElement | null)

function drawPreview(canvas: HTMLCanvasElement, left: HTMLImageElement, right: HTMLImageElement, xOffset: number, yOffset: number) {
  let context = canvas.getContext('2d')!
  let [leftRect, rightRect] = calculateIntersection(left, right, xOffset, yOffset)
  canvas.width = leftRect.w * 2
  canvas.height = leftRect.h
  context.drawImage(left, leftRect.x, leftRect.y, leftRect.w, leftRect.h, 0, 0, leftRect.w, leftRect.h)
  context.drawImage(right, rightRect.x, rightRect.y, rightRect.w, rightRect.h, leftRect.w, 0, leftRect.w, leftRect.h)
}

function calculateHeight(left: HTMLImageElement, right: HTMLImageElement) {
  return Math.max(left.height, right.height) * (widthHolder.value!.clientWidth / (left.width + right.width))
}

function calculateCanvasWidth(maxWidth: number, maxHeight: number, canvas: HTMLCanvasElement) {
  let ratio = canvas.width / canvas.height
  let widthByHeight = maxHeight * ratio
  return Math.min(maxWidth, widthByHeight)
}

onMounted(() => {
  watchEffect(() => {
    if (props.alignmentState.left && props.alignmentState.right) {
      drawPreview(preview.value!, props.alignmentState.left, props.alignmentState.right, props.alignmentState.xOffset, props.alignmentState.yOffset)
      //let maxHeight = calculateHeight(props.alignmentState.left, props.alignmentState.right)
      let maxHeight = 300
      container.value!.style.maxHeight = `${maxHeight}px`
      preview.value!.style.width = `${calculateCanvasWidth(widthHolder.value!.clientWidth, maxHeight, preview.value!)}px`
    } else {
      preview.value!.height = 0
    }
  })
})
</script>

<style scoped>
.container {
  position: relative;
  text-align: center;
  height: 300px;
}
</style>