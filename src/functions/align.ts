// @ts-nocheck
function median(arr) {
  const len = arr.length
  const arrSort = arr.sort();
  const mid = Math.ceil(len / 2);

  const median =
    len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

  return median
}

function getMatStats(Mat, name) {
  let type = Mat.type()
  let channels = Mat.channels()
  let cols = Mat.cols
  let rows = Mat.rows
  let depth = Mat.depth()
  let baseline_colorspace = ""
  let baseline_matType = ""

  if (channels == 4) {
    baseline_colorspace = "RGBA or BGRA"
    if (type == 24) {
      baseline_matType = "CV_8UC4"
    }
    if (type == 25) {
      baseline_matType = "CV_8SC4"
    }
    if (type == 26) {
      baseline_matType = "CV_16UC4"
    }
    if (type == 27) {
      baseline_matType = "CV_16SC4"
    }
    if (type == 28) {
      baseline_matType = "CV_32SC4"
    }
    if (type == 29) {
      baseline_matType = "CV_32FC4"
    }
    if (type == 30) {
      baseline_matType = "CV_64FC4"
    }
  }
  if (channels == 3) {
    baseline_colorspace = "RGB, HSV or BGR"
    if (type == 16) {
      baseline_matType = "CV_8UC3"
    }
    if (type == 17) {
      baseline_matType = "CV_8SC3"
    }
    if (type == 18) {
      baseline_matType = "CV_16UC3"
    }
    if (type == 19) {
      baseline_matType = "CV_16SC3"
    }
    if (type == 20) {
      baseline_matType = "CV_32SC3"
    }
    if (type == 21) {
      baseline_matType = "CV_32FC3"
    }
    if (type == 22) {
      baseline_matType = "CV_64FC3"
    }
  }
  if (channels == 2) {
    baseline_colorspace = "unknown"
    if (type == 8) {
      baseline_matType = "CV_8UC2"
    }
    if (type == 9) {
      baseline_matType = "CV_8SC2"
    }
    if (type == 10) {
      baseline_matType = "CV_16UC2"
    }
    if (type == 11) {
      baseline_matType = "CV_16SC2"
    }
    if (type == 12) {
      baseline_matType = "CV_32SC2"
    }
    if (type == 13) {
      baseline_matType = "CV_32FC2"
    }
    if (type == 14) {
      baseline_matType = "CV_64FC2"
    }
  }
  if (channels == 1) {
    baseline_colorspace = "GRAY"
    if (type == 0) {
      baseline_matType = "CV_8UC1"
    }
    if (type == 1) {
      baseline_matType = "CV_8SC1"
    }
    if (type == 2) {
      baseline_matType = "CV_16UC1"
    }
    if (type == 3) {
      baseline_matType = "CV_16SC1"
    }
    if (type == 4) {
      baseline_matType = "CV_32SC1"
    }
    if (type == 5) {
      baseline_matType = "CV_32FC1"
    }
    if (type == 6) {
      baseline_matType = "CV_64FC1"
    }
  }

  console.log("MatName :(" + name + ") ", Mat)
  console.log("   MatStats:channels=" + channels + " type:" + type + " cols:" + cols + " rows:" + rows)
  console.log("   depth:" + depth + " colorspace:" + baseline_colorspace + " type:" + baseline_matType)
}

function drawMatches(left, leftKeyPoints, right, rightKeyPoints, matches, canvasName) {
  let imMatches = new cv.Mat()
  let color = new cv.Scalar(0,255,0, 255)

  cv.drawMatches(left, leftKeyPoints, right, rightKeyPoints, matches, imMatches, color)
  cv.imshow(canvasName, imMatches)
}

function filterMatches(matches, ratio) {
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
  }
  console.log(ratio)
  console.log("keeping ", counter, " points in good_matches vector out of ", matches.size(), " contained in this match vector:", matches)
  return goodMatches
}

function extractPoints(matches, leftKeyPoints, rightKeyPoints) {
  let leftPoints = []
  let rightPoints = []
  for (let i = 0; i < matches.size(); i++) {
    leftPoints.push(leftKeyPoints.get(matches.get(i).queryIdx).pt)
    rightPoints.push(rightKeyPoints.get(matches.get(i).trainIdx).pt)
  }

  return [leftPoints, rightPoints]
}

function calculateOffsets(leftPoints, rightPoints) {
  let xd = []
  let yd = []

  let d = leftPoints.map((l, i) => {
    let r = rightPoints[i]
    xd.push(l.x - r.x)
    yd.push(l.y - r.y)
  })

  return [xd, yd]
}

function detectAndMatch(leftMat, rightMat) {
  let leftGray = new cv.Mat()
  let rightGray = new cv.Mat()

  cv.cvtColor(leftMat, leftGray, cv.COLOR_BGR2GRAY)
  cv.cvtColor(rightMat, rightGray, cv.COLOR_BGR2GRAY)

  let leftKeyPoints = new cv.KeyPointVector()
  let rightKeyPoints = new cv.KeyPointVector()

  let leftDescriptors = new cv.Mat()
  let rightDescriptors = new cv.Mat()

  //let orb = new cv.AKAZE()
  let orb = new cv.ORB()

  // too large dimensions causes it to blow
  orb.detectAndCompute(leftGray, new cv.Mat(), leftKeyPoints, leftDescriptors)
  orb.detectAndCompute(rightGray, new cv.Mat(), rightKeyPoints, rightDescriptors)
  console.log("features detected")

  let bf = new cv.BFMatcher()
  let matches = new cv.DMatchVectorVector()
  bf.knnMatch(leftDescriptors, rightDescriptors, matches, 2)
  console.log("knn matched")


  return {
    leftKeyPoints,
    rightKeyPoints,
    matches
  }
}

export default function align(leftElement, rightElement, knnDistanceOption) {
  // the result might differ when read from image elements of different size
  // and a display:none image element will give slightly different result comparing to a full-size element for unknown reason
  let left = cv.imread(leftElement)
  //getMatStats(left, 'original left image')
  let right = cv.imread(rightElement)
  //getMatStats(right, 'original right image')

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

  console.log('median xd: ' + median(xd))
  console.log('median yd: ' + median(yd))
  return [Math.round(median(xd)), Math.round(median(yd))]
}
