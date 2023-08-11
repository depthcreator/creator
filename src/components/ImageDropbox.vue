<template>
  <div class="dropbox">
    <input class="input" type="file" @change="useImage">
    <img ref="preview" :src="image?.src || ''" class="preview">
    <img ref="origin" class="origin">
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  image: HTMLImageElement | null
}>()
const emit = defineEmits<{
  (e: 'useImage', image: HTMLImageElement, file: File): void
}>()

const preview = ref(null as HTMLImageElement | null)
const origin = ref(null as HTMLImageElement | null)

function useImage(e: any) {
  let file = e.target.files[0] as File
  let url = URL.createObjectURL(file)
  origin.value!.src = url
  origin.value!.onload = function() {
    emit('useImage', origin.value!, file)
  }
}
</script>

<style scoped>
.dropbox {
  width: 100px;
  height: 100px;
  border: solid;
  border-width: 1px;
  position: relative;
}
.preview {
  max-width: 100%;
  max-height: 100%;
}
.input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.origin {
  display: none;
}
</style>