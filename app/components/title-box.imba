tag title-box
	prop title = "Untitled"

	css	.box
		bgc: rgb(18, 18, 18)
		box-shadow: rgb(0 0 0 / 20%) 0px 2px 1px -1px, rgb(0 0 0 / 14%) 0px 1px 1px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px;
		background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05));
		padding-bottom: 20px;
		box-sizing: border-box
		rd: 4px
		m: 10px

	css .title
		margin: 0px 0px 0.35em
		font-family: Roboto, Helvetica, Arial, sans-serif
		font-weight: 400
		font-size: 1.2rem
		line-height: 1.334
		letter-spacing: 0em
		padding: 16px 16px 0px


	<self.box>
		<div.title> title
		<div>
			<slot>
