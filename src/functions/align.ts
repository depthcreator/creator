import { calculateOffsets, median, solveRigidMotion, type Point } from './offsets'

export interface AlignResult {
  xOffset: number
  yOffset: number
  // degrees, applied to the right image about its own center
  rotation: number
}

function drawMatches(left: cv.Mat, leftKeyPoints: cv.KeyPointVector, right: cv.Mat, rightKeyPoints: cv.KeyPointVector, matches: cv.DMatchVector, canvas: HTMLCanvasElement) {
  let imMatches = new cv.Mat()
  let color = new cv.Scalar(0, 255, 0, 255)

  cv.drawMatches(left, leftKeyPoints, right, rightKeyPoints, matches, imMatches, color)
  cv.imshow(canvas, imMatches)
  imMatches.delete()
}

function filterMatches(matches: cv.DMatchVectorVector, ratio: number): cv.DMatchVector {
  let goodMatches = new cv.DMatchVector()

  let counter = 0;
  for (let i = 0; i < matches.size(); ++i) {
    let match = matches.get(i);
    let dMatch1 = match.get(0);
    let dMatch2 = match.get(1);

    if (dMatch1.distance / dMatch2.distance < ratio) {
      goodMatches.push_back(dMatch1)
      counter++
    }
    match.delete()
  }
  console.log(ratio)
  console.log("keeping ", counter, " points in good_matches vector out of ", matches.size(), " contained in this match vector:", matches)
  return goodMatches
}

function extractPoints(matches: cv.DMatchVector, leftKeyPoints: cv.KeyPointVector, rightKeyPoints: cv.KeyPointVector): [Point[], Point[]] {
  let leftPoints: Point[] = []
  let rightPoints: Point[] = []
  for (let i = 0; i < matches.size(); i++) {
    leftPoints.push(leftKeyPoints.get(matches.get(i).queryIdx).pt)
    rightPoints.push(rightKeyPoints.get(matches.get(i).trainIdx).pt)
  }

  return [leftPoints, rightPoints]
}

// Estimates a rigid-body transform (rotation + translation, scale locked
// to 1) mapping right points onto left points. opencv.js does not ship a
// rigid-body estimator, so RANSAC (via estimateAffine2D) rejects outlier
// matches first, then the optimal scale=1 rotation is solved on the
// inliers (Kabsch). The rotation is anchored at the right image center, so
// xOffset/yOffset stay comparable to the translation-only values the UI
// always used. Returns null when there are not enough usable matches.
function estimateRigidTransform(leftPoints: Point[], rightPoints: Point[], center: Point): AlignResult | null {
  let n = rightPoints.length
  if (n < 3) return null

  let srcData: number[] = []
  let dstData: number[] = []
  for (let i = 0; i < n; i++) {
    srcData.push(rightPoints[i].x, rightPoints[i].y)
    dstData.push(leftPoints[i].x, leftPoints[i].y)
  }
  let srcMat = cv.matFromArray(n, 1, cv.CV_32FC2, srcData)
  let dstMat = cv.matFromArray(n, 1, cv.CV_32FC2, dstData)
  let inlierMask = new cv.Mat()
  let M = cv.estimateAffine2D(srcMat, dstMat, inlierMask, cv.RANSAC, 3, 2000, 0.99, 10)

  let src: Point[] = []
  let dst: Point[] = []
  if (!M.empty()) {
    for (let i = 0; i < n; i++) {
      if (inlierMask.data[i]) {
        src.push(rightPoints[i])
        dst.push(leftPoints[i])
      }
    }
  }
  srcMat.delete()
  dstMat.delete()
  inlierMask.delete()
  M.delete()
  console.log("RANSAC kept " + src.length + " inliers out of " + n + " matches")

  let motion = solveRigidMotion(src, dst)
  if (!motion) return null

  let cos = Math.cos(motion.angle)
  let sin = Math.sin(motion.angle)
  // re-anchor the translation so the rotation pivots at the image center
  return {
    xOffset: Math.round(motion.tx + (cos * center.x - sin * center.y - center.x)),
    yOffset: Math.round(motion.ty + (sin * center.x + cos * center.y - center.y)),
    rotation: Math.round(motion.angle * 180 / Math.PI * 100) / 100
  }
}

function detectAndMatch(leftMat: cv.Mat, rightMat: cv.Mat) {
  let leftGray = new cv.Mat()
  let rightGray = new cv.Mat()

  cv.cvtColor(leftMat, leftGray, cv.COLOR_BGR2GRAY)
  cv.cvtColor(rightMat, rightGray, cv.COLOR_BGR2GRAY)

  let leftKeyPoints = new cv.KeyPointVector()
  let rightKeyPoints = new cv.KeyPointVector()

  let leftDescriptors = new cv.Mat()
  let rightDescriptors = new cv.Mat()

  let orb = new cv.ORB()
  let leftMask = new cv.Mat()
  let rightMask = new cv.Mat()

  // too large dimensions causes it to blow
  orb.detectAndCompute(leftGray, leftMask, leftKeyPoints, leftDescriptors)
  orb.detectAndCompute(rightGray, rightMask, rightKeyPoints, rightDescriptors)
  console.log("features detected")

  let bf = new cv.BFMatcher()
  let matches = new cv.DMatchVectorVector()
  bf.knnMatch(leftDescriptors, rightDescriptors, matches, 2)
  console.log("knn matched")

  leftGray.delete()
  rightGray.delete()
  leftMask.delete()
  rightMask.delete()
  leftDescriptors.delete()
  rightDescriptors.delete()
  orb.delete()
  bf.delete()

  return {
    leftKeyPoints,
    rightKeyPoints,
    matches
  }
}

export default function align(leftElement: HTMLImageElement, rightElement: HTMLImageElement, knnDistanceOption: number, debugCanvas?: HTMLCanvasElement): AlignResult {
  // the result might differ when read from image elements of different size
  // and a display:none image element will give slightly different result comparing to a full-size element for unknown reason
  let left = cv.imread(leftElement)
  let right = cv.imread(rightElement)

  console.log("images loaded")

  let {
    leftKeyPoints,
    rightKeyPoints,
    matches
  } = detectAndMatch(left, right)

  console.log("feature matched")

  let goodMatches = filterMatches(matches, knnDistanceOption)
  if (debugCanvas) drawMatches(left, leftKeyPoints, right, rightKeyPoints, goodMatches, debugCanvas)

  let [leftPoints, rightPoints] = extractPoints(goodMatches, leftKeyPoints, rightKeyPoints)

  let rigid = estimateRigidTransform(leftPoints, rightPoints, {x: right.cols / 2, y: right.rows / 2})

  left.delete()
  right.delete()
  leftKeyPoints.delete()
  rightKeyPoints.delete()
  matches.delete()
  goodMatches.delete()

  if (rigid) {
    console.log('rigid transform: ', rigid)
    return rigid
  }

  // fallback: translation-only estimate from the match offset medians
  let [xd, yd] = calculateOffsets(leftPoints, rightPoints)

  console.log('median xd: ' + median(xd))
  console.log('median yd: ' + median(yd))
  return {xOffset: Math.round(median(xd)), yOffset: Math.round(median(yd)), rotation: 0}
}
