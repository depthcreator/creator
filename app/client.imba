import './components/image-dropbox'
import './components/adjustment-canvas'
import './components/preview-canvas'
import align from './functions/align'

global css html
	ff:sans
	bgc: #111
	c: #eee

tag app
	state = {
		left: null
		right: null
		xOffset: 0
		yOffset: 0}

	css
		w:1000px
		m:0 auto

	def processAlign
		if state.left && state.right
			try
				let [xOffset, yOffset] = align(state.left, state.right, 0.5)
				console.log(xOffset, yOffset)
				state.xOffset = xOffset
				state.yOffset = yOffset
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
		<adjustment-canvas alignmentState=state>
		<canvas#matches[w:100%] height=0>
		<div> "Preview:"
			<preview-canvas alignmentState=state>

imba.mount <app>
