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
	currentTab = 'adjustment' // one of ['adjustment', 'matches']

	def copyCanvas
		

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
		<global>
			<canvas#matches[w:0 h:0]>

		<div[d:flex h:100%]>
			<div[d:flex flg:1 fld:column]>
				<div>
					<p> "Left image dropbox"
					<image-dropbox useImageCallback=(do(e) state.left = e)>
				<div>
					<p> "Right image dropbox"
					<image-dropbox useImageCallback=(do(e) state.right = e)>
				<div>
					<button @click=processAlign> "Load and Auto Align"
			<div[w:1000px d:flex fld:column h:100%]>
				<div[h:50%]> "Preview:"
					<preview-canvas alignmentState=state>

				<div[h:50%]> "Adjustment:"
					<adjustment-canvas alignmentState=state>
		
			<div[flg:1]>
				<button> "Save"
			
imba.mount <app>
