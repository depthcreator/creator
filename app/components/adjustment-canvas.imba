tag adjustment-canvas
	prop left
	prop right
	prop xOffset
	prop yOffset
	prop alignmentState

	widthInCanvas = 700

	def draw(left, right, xOffset, yOffset)
		$canvas.width = left.width
		$canvas.height = left.height

		let context = $canvas.getContext('2d')
		context.globalAlpha = 0.5

		context.drawImage(left, 0, 0, left.width, left.height, 0, 0, left.width, left.height)
		context.drawImage(right, 0, 0, right.width, right.height, xOffset, yOffset, right.width, right.height)

	def rendered
		if alignmentState.left && alignmentState.right
			draw(alignmentState.left, alignmentState.right, alignmentState.xOffset, alignmentState.yOffset)

	def keydown e
		switch e.key
			when 'ArrowUp'
				e.preventDefault!
				alignmentState.yOffset -=1
			when 'ArrowDown'
				e.preventDefault!
				alignmentState.yOffset +=1
			when 'ArrowLeft'
				e.preventDefault!
				alignmentState.xOffset -=1
			when 'ArrowRight'
				e.preventDefault!
				alignmentState.xOffset +=1

	<self>
		<global @keydown=keydown>
		<canvas$canvas[w:100%] height=0>
