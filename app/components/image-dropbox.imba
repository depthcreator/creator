tag image-dropbox
	css .dropbox w:100px h:100px bd:solid bw:1px pos:relative
		.preview max-width:100% max-height:100%
		.input pos:absolute w:100% h:100% o:0
		.origin d:none

	prop useImageCallback
	prop image

	def useImage(e)
		let file = e.target.files[0]
		let url = URL.createObjectURL(file)
		$origin.src = url
		$origin.onload = do
			useImageCallback($origin, file)
			imba.commit!

	def rendered
		if image && image.src
			$preview.src = image.src
		else
			$preview.src = ""

	<self.dropbox>
		<input.input type="file" @change=(useImage)>
		<img$preview.preview>
		<img$origin.origin>
