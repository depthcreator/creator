import { describe, it, expect } from 'vitest'
import { median, calculateOffsets, solveRigidMotion } from '../offsets'

describe('median', () => {
  it('returns the middle value for an odd-length array', () => {
    expect(median([3, 1, 2])).toBe(2)
  })

  it('returns the average of the two middle values for an even-length array', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it('returns the only value for a single-element array', () => {
    expect(median([5])).toBe(5)
  })

  it('sorts numerically, not lexicographically', () => {
    // with the default string sort this would give 2 ("10" < "2" < "33")
    expect(median([10, 2, 33])).toBe(10)
  })

  it('handles negative values', () => {
    expect(median([-5, 3, -1])).toBe(-1)
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]
    median(input)
    expect(input).toEqual([3, 1, 2])
  })
})

describe('calculateOffsets', () => {
  it('returns per-point coordinate differences (left minus right)', () => {
    const [xd, yd] = calculateOffsets(
      [{x: 10, y: 20}, {x: 30, y: 40}],
      [{x: 4, y: 25}, {x: 32, y: 30}]
    )
    expect(xd).toEqual([6, -2])
    expect(yd).toEqual([-5, 10])
  })

  it('returns empty arrays for no points', () => {
    const [xd, yd] = calculateOffsets([], [])
    expect(xd).toEqual([])
    expect(yd).toEqual([])
  })
})

describe('solveRigidMotion', () => {
  it('recovers a pure translation with zero rotation', () => {
    const src = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 0, y: 10}]
    const dst = src.map(p => ({x: p.x + 5, y: p.y - 3}))
    const motion = solveRigidMotion(src, dst)!
    expect(motion.angle).toBeCloseTo(0)
    expect(motion.tx).toBeCloseTo(5)
    expect(motion.ty).toBeCloseTo(-3)
  })

  it('recovers a known rotation and translation', () => {
    const angle = 0.1
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const src = [{x: 3, y: 7}, {x: -20, y: 14}, {x: 8, y: -2}, {x: 15, y: 15}]
    const dst = src.map(p => ({x: cos * p.x - sin * p.y + 4, y: sin * p.x + cos * p.y - 6}))
    const motion = solveRigidMotion(src, dst)!
    expect(motion.angle).toBeCloseTo(angle)
    expect(motion.tx).toBeCloseTo(4)
    expect(motion.ty).toBeCloseTo(-6)
  })

  it('keeps scale locked to 1 for uniformly scaled points', () => {
    const src = [{x: -10, y: 0}, {x: 10, y: 0}]
    const dst = [{x: -20, y: 0}, {x: 20, y: 0}]
    const motion = solveRigidMotion(src, dst)!
    expect(motion.angle).toBeCloseTo(0)
    expect(motion.tx).toBeCloseTo(0)
    expect(motion.ty).toBeCloseTo(0)
  })

  it('returns null for fewer than two points', () => {
    expect(solveRigidMotion([{x: 1, y: 2}], [{x: 3, y: 4}])).toBeNull()
    expect(solveRigidMotion([], [])).toBeNull()
  })
})
