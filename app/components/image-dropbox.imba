tag image-dropbox
	css .dropbox w:300px h:300px bd:solid bw:1px pos:relative
		.preview max-width:100% max-height:100%
		.input pos:absolute w:100% h:100% o:0.5
		.origin d:none

	prop useImageCallback

	imageSrc = ''

	def useImage(e)
		let url = URL.createObjectURL(e.target.files[0])
		imageSrc = url
		useImageCallback($origin)

	<self.dropbox>
		<input.input type="file" @change=(useImage)>
		<img$preview.preview src=imageSrc>
		<img$origin.origin src=imageSrc>
