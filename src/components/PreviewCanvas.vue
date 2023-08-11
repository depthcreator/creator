<template>

</template>

<script setup lang="ts">
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
</script>

<style scoped>

</style>