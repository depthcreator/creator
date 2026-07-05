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

export interface RigidMotion {
  // radians, counterclockwise about the origin
  angle: number
  tx: number
  ty: number
}

// least-squares rotation + translation with scale locked to 1 (Kabsch),
// mapping src points onto dst points: dst ≈ R(angle)·src + t
export function solveRigidMotion(src: Point[], dst: Point[]): RigidMotion | null {
  if (src.length < 2) return null

  const sc = {x: 0, y: 0}
  const dc = {x: 0, y: 0}
  for (let i = 0; i < src.length; i++) {
    sc.x += src[i].x / src.length
    sc.y += src[i].y / src.length
    dc.x += dst[i].x / dst.length
    dc.y += dst[i].y / dst.length
  }

  let sinSum = 0
  let cosSum = 0
  for (let i = 0; i < src.length; i++) {
    const sx = src[i].x - sc.x
    const sy = src[i].y - sc.y
    const dx = dst[i].x - dc.x
    const dy = dst[i].y - dc.y
    sinSum += sx * dy - sy * dx
    cosSum += sx * dx + sy * dy
  }
  const angle = Math.atan2(sinSum, cosSum)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  return {
    angle,
    tx: dc.x - (cos * sc.x - sin * sc.y),
    ty: dc.y - (sin * sc.x + cos * sc.y),
  }
}
