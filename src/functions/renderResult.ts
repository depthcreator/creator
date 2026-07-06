import calculateIntersection from './calculateIntersection'

export interface RenderableState {
  left: HTMLImageElement
  right: HTMLImageElement | HTMLCanvasElement
  xOffset: number
  yOffset: number
  rotation: number
}

// draws the aligned side-by-side result at full resolution;
// pass a target to draw onto an existing canvas (e.g. the preview)
export function renderResult(state: RenderableState, target?: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = target ?? document.createElement('canvas')
  const context = canvas.getContext('2d')!
  const [leftRect, rightRect] = calculateIntersection(state.left, state.right, state.xOffset, state.yOffset)
  canvas.width = leftRect.w * 2
  canvas.height = leftRect.h
  context.drawImage(state.left, leftRect.x, leftRect.y, leftRect.w, leftRect.h, 0, 0, leftRect.w, leftRect.h)
  if (state.rotation === 0) {
    context.drawImage(state.right, rightRect.x, rightRect.y, rightRect.w, rightRect.h, leftRect.w, 0, leftRect.w, leftRect.h)
  } else {
    // same crop, but rotating the right image about its own center first
    context.save()
    context.beginPath()
    context.rect(leftRect.w, 0, leftRect.w, leftRect.h)
    context.clip()
    context.translate(leftRect.w - rightRect.x + state.right.width / 2, -rightRect.y + state.right.height / 2)
    context.rotate(state.rotation * Math.PI / 180)
    context.drawImage(state.right, -state.right.width / 2, -state.right.height / 2)
    context.restore()
  }
  return canvas
}

// rotates an image about its own center into a same-size canvas using
// OpenCV Lanczos resampling (sharper than the canvas bilinear rotation);
// returns null when the OpenCV runtime is not ready
function rotateWithOpenCV(image: HTMLImageElement | HTMLCanvasElement, degrees: number): HTMLCanvasElement | null {
  if (typeof (globalThis as any).cv?.Mat !== 'function') return null
  const src = cv.imread(image)
  const dst = new cv.Mat()
  // getRotationMatrix2D spins the opposite way from canvas rotate(), hence the negation
  const matrix = cv.getRotationMatrix2D({ x: image.width / 2, y: image.height / 2 }, -degrees, 1)
  cv.warpAffine(src, dst, matrix, new cv.Size(image.width, image.height), cv.INTER_LANCZOS4, cv.BORDER_CONSTANT, new cv.Scalar())
  const canvas = document.createElement('canvas')
  cv.imshow(canvas, dst)
  src.delete()
  dst.delete()
  matrix.delete()
  return canvas
}

// export-quality variant of renderResult: same geometry, but the rotation is
// resampled with Lanczos when OpenCV is available. Kept out of the live
// preview path because a full-resolution warp per keypress would lag.
export function renderResultHighQuality(state: RenderableState): HTMLCanvasElement {
  if (state.rotation !== 0) {
    const rotated = rotateWithOpenCV(state.right, state.rotation)
    if (rotated) return renderResult({ ...state, right: rotated, rotation: 0 })
  }
  return renderResult(state)
}

// extracts one eye's image from a rendered side-by-side result
export function extractHalf(result: HTMLCanvasElement, side: 'left' | 'right'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const width = result.width / 2
  const height = result.height
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.drawImage(result, side === 'left' ? 0 : width, 0, width, height, 0, 0, width, height)
  return canvas
}
