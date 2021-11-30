import './components/image-dropbox'
import './components/adjustment-canvas'
import './components/preview-canvas'
import './components/title-box'
import align from './functions/align'

global css html
	ff:sans
	bgc: rgb(32, 38, 45)
	c: #fff

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
				<title-box title="Image dropbox">
					<div>
						<p> "Left image dropbox"
						<image-dropbox useImageCallback=(do(e) state.left = e)>
					<div>
						<p> "Right image dropbox"
						<image-dropbox useImageCallback=(do(e) state.right = e)>
				<div>
					<button @click=processAlign> "Automatic align"
			<div[w:1000px]>
				<title-box title="Preview">
					<preview-canvas alignmentState=state>

				<title-box title="Adjustment">
					<adjustment-canvas alignmentState=state>
		
			<div[flg:1]>
				<button> "Save"
			
imba.mount <app>
