import { test, expect } from '@playwright/test'

// the OpenCV Lanczos export path must rotate in the same direction and about
// the same pivot as the canvas preview path; a wrong rotation sign would
// displace an off-center mark ~10px between the two outputs
test('opencv export rotation matches the canvas rotation geometry', async ({ page }) => {
  await page.goto('/')

  const result = await page.evaluate(async () => {
    const { loadOpenCV } = await import('/src/functions/opencv.ts')
    // renderResultLanczos is tested directly so the geometry stays pinned
    // even while LANCZOS_EXPORT_ENABLED keeps it out of the download path
    const { renderResult, renderResultLanczos } = await import('/src/functions/renderResult.ts')
    await loadOpenCV()

    const scene = document.createElement('canvas')
    scene.width = 400
    scene.height = 300
    const ctx = scene.getContext('2d')!
    ctx.fillStyle = '#888'
    ctx.fillRect(0, 0, 400, 300)
    ctx.fillStyle = '#000'
    ctx.fillRect(290, 40, 20, 20)
    const image = new Image()
    image.src = scene.toDataURL('image/png')
    await new Promise((resolve) => { image.onload = resolve })

    const state = { left: image, right: image, xOffset: 0, yOffset: 0, rotation: 2 }
    const canvasResult = renderResult(state)
    const opencvResult = renderResultLanczos(state)

    // centroid of the dark mark within the right half; the alpha check
    // excludes the transparent corner wedges the rotation leaves uncovered
    function centroid(canvas: HTMLCanvasElement): [number, number] {
      const half = canvas.width / 2
      const data = canvas.getContext('2d')!.getImageData(half, 0, half, canvas.height).data
      let sx = 0, sy = 0, n = 0
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < half; x++) {
          const i = (y * half + x) * 4
          if (data[i + 3] > 128 && data[i] < 64) {
            sx += x
            sy += y
            n++
          }
        }
      }
      return [sx / n, sy / n]
    }

    return {
      canvas: centroid(canvasResult),
      opencv: centroid(opencvResult),
      identical: canvasResult.toDataURL() === opencvResult.toDataURL(),
    }
  })

  // mark center (300, 50) rotated +2° about (200, 150), minus 0.5 to convert
  // the continuous coordinate to a mean pixel index
  const expected = [302.93, 53.05]
  for (const mark of [result.canvas, result.opencv]) {
    expect(Math.abs(mark[0] - expected[0])).toBeLessThan(1.5)
    expect(Math.abs(mark[1] - expected[1])).toBeLessThan(1.5)
  }
  expect(Math.abs(result.canvas[0] - result.opencv[0])).toBeLessThan(1)
  expect(Math.abs(result.canvas[1] - result.opencv[1])).toBeLessThan(1)
  // byte-identical output would mean the opencv path silently fell back to
  // the canvas resampler instead of running Lanczos
  expect(result.identical).toBe(false)
})
