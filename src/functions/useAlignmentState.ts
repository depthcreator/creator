import { reactive, computed, ref } from "vue"
import align from "./align"

interface AlignmentState {
  left: HTMLImageElement | null
  right: HTMLImageElement | null
  leftName: string
  rightName: string
  xOffset: number
  yOffset: number
}

export default function useAlignmentState(log: (message: string) => void) {
  const state = reactive({
    left: null,
    right: null,
    leftName: "",
    rightName: "",
    xOffset: 0,
    yOffset: 0
  } as AlignmentState)

  function processAlign() {
    if (state.left && state.right) {
      try {
        log("User: Automatic align")
        let [xOffset, yOffset] = align(state.left, state.right, 0.7)
        console.log(xOffset, yOffset)
        state.xOffset = xOffset
        state.yOffset = yOffset
      } catch(e) {
        // if the matching process die, it is not rescueable
        window.alert(e)
      }
    }
  }

  const metadata = computed(() => `{
  "left": "${state.leftName}",
  "right": "${state.rightName}",
  "xOffset": ${state.xOffset},
  "yOffset": ${state.yOffset}
}`)

  function reset() {
    state.left = null
    state.right = null
    state.leftName = ""
    state.rightName = ""
    state.xOffset = 0
    state.yOffset = 0
    log("User: Dropbox reset")
  }

  function swap() {
    const tempImage = state.left
    state.left = state.right
    state.right = tempImage
    const tempName = state.leftName
    state.leftName = state.rightName
    state.rightName = tempName
    state.xOffset = -state.xOffset
    state.yOffset = -state.yOffset
    log("User: Left-right swap")
  }

  const viewStatus = computed(() => state.xOffset >= 0 ? 'ParallelView' : 'CrossView')

  function downloadJPEG() {

  }

  function downloadSeparateJPEG() {

  }

  function setImage(name: 'left' | 'right', image: HTMLImageElement, file: File) {
    state[name] = image
    state[`${name}Name`] = file.name
  }

  return {
    state,
    processAlign,
    metadata,
    reset,
    swap,
    viewStatus,
    downloadJPEG,
    downloadSeparateJPEG,
    setImage,
  }
}