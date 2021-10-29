tag align-canvas
	prop left
	prop right
	prop offset

	widthInCanvas = 700

	def draw(left, right, offset)
		let width = widthInCanvas
		let ratio = left.width / left.height
		$canvas.height = width / ratio

		let context = $canvas.getContext('2d')
		context.globalAlpha = 0.5

		context.drawImage(left, 0, 0, left.width, left.height, 0, 0, width, width / ratio)
		context.drawImage(right, 0, 0, right.width, right.height, offset, 0, width, width /ratio)

	def rendered
		if left && right
			draw(left, right, offset)

	<self>
		<canvas$canvas[w:1000px]>
