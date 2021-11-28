tag image-dropbox
	css .dropbox w:100px h:100px bd:solid bw:1px pos:relative
		.preview max-width:100% max-height:100%
		.input pos:absolute w:100% h:100% o:0
		.origin d:none

	prop useImageCallback

	def useImage(e)
		let url = URL.createObjectURL(e.target.files[0])
		$preview.src = url
		$origin.src = url
		$origin.onload = do
			console.log("onload")
			useImageCallback($origin)
			imba.commit!

	<self.dropbox>
		<input.input type="file" @change=(useImage)>
		<img$preview.preview>
		<img$origin.origin>
