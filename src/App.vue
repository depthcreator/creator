<template>
  <div class="hidden-canvas">
    <canvas ref="matchesCanvas" style="width: 0; height: 0;"></canvas>
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
          <button @click="processAlign" :disabled="opencvStatus === 'loading'">
            <div>Automatic align</div>
            <div v-if="opencvStatus === 'loading'">(loading OpenCV...)</div>
            <div v-else-if="opencvStatus === 'error'">(load failed, click to retry)</div>
          </button>
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
      <TitleBox title="Adjustment (drag, or focus + arrow keys; Q/E to rotate)">
        <AdjustmentCanvas :alignmentState="state"/>
      </TitleBox>
    </section>
    <section class="third-column">
      <TitleBox title="Logs">
        <div ref="logsContainer" class="logs">
          <div v-for="(message, index) in logs" :key="index">{{ message }}</div>
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
import { ref, watch, nextTick } from 'vue'
import TitleBox from './components/TitleBox.vue'
import ImageDropbox from './components/ImageDropbox.vue'
import { createAlignmentSession } from './functions/createAlignmentSession'
import { useOpenCV } from './functions/opencv'
import { renderResult, extractHalf } from './functions/renderResult'
import PreviewCanvas from './components/PreviewCanvas.vue'
import AdjustmentCanvas from './components/AdjustmentCanvas.vue'

const matchesCanvas = ref(null as HTMLCanvasElement | null)
const logsContainer = ref(null as HTMLDivElement | null)

const { opencvStatus } = useOpenCV()

const {
  state,
  logs,
  processAlign,
  metadata,
  reset,
  swap,
  viewStatus,
  setImage,
} = createAlignmentSession({ debugMatchesCanvas: () => matchesCanvas.value })

watch(() => logs.value.length, async () => {
  await nextTick()
  logsContainer.value?.scrollTo(0, logsContainer.value.scrollHeight)
})

function download(href: string, filename: string) {
  let a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

function renderCurrentResult() {
  if (!state.left || !state.right) return null
  return renderResult({
    left: state.left,
    right: state.right,
    xOffset: state.xOffset,
    yOffset: state.yOffset,
    rotation: state.rotation,
  })
}

function downloadJPEG() {
  let canvas = renderCurrentResult()
  if (!canvas) return
  download(canvas.toDataURL("image/jpeg"), `${state.leftName}_${state.rightName}.jpg`)
}

function downloadSeparateJPEG() {
  let canvas = renderCurrentResult()
  if (!canvas) return
  download(extractHalf(canvas, 'left').toDataURL("image/jpeg"), `${state.leftName}_${state.rightName}_left.jpg`)
  download(extractHalf(canvas, 'right').toDataURL("image/jpeg"), `${state.leftName}_${state.rightName}_right.jpg`)
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
button:disabled {
  opacity: 0.5;
  background-color: var(--indigo7);
}

a {
  color: #fff;
}
</style>
