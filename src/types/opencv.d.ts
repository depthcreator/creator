// Minimal declarations for the subset of opencv.js (loaded globally in
// index.html) that this app uses. Not a complete typing of OpenCV.
declare namespace cv {
  class Mat {
    constructor()
    cols: number
    rows: number
    data: Uint8Array
    type(): number
    channels(): number
    depth(): number
    empty(): boolean
    delete(): void
  }

  interface Point {
    x: number
    y: number
  }

  interface KeyPoint {
    pt: Point
  }

  class KeyPointVector {
    constructor()
    size(): number
    get(index: number): KeyPoint
    delete(): void
  }

  interface DMatch {
    distance: number
    queryIdx: number
    trainIdx: number
  }

  class DMatchVector {
    constructor()
    size(): number
    get(index: number): DMatch
    push_back(match: DMatch): void
    delete(): void
  }

  class DMatchVectorVector {
    constructor()
    size(): number
    get(index: number): DMatchVector
    delete(): void
  }

  class ORB {
    constructor()
    detectAndCompute(image: Mat, mask: Mat, keypoints: KeyPointVector, descriptors: Mat): void
    delete(): void
  }

  class BFMatcher {
    constructor()
    knnMatch(queryDescriptors: Mat, trainDescriptors: Mat, matches: DMatchVectorVector, k: number): void
    delete(): void
  }

  class Scalar {
    constructor(...values: number[])
  }

  class Size {
    constructor(width: number, height: number)
  }

  const COLOR_BGR2GRAY: number
  const CV_32FC2: number
  const RANSAC: number
  const INTER_LANCZOS4: number
  const BORDER_CONSTANT: number

  function matFromArray(rows: number, cols: number, type: number, array: number[]): Mat
  function estimateAffine2D(
    from: Mat,
    to: Mat,
    inliers: Mat,
    method: number,
    ransacReprojThreshold: number,
    maxIters: number,
    confidence: number,
    refineIters: number
  ): Mat
  function imread(source: HTMLImageElement | HTMLCanvasElement | string): Mat
  function getRotationMatrix2D(center: Point, angle: number, scale: number): Mat
  function warpAffine(
    src: Mat,
    dst: Mat,
    M: Mat,
    dsize: Size,
    flags: number,
    borderMode: number,
    borderValue: Scalar
  ): void
  function imshow(canvas: HTMLCanvasElement | string, mat: Mat): void
  function cvtColor(src: Mat, dst: Mat, code: number): void
  function drawMatches(
    img1: Mat,
    keypoints1: KeyPointVector,
    img2: Mat,
    keypoints2: KeyPointVector,
    matches: DMatchVector,
    outImg: Mat,
    matchColor?: Scalar
  ): void
}
