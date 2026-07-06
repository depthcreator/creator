import { test } from '@playwright/test'

// Benchmark, not a regression test: canvas bilinear rotation vs the OpenCV
// Lanczos path at several realistic image sizes. Skipped by default; run with
//   BENCH=1 npx playwright test bench
//
// Reference results (headless Chromium, desktop, 2026-07-06) — the Lanczos
// warp is what keeps LANCZOS_EXPORT_ENABLED off in renderResult.ts:
//   1.1MP: canvas 2.5ms | lanczos total 110ms (warp 98ms,  linear warp 14ms)
//   4.3MP: canvas 10ms  | lanczos total 439ms (warp 385ms, linear warp 54ms)
//   12MP:  canvas 81ms  | lanczos total 1205ms (warp 1075ms, linear warp 144ms)
test('bench rotation resampling', async ({ page }) => {
  test.skip(!process.env.BENCH, 'benchmark only, set BENCH=1 to run')
  test.setTimeout(240000)
  await page.goto('/')

  const result = await page.evaluate(async () => {
    const { loadOpenCV } = await import('/src/functions/opencv.ts')
    const { renderResult, renderResultLanczos } = await import('/src/functions/renderResult.ts')
    await loadOpenCV()
    const cv = (globalThis as any).cv

    function makeImage(w: number, h: number): Promise<HTMLImageElement> {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      for (let y = 0; y < h; y += 64) {
        for (let x = 0; x < w; x += 64) {
          ctx.fillStyle = `rgb(${Math.random() * 255 | 0},${Math.random() * 255 | 0},${Math.random() * 255 | 0})`
          ctx.fillRect(x, y, 64, 64)
        }
      }
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = c.toDataURL('image/png')
      })
    }

    function bench(fn: () => void, n: number): number {
      fn() // warmup
      const t0 = performance.now()
      for (let i = 0; i < n; i++) fn()
      return (performance.now() - t0) / n
    }

    const out = []
    for (const [w, h] of [[1200, 900], [2400, 1800], [4000, 3000]]) {
      const img = await makeImage(w, h)
      const state = { left: img, right: img, xOffset: 3, yOffset: 2, rotation: 0.5 }
      const canvasMs = bench(() => renderResult(state), 5)
      const lanczosTotalMs = bench(() => renderResultLanczos(state), 3)

      // per-step breakdown of the OpenCV path
      let t = performance.now()
      const src = cv.imread(img)
      const imreadMs = performance.now() - t
      const matrix = cv.getRotationMatrix2D({ x: w / 2, y: h / 2 }, -0.5, 1)
      const dst = new cv.Mat()
      t = performance.now()
      cv.warpAffine(src, dst, matrix, new cv.Size(w, h), cv.INTER_LANCZOS4, cv.BORDER_CONSTANT, new cv.Scalar())
      const warpLanczosMs = performance.now() - t
      const dst2 = new cv.Mat()
      t = performance.now()
      cv.warpAffine(src, dst2, matrix, new cv.Size(w, h), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())
      const warpLinearMs = performance.now() - t
      const c2 = document.createElement('canvas')
      t = performance.now()
      cv.imshow(c2, dst)
      const imshowMs = performance.now() - t
      src.delete()
      dst.delete()
      dst2.delete()
      matrix.delete()

      out.push({
        size: `${w}x${h} (${(w * h / 1e6).toFixed(1)}MP)`,
        canvasMs: +canvasMs.toFixed(1),
        lanczosTotalMs: +lanczosTotalMs.toFixed(1),
        imreadMs: +imreadMs.toFixed(1),
        warpLanczosMs: +warpLanczosMs.toFixed(1),
        warpLinearMs: +warpLinearMs.toFixed(1),
        imshowMs: +imshowMs.toFixed(1),
      })
    }
    return out
  })

  console.log(JSON.stringify(result, null, 2))
})
