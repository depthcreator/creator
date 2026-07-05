import { reactive, computed, ref, nextTick } from "vue"
import align from "./align"
import { loadOpenCV } from "./opencv"

export interface AlignmentState {
  left: HTMLImageElement | null
  right: HTMLImageElement | null
  leftName: string
  rightName: string
  xOffset: number
  yOffset: number
  // degrees, applied to the right image about its own center
  rotation: number
}

export interface AlignmentSessionOptions {
  // where align() draws its feature-match debug view; a getter because
  // template refs are only filled after mount
  debugMatchesCanvas?: () => HTMLCanvasElement | null
}

export type AlignmentSession = ReturnType<typeof createAlignmentSession>

// each call creates an independent editing session; nothing is shared
// between sessions, so multiple editors can coexist
export function createAlignmentSession(options: AlignmentSessionOptions = {}) {
  const state = reactive({
    left: null,
    right: null,
    leftName: "",
    rightName: "",
    xOffset: 0,
    yOffset: 0,
    rotation: 0
  } as AlignmentState)

  const logs = ref<string[]>([])

  function log(message: string) {
    logs.value.push(message)
  }

  async function processAlign() {
    if (state.left && state.right) {
      try {
        log("User: Automatic align")
        await loadOpenCV()
        let {xOffset, yOffset, rotation} = align(state.left, state.right, 0.7, options.debugMatchesCanvas?.() ?? undefined)
        state.xOffset = xOffset
        state.yOffset = yOffset
        state.rotation = rotation
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
  "yOffset": ${state.yOffset},
  "rotation": ${state.rotation}
}`)

  function reset() {
    state.left = null
    state.right = null
    state.leftName = ""
    state.rightName = ""
    state.xOffset = 0
    state.yOffset = 0
    state.rotation = 0
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
    // exact only when rotation pivots match; close enough for the small
    // angles stereo pairs have — rerun Automatic align for a precise result
    state.rotation = -state.rotation
    log("User: Left-right swap")
  }

  const viewStatus = computed(() => state.xOffset >= 0 ? 'ParallelView' : 'CrossView')

  function setImage(name: 'left' | 'right', image: HTMLImageElement, file: File) {
    // Since the image element doesn't change when assigned a new src,
    // we need to set it null for vue to pick up the change.
    state[name] = null
    nextTick(() => {
      state[name] = image
      state[`${name}Name`] = file.name
    })
  }

  return {
    state,
    logs,
    log,
    processAlign,
    metadata,
    reset,
    swap,
    viewStatus,
    setImage,
  }
}
