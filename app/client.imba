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

global css button
	bd: 1px solid indigo5
	background-color: indigo7
	box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px -1px, rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px
	c: #fff
	ta: center
	p: 8px
	fs: 0.9rem
	mt: 10px
global css button@hover
	bgc: indigo5
global css button@active
	bgc: indigo7

global css a
	c: #fff

tag app
	state = {
		left: null
		right: null
		leftName: ""
		rightName: ""
		xOffset: 0
		yOffset: 0}
	currentTab = 'adjustment' // one of ['adjustment', 'matches']

	def processAlign
		if state.left && state.right
			try
				log("User: Automatic align")
				let [xOffset, yOffset] = align(state.left, state.right, 0.7)
				console.log(xOffset, yOffset)
				state.xOffset = xOffset
				state.yOffset = yOffset
			catch e
				// if the matching process die, it is not rescueable
				window.alert(e)

	def metadata state
		"""
		\{
		  "left": "{state.leftName}",
		  "right": "{state.rightName}",
		  "xOffset": {state.xOffset},
		  "yOffset": {state.yOffset}
		\}
		"""

	def reset
		state.left = null
		state.right = null
		state.leftName = ""
		state.rightName = ""
		state.xOffset = 0
		state.yOffset = 0
		log "User: Dropbox reset"

	def swap
		[state.left, state.right] = [state.right, state.left]
		[state.leftName, state.rightName] = [state.rightName, state.leftName]
		state.xOffset = -state.xOffset
		state.yOffset = -state.yOffset
		log "User: Left-right swap"

	def viewStatus
		if state.xOffset >= 0
			'ParallelView'
		else
			'CrossView'

	def log message
		$logs.appendChild
			<div> message
		$logs.scrollTo(0, 100000)

	def downloadJPEG
		let canvas\HTMLCanvasElement = document.querySelector("canvas#preview")
		let a = <a href=(canvas.toDataURL("image/jpeg")) download="{state.leftName}_{state.rightName}.jpg">
		a.click!

	def downloadSeparateJPEG
		let canvas\HTMLCanvasElement = document.querySelector("canvas#preview")
		let context = $forSave.getContext('2d')
		let width = canvas.width / 2
		let height = canvas.height
		$forSave.width = width
		$forSave.height = height
		context.drawImage(canvas, 0, 0, width, height, 0, 0, width, height)
		let leftData = $forSave.toDataURL("image/jpeg")
		context.drawImage(canvas, width, 0, width, height, 0, 0, width, height)
		let rightData = $forSave.toDataURL("image/jpeg")
		(<a href=(leftData) download="{state.leftName}_{state.rightName}_left.jpg">).click!
		(<a href=(rightData) download="{state.leftName}_{state.rightName}_right.jpg">).click!

	<self>
		<global>
			<canvas#matches[w:0 h:0]>
			<canvas$forSave[w:0 h:0]>

		<div[d:flex h:100% max-width:1500px jc:center m:0 auto]>
			<div[max-width:240px min-width:120px flg:1]>
				<title-box title="Image Dropbox">
					<div[d:flex flw:wrap pl:5px pr:5px]>
						<div>
							<p> "Left"
							<image-dropbox image=state.left useImageCallback=(do(e, f) (state.left = e, state.leftName = f.name))>
						<div>
							<p> "Right"
							<image-dropbox image=state.right useImageCallback=(do(e, f) (state.right = e, state.rightName = f.name))>
					<div[ml:5px]>
						<button @click=reset> "Reset"


				<title-box title="Functions">
					<div[ml:5px]>
						<button @click=processAlign> "Automatic align"
						<br>
						<button @click=swap>
							<div> "Left-right swap"
							<div> "(currently {viewStatus!})"

				<title-box title="Links">
					<div[ml:5px]>
						<a href="https://github.com/depthgallery/creator" target="_blank"> <p> "GitHub Repo"
			<div[max-width:1000px min-width:300px flg:5]>
				<title-box title="Result Image">
					<preview-canvas alignmentState=state>

				<title-box title="Adjustment">
					<adjustment-canvas alignmentState=state>
		
			<div[flg:1 min-width:120px max-width:240px]>
				<title-box title="Logs">
					<div$logs[of:auto h:300px ml:5px fs:0.8rem]>
				<title-box title="Alignment Detail">
					<pre[ws:pre-wrap word-break:break-word]> metadata(state)
				<title-box title="Export">
					<div[ml:5px]>
						<button @click=downloadJPEG> "Download JPEG"
						<button @click=downloadSeparateJPEG> "Download Separate JPEG"
						<p> "You can also directly copy the result image."
			
imba.mount <app>
