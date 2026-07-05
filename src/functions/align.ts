import { calculateOffsets, median, type Point } from './offsets'

function drawMatches(left: cv.Mat, leftKeyPoints: cv.KeyPointVector, right: cv.Mat, rightKeyPoints: cv.KeyPointVector, matches: cv.DMatchVector, canvasName: string) {
  let imMatches = new cv.Mat()
  let color = new cv.Scalar(0, 255, 0, 255)

  cv.drawMatches(left, leftKeyPoints, right, rightKeyPoints, matches, imMatches, color)
  cv.imshow(canvasName, imMatches)
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

export default function align(leftElement: HTMLImageElement, rightElement: HTMLImageElement, knnDistanceOption: number): [number, number] {
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
  drawMatches(left, leftKeyPoints, right, rightKeyPoints, goodMatches, 'matches')

  let [leftPoints, rightPoints] = extractPoints(goodMatches, leftKeyPoints, rightKeyPoints)

  let [xd, yd] = calculateOffsets(leftPoints, rightPoints)

  left.delete()
  right.delete()
  leftKeyPoints.delete()
  rightKeyPoints.delete()
  matches.delete()
  goodMatches.delete()

  console.log('median xd: ' + median(xd))
  console.log('median yd: ' + median(yd))
  return [Math.round(median(xd)), Math.round(median(yd))]
}
