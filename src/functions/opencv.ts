import { readonly, ref } from 'vue'

export type OpenCVStatus = 'idle' | 'loading' | 'ready' | 'error'

const status = ref<OpenCVStatus>('idle')

let loadPromise: Promise<void> | null = null

// opencv.js is an emscripten build: depending on the build the global `cv`
// ends up as the module itself (ready or not) or as a Promise of it.
function waitForRuntime(): Promise<void> {
  return new Promise((resolve, reject) => {
    const module = (globalThis as any).cv
    if (module instanceof Promise) {
      module.then((resolved: unknown) => {
        ;(globalThis as any).cv = resolved
        resolve()
      }, reject)
    } else if (typeof module?.Mat === 'function') {
      resolve()
    } else if (module) {
      module.onRuntimeInitialized = () => resolve()
    } else {
      reject(new Error('opencv.js loaded but did not define cv'))
    }
  })
}

export function loadOpenCV(): Promise<void> {
  if (!loadPromise) {
    status.value = 'loading'
    loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `${import.meta.env.BASE_URL}opencv.js`
      script.async = true
      script.onload = () => waitForRuntime().then(resolve, reject)
      script.onerror = () => reject(new Error('failed to load opencv.js'))
      document.head.appendChild(script)
    }).then(
      () => {
        status.value = 'ready'
      },
      (error) => {
        status.value = 'error'
        // allow a later call to retry the load
        loadPromise = null
        throw error
      }
    )
  }
  return loadPromise
}

export function useOpenCV() {
  loadOpenCV().catch(() => {})
  return { opencvStatus: readonly(status) }
}
