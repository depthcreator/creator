import './components/image-dropbox'
import './components/align-canvas'
import align from './functions/align'

global css html
	ff:sans
	bgc: #111
	c: #eee

let state = 
	left: null
	right: null
	xOffset: 0
	yOffset: 0

def calculateIntersection(left, right, xOffset, yOffset)
	let leftRect = {x: 0, y: 0, w: 0, h: 0}
	let rightRect = {x: 0, y: 0, w: 0, h: 0}
	if xOffset > 0
		leftRect.x = xOffset
		leftRect.w = left.width - xOffset
		rightRect.x = 0
		rightRect.w = leftRect.w
	else
		leftRect.x = 0
		leftRect.w = right.width + xOffset
		rightRect.x = xOffset
		rightRect.w = leftRect.w
	if yOffset > 0
		leftRect.y = yOffset
		leftRect.h = left.height - yOffset
		rightRect.y = 0
		rightRect.h = leftRect.h
	else
		leftRect.y = 0
		leftRect.h = right.height + yOffset
		rightRect.y = yOffset
		rightRect.h = leftRect.h
	[leftRect, rightRect]

tag app
	css
		w:1000px
		m:0 auto

	def drawPreview canvas, left, right, xOffset, yOffset
		let context = canvas.getContext('2d')
		let [leftRect, rightRect] = calculateIntersection(left, right, xOffset, yOffset)
		canvas.width = leftRect.w * 2
		canvas.height = leftRect.h
		context.drawImage(left, leftRect.x, leftRect.y, leftRect.w, leftRect.h, 0, 0, leftRect.w, leftRect.h)
		context.drawImage(right, rightRect.x, rightRect.y, rightRect.w, rightRect.h, leftRect.w, 0, leftRect.w, leftRect.h)

	def processAlign
		if state.left && state.right
			try
				let [xOffset, yOffset] = align(state.left, state.right, 0.5)
				console.log(xOffset, yOffset)
				state.xOffset = xOffset
				state.yOffset = yOffset
				drawPreview($preview, state.left, state.right, state.xOffset, state.yOffset)
			catch e
				// if the matching process die, it is not rescueable
				console.log(e)

	<self>
		<div[d:flex]>
			<div>
				<p> "Left image dropbox"
				<image-dropbox useImageCallback=(do(e) state.left = e)>
			<div>
				<p> "Right image dropbox"
				<image-dropbox useImageCallback=(do(e) state.right = e)>
			<div>
				<button @click=processAlign> "Load and Auto Align"
				<button> "Load for Manually Align"
		<align-canvas left=state.left right=state.right xOffset=state.xOffset yOffset=state.yOffset>
		<canvas#matches[w:100%] height=0>
		<div> "Preview:"
			<canvas$preview[w:100%] height=0>

imba.mount <app>
