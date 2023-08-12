// @ts-nocheck
export default function calculateIntersection(left, right, xOffset, yOffset) {
  let leftRect = {x: 0, y: 0, w: 0, h: 0}
  let rightRect = {x: 0, y: 0, w: 0, h: 0}
  if (xOffset > 0) {
    leftRect.x = xOffset
    leftRect.w = left.width - xOffset
    rightRect.x = 0
    rightRect.w = leftRect.w
  } else {
    leftRect.x = 0
    leftRect.w = right.width + xOffset
    rightRect.x = -xOffset
    rightRect.w = leftRect.w
  }
  if (yOffset > 0) {
    leftRect.y = yOffset
    leftRect.h = left.height - yOffset
    rightRect.y = 0
    rightRect.h = leftRect.h
  } else {
    leftRect.y = 0
    leftRect.h = right.height + yOffset
    rightRect.y = -yOffset
    rightRect.h = leftRect.h
  }
  return [leftRect, rightRect]
}
