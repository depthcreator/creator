<template>
  <div class="hidden-canvas">
    <canvas id="matches" style="width: 0; height: 0;"></canvas>
    <canvas ref="forSave" style="width: 0; height: 0;"></canvas>
  </div>
  <main>
    <section class="first-column">
      <TitleBox title="Image Dropbox">
        <div class="images">
          <div>
            <p>Left</p>
            <ImageDropbox :image="state.left" @useImage="(e, f) => setImage('left', e, f)"/>
          </div>
          <div>
            <p>Right</p>
            <ImageDropbox :image="state.right" @useImage="(e, f) => setImage('right', e, f)"/>
          </div>
        </div>
        <div style="margin-left: 5px;">
          <button @click="reset">Reset</button>
        </div>
      </TitleBox>
      <TitleBox title="Functions">
        <div style="margin-left: 5px;">
          <button @click="processAlign">Automatic align</button>
          <br>
          <button @click="swap">
            <div>Left-right swap</div>
            <div>(currently {{ viewStatus }})</div>
          </button>
        </div>
      </TitleBox>
      <TitleBox title="Links">
        <div style="margin-left: 5px;">
          <a href="https://github.com/depthcreator/creator" target="_blank">
            <p>GitHub Repo</p>
          </a>
        </div>
      </TitleBox>
    </section>
    <section class="second-column">
      <TitleBox title="Result Image">
        <PreviewCanvas :alignmentState="state"/>
      </TitleBox>
      <TitleBox title="Adjustment (by mouse or arrow keys)">
        <AdjustmentCanvas :alignmentState="state"/>
      </TitleBox>
    </section>
    <section class="third-column">
      <TitleBox title="Logs">
        <div ref="logs" class="logs">
          <div v-for="message in logs">{{ message }}</div>
        </div>
      </TitleBox>
      <TitleBox title="Alignment Detail">
        <pre>{{ metadata }}</pre>
      </TitleBox>
      <TitleBox title="Export">
        <div style="margin-left: 5px;">
          <button @click="downloadJPEG">Download JPEG</button>
          <button @click="downloadSeparateJPEG">Download Separate JPEG</button>
          <p>You can also directly copy the result image.</p>
        </div>
      </TitleBox>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import TitleBox from './components/TitleBox.vue'
import ImageDropbox from './components/ImageDropbox.vue'
import useAlignmentState from './functions/useAlignmentState'
import PreviewCanvas from './components/PreviewCanvas.vue'
import AdjustmentCanvas from './components/AdjustmentCanvas.vue'

const logs = ref(null as HTMLDivElement | null)

const forSave = ref(null as HTMLCanvasElement | null)

function log(message: string) {
  logs.value!.innerHTML += `<div>${message}</div>`
  logs.value!.scrollTo(0, 100000)
}

const {
  state,
  processAlign,
  metadata,
  reset,
  swap,
  viewStatus,
  setImage,
} = useAlignmentState(log)

function download(href: string, filename: string) {
  let a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

function downloadJPEG() {
  let canvas = document.querySelector("canvas#preview") as HTMLCanvasElement
  download(canvas.toDataURL("image/jpeg"), `${state.leftName}_${state.rightName}.jpg`)
}

function downloadSeparateJPEG() {
  let canvas = document.querySelector("canvas#preview") as HTMLCanvasElement
  let context = forSave.value!.getContext('2d')!
  let width = canvas.width / 2
  let height = canvas.height
  forSave.value!.width = width
  forSave.value!.height = height
  context.drawImage(canvas, 0, 0, width, height, 0, 0, width, height)
  let leftData = forSave.value!.toDataURL("image/jpeg")
  context.drawImage(canvas, width, 0, width, height, 0, 0, width, height)
  let rightData = forSave.value!.toDataURL("image/jpeg")
  download(leftData, `${state.leftName}_${state.rightName}_left.jpg`)
  download(rightData, `${state.leftName}_${state.rightName}_right.jpg`)
}
</script>

<style scoped lang="scss">
.hidden-canvas {
  height: 0;
}
main {
  display: flex;
  height: 100%;
  max-width: 1500px;
  justify-content: space-between;
  margin: 0 auto;
  .first-column {
    max-width: 240px;
    min-width:120px;
    flex-grow: 1;
    .images {
      display: flex;
      flex-wrap: wrap;
      padding-left: 5px;
      padding-right: 5px;
    }
  }
  .second-column {
    max-width: 1000px;
    min-width:300px;
    flex-grow: 5;
  }
  .third-column {
    flex-grow: 1;
    min-width: 120px;
    max-width: 240px;
    pre {
      white-space: pre-wrap;
      word-break: break-word;;
    }
    .logs {
      overflow: auto;
      height: 300px;
      margin-left: 5px;
      font-size: 0.8rem;
    }
  }
}
</style>

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
