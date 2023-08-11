<template>
  <TitleBox title="abc">
    <ImageDropbox :image="state.left" @useImage="useImage"/>
  </TitleBox>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import TitleBox from './components/TitleBox.vue'
import ImageDropbox from './components/ImageDropbox.vue'

interface AlignmentState {
  left: HTMLImageElement | null
  right: HTMLImageElement | null
  leftName: string
  rightName: string
  xOffset: number
  yOffset: number
}

const state = reactive({
  left: null,
  right: null,
  leftName: "",
  rightName: "",
  xOffset: 0,
  yOffset: 0
} as AlignmentState)

function useImage(image: HTMLImageElement, file: File) {
  state.left = image
  state.leftName = file.name
}
</script>

<style>
:root {
  --indigo5: hsla(238.73,83.53%,66.67%,100%);
  --indigo7: hsla(244.52,57.94%,50.59%,100%);
  --teal9: hsla(175.93,60.82%,19.02%,100%);
}

html {
  background-color: rgb(32, 38, 45);
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
}

button {
  border: 1px solid var(--indigo5);
  background-color: var(--indigo7);
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px -1px, rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px;
  color: #fff;
  text-align: center;
  padding: 8px;
  font-size: 0.9rem;
  margin-top: 10px;
}
button:hover {
  background-color: var(--indigo5);
}
button:active {
  background-color: var(--indigo7);
}

a {
  color: #fff;
}
</style>