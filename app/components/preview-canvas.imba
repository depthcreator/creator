import calculateIntersection from  '../functions/calculateIntersection'

tag preview-canvas
	prop alignmentState

	def drawPreview canvas, left, right, xOffset, yOffset
		let context = canvas.getContext('2d')
		let [leftRect, rightRect] = calculateIntersection(left, right, xOffset, yOffset)
		canvas.width = leftRect.w * 2
		canvas.height = leftRect.h
		context.drawImage(left, leftRect.x, leftRect.y, leftRect.w, leftRect.h, 0, 0, leftRect.w, leftRect.h)
		context.drawImage(right, rightRect.x, rightRect.y, rightRect.w, rightRect.h, leftRect.w, 0, leftRect.w, leftRect.h)

	def rendered
		if alignmentState.left && alignmentState.right
			drawPreview($preview, alignmentState.left, alignmentState.right, alignmentState.xOffset, alignmentState.yOffset)

	<self>
		<canvas$preview[w:100%] height=0>
