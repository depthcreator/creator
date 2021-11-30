import calculateIntersection from  '../functions/calculateIntersection'

tag preview-canvas
	prop alignmentState

	def drawPreview canvas, left, right, xOffset, yOffset
		let context = canvas.getContext('2d')
		let [leftRect, rightRect] = calculateIntersection(left, right, xOffset, yOffset)
		console.log([leftRect, rightRect], [xOffset, yOffset])
		canvas.width = leftRect.w * 2
		canvas.height = leftRect.h
		context.drawImage(left, leftRect.x, leftRect.y, leftRect.w, leftRect.h, 0, 0, leftRect.w, leftRect.h)
		context.drawImage(right, rightRect.x, rightRect.y, rightRect.w, rightRect.h, leftRect.w, 0, leftRect.w, leftRect.h)

	def calculateHeight left, right
		Math.max(left.height, right.height) * ($widthHolder.clientWidth / (left.width + right.width))

	def calculateCanvasWidth maxWidth, maxHeight, canvas
		let ratio = canvas.width / canvas.height
		let widthByHeight = maxHeight * ratio
		Math.min(maxWidth, widthByHeight)

	def rendered
		if alignmentState.left && alignmentState.right
			drawPreview($preview, alignmentState.left, alignmentState.right, alignmentState.xOffset, alignmentState.yOffset)
			//let maxHeight = calculateHeight(alignmentState.left, alignmentState.right)
			let maxHeight = 300
			$container.style.maxHeight = maxHeight
			$preview.style.width = calculateCanvasWidth($widthHolder.clientWidth, maxHeight, $preview)
		else
			$preview.height = 0

	<self>
		<div$container[pos:relative ta:center h:300px]>
			<div$widthHolder[w:100%]>
			<canvas$preview height=0>
