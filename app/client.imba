import './components/image-dropbox'
import './components/align-canvas'
import align from './functions/align'

global css html
	ff:sans

let state = 
	left: null
	right: null
	offset: 0

def processAlign
	if state.left && state.right
		align(state.left, state.right, 0.1)

tag app
	<self>
		<div[d:flex]>
			<div>
				<p> "Left image dropbox"
				<image-dropbox useImageCallback=(do(e) state.left = e)>
			<div>
				<p> "Right image dropbox"
				<image-dropbox useImageCallback=(do(e) state.right = e)>
		<align-canvas left=state.left right=state.right offset=state.offset>
		<canvas#matches[w:100%] height=0>
		<button @click=processAlign> "Align"

imba.mount <app>
