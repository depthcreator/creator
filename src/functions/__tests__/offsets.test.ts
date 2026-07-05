import { describe, it, expect } from 'vitest'
import { median, calculateOffsets } from '../offsets'

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
