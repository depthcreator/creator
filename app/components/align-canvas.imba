tag align-canvas
	prop left
	prop right
	prop xOffset
	prop yOffset

	widthInCanvas = 700

	def draw(left, right, xOffset, yOffset)
		$canvas.width = left.width
		$canvas.height = left.height

		let context = $canvas.getContext('2d')
		context.globalAlpha = 0.5

		context.drawImage(left, 0, 0, left.width, left.height, 0, 0, left.width, left.height)
		context.drawImage(right, 0, 0, right.width, right.height, xOffset, yOffset, right.width, right.height)

	def rendered
		if left && right
			draw(left, right, xOffset, yOffset)

	<self>
		<canvas$canvas[w:100%] height=0>
