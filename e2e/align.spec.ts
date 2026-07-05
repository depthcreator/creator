import fs from 'node:fs'
import { test, expect, type Page, type Download } from '@playwright/test'

const EXPECTED_X = 12
const EXPECTED_Y = 7
const IMAGE_W = 400
const IMAGE_H = 300

// generate a feature-rich scene twice: right image shifted by (-dx, -dy)
// so that left.x - right.x medians to exactly (dx, dy)
function makeImage(page: Page, dx: number, dy: number): Promise<string> {
  return page.evaluate(([ox, oy]) => {
    const c = document.createElement('canvas')
    c.width = 400
    c.height = 300
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#888'
    ctx.fillRect(0, 0, 400, 300)
    ctx.translate(-ox, -oy)
    let seed = 42
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgb(${rand() * 255 | 0},${rand() * 255 | 0},${rand() * 255 | 0})`
      ctx.fillRect(rand() * 360 + 20, rand() * 260 + 20, rand() * 40 + 5, rand() * 40 + 5)
    }
    ctx.fillStyle = '#000'
    ctx.font = '20px sans-serif'
    for (let i = 0; i < 12; i++) {
      ctx.fillText('STEREO#' + i, rand() * 300 + 30, rand() * 260 + 30)
    }
    return c.toDataURL('image/png')
  }, [dx, dy])
}

const toBuffer = (dataUrl: string) => Buffer.from(dataUrl.split(',')[1], 'base64')

function waitForOffsets(page: Page, x: number, y: number) {
  return page.waitForFunction(
    ([ex, ey]) => {
      const text = document.querySelector('pre')?.textContent ?? ''
      return text.includes(`"xOffset": ${ex},`) && text.includes(`"yOffset": ${ey}`)
    },
    [x, y],
    { timeout: 60000 }
  )
}

// decode a downloaded jpeg in the page to check its real pixel size
function jpegDims(page: Page, download: Download) {
  return download.path().then((path) =>
    page.evaluate(
      (dataUrl) =>
        new Promise<[number, number]>((resolve) => {
          const img = new Image()
          img.onload = () => resolve([img.naturalWidth, img.naturalHeight])
          img.src = dataUrl
        }),
      'data:image/jpeg;base64,' + fs.readFileSync(path).toString('base64')
    )
  )
}

test('auto align finds exact offsets and exports match the preview', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    // the missing /favicon.ico 404 is a known pre-existing issue
    if (m.type() === 'error' && !m.location().url.includes('favicon')) {
      errors.push('console: ' + m.text())
    }
  })
  page.on('dialog', async (d) => {
    errors.push('dialog: ' + d.message())
    await d.dismiss()
  })
  const downloads: Download[] = []
  page.on('download', (d) => downloads.push(d))

  await page.goto('/')

  const leftPng = toBuffer(await makeImage(page, 0, 0))
  const rightPng = toBuffer(await makeImage(page, EXPECTED_X, EXPECTED_Y))

  const inputs = page.locator('input[type=file]')
  await inputs.nth(0).setInputFiles({ name: 'left.png', mimeType: 'image/png', buffer: leftPng })
  await inputs.nth(1).setInputFiles({ name: 'right.png', mimeType: 'image/png', buffer: rightPng })
  await expect(page.locator('pre')).toContainText('"right": "right.png"')

  // run align three times: repeat runs surface use-after-free / double-free
  // in the wasm heap that a single run can miss
  const alignButton = page.locator('button', { hasText: 'Automatic align' })
  for (let run = 1; run <= 3; run++) {
    if (run > 1) {
      // nudge the offset away from the expected value so we can tell
      // when this run's align has actually completed; arrow keys only
      // work while the adjustment canvas is focused
      await page.locator('canvas[tabindex]').focus()
      await page.keyboard.press('ArrowRight')
      await waitForOffsets(page, EXPECTED_X + 1, EXPECTED_Y)
    }
    await alignButton.click()
    await waitForOffsets(page, EXPECTED_X, EXPECTED_Y)
  }

  // input 400x300 at offset (12,7) -> intersection 388x293, side-by-side 776x293
  const resultW = (IMAGE_W - EXPECTED_X) * 2
  const resultH = IMAGE_H - EXPECTED_Y

  const previewSize = await page.evaluate(() => {
    const c = document.querySelector('.container canvas') as HTMLCanvasElement
    return [c.width, c.height]
  })
  expect(previewSize).toEqual([resultW, resultH])

  await page.locator('button', { hasText: 'Download JPEG' }).click()
  await expect.poll(() => downloads.length).toBe(1)
  await page.locator('button', { hasText: 'Download Separate JPEG' }).click()
  await expect.poll(() => downloads.length).toBe(3)

  const expected: [string, number, number][] = [
    ['left.png_right.png.jpg', resultW, resultH],
    ['left.png_right.png_left.jpg', resultW / 2, resultH],
    ['left.png_right.png_right.jpg', resultW / 2, resultH],
  ]
  for (const [i, [name, w, h]] of expected.entries()) {
    expect(downloads[i].suggestedFilename()).toBe(name)
    expect(await jpegDims(page, downloads[i])).toEqual([w, h])
  }

  expect(errors).toEqual([])
})
