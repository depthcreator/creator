import './components/image-dropbox'
import './components/adjustment-canvas'
import './components/preview-canvas'
import './components/title-box'
import align from './functions/align'

global css html
	ff:sans
	bgc: rgb(32, 38, 45)
	c: #fff
	font-family: Helvetica, Arial, sans-serif

tag app
	state = {
		left: null
		right: null
		leftName: ""
		rightName: ""
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

	def metadata state
		JSON.stringify({leftName: state.leftName, rightName: state.rightName, xOffset: state.xOffset, yOffset: state.yOffset})

	def reset
		state.left = null
		state.right = null
		state.leftName = ""
		state.rightName = ""
		state.xOffset = 0
		state.rightName = 0

	<self>
		<global>
			<canvas#matches[w:0 h:0]>

		<div[d:flex h:100% max-width:1500px m:0 auto]>
			<div[w:15%]>
				<title-box title="Image dropbox">
					<div[d:flex flw:wrap]>
						<div>
							<p> "Left"
							<image-dropbox image=state.left useImageCallback=(do(e, f) (state.left = e, state.leftName = f.name))>
						<div>
							<p> "Right"
							<image-dropbox image=state.right useImageCallback=(do(e, f) (state.right = e, state.rightName = f.name))>
					<div>
						<button @click=reset> "Reset"


				<title-box title="Functions">
					<div>
						<button @click=processAlign> "Automatic align"
			<div[max-width:1000px flg:1]>
				<title-box title="Preview">
					<preview-canvas alignmentState=state>

				<title-box title="Adjustment">
					<adjustment-canvas alignmentState=state>
		
			<div[w:15%]>
				<title-box title="Logs">
				<title-box title="Alignment Data">
					<pre[ws:pre-wrap word-break:break-word]> metadata(state)
				<title-box title="Export">
					<button> "Save"
			
imba.mount <app>
