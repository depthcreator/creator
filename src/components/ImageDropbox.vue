<template>
  <div class="dropbox">
    <input class="input" type="file" @change="useImage">
    <img ref="preview" :src="image?.src || ''" class="preview">
    <img ref="origin" class="origin">
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
  image: HTMLImageElement | null
}>()
const emit = defineEmits<{
  (e: 'useImage', image: HTMLImageElement, file: File): void
}>()

const preview = ref(null as HTMLImageElement | null)
const origin = ref(null as HTMLImageElement | null)

// the object URL currently used by the origin image element; the previous
// one can only be revoked once the element has loaded its replacement
let currentUrl: string | null = null

function useImage(e: any) {
  let file = e.target.files[0] as File | undefined
  if (!file) return
  let url = URL.createObjectURL(file)
  origin.value!.src = url
  origin.value!.onload = function() {
    if (currentUrl) URL.revokeObjectURL(currentUrl)
    currentUrl = url
    emit('useImage', origin.value!, file)
  }
}

onUnmounted(() => {
  if (currentUrl) URL.revokeObjectURL(currentUrl)
})
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