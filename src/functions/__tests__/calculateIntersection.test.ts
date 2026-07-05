import { describe, it, expect } from 'vitest'
import calculateIntersection from '../calculateIntersection'

describe('calculateIntersection', () => {
  it('returns full-size rects for zero offsets on same-size images', () => {
    const [leftRect, rightRect] = calculateIntersection(
      {width: 100, height: 80},
      {width: 100, height: 80},
      0,
      0
    )
    expect(leftRect).toEqual({x: 0, y: 0, w: 100, h: 80})
    expect(rightRect).toEqual({x: 0, y: 0, w: 100, h: 80})
  })

  it('crops the left image on positive offsets', () => {
    const [leftRect, rightRect] = calculateIntersection(
      {width: 100, height: 80},
      {width: 100, height: 80},
      10,
      5
    )
    expect(leftRect).toEqual({x: 10, y: 5, w: 90, h: 75})
    expect(rightRect).toEqual({x: 0, y: 0, w: 90, h: 75})
  })

  it('crops the right image on negative offsets', () => {
    const [leftRect, rightRect] = calculateIntersection(
      {width: 100, height: 80},
      {width: 100, height: 80},
      -10,
      -5
    )
    expect(leftRect).toEqual({x: 0, y: 0, w: 90, h: 75})
    expect(rightRect).toEqual({x: 10, y: 5, w: 90, h: 75})
  })

  it('handles mixed-sign offsets', () => {
    const [leftRect, rightRect] = calculateIntersection(
      {width: 100, height: 80},
      {width: 100, height: 80},
      10,
      -5
    )
    expect(leftRect).toEqual({x: 10, y: 0, w: 90, h: 75})
    expect(rightRect).toEqual({x: 0, y: 5, w: 90, h: 75})
  })

  it('produces rects of equal size for images of different dimensions', () => {
    const [leftRect, rightRect] = calculateIntersection(
      {width: 120, height: 80},
      {width: 100, height: 90},
      20,
      -10
    )
    expect(leftRect.w).toBe(rightRect.w)
    expect(leftRect.h).toBe(rightRect.h)
    expect(leftRect).toEqual({x: 20, y: 0, w: 100, h: 80})
    expect(rightRect).toEqual({x: 0, y: 10, w: 100, h: 80})
  })
})
