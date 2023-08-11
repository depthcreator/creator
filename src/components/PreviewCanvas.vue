<template>
  <div ref="container" class="container">
    <div ref="widthHolder" style="width: 100%;"></div>
    <canvas ref="preview" id="preview" height="0"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
</script>

<style scoped>
.container {
  position: relative;
  text-align: center;
  height: 300px;
}
</style>