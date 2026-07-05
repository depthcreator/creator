<template>
  <div ref="container" class="container">
    <div ref="widthHolder" style="width: 100%;"></div>
    <canvas ref="preview" height="0"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { renderResult } from '../functions/renderResult'
import type { AlignmentState } from '../functions/createAlignmentSession'

const props = defineProps<{
  alignmentState: AlignmentState
}>()

const container = ref(null as HTMLDivElement | null)
const widthHolder = ref(null as HTMLDivElement | null)
const preview = ref(null as HTMLCanvasElement | null)

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
      renderResult({
        left: props.alignmentState.left,
        right: props.alignmentState.right,
        xOffset: props.alignmentState.xOffset,
        yOffset: props.alignmentState.yOffset,
        rotation: props.alignmentState.rotation,
      }, preview.value!)
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