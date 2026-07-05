export interface Point {
  x: number
  y: number
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const len = sorted.length
  const mid = Math.ceil(len / 2)

  return len % 2 == 0 ? (sorted[mid] + sorted[mid - 1]) / 2 : sorted[mid - 1]
}

export function calculateOffsets(leftPoints: Point[], rightPoints: Point[]): [number[], number[]] {
  const xd = leftPoints.map((l, i) => l.x - rightPoints[i].x)
  const yd = leftPoints.map((l, i) => l.y - rightPoints[i].y)

  return [xd, yd]
}
