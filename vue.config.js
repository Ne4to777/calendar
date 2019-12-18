module.exports = {
	publicPath: '/',
	devServer: {
		contentBase: './public',
		port: 3002,
	},
	filenameHashing: false,

	pages: {
		index: {
			entry: 'src/main-dev.js',
			template: 'src/index.ejs',
			filename: 'index.html'
		}
	},
	configureWebpack: {
		optimization: {
			splitChunks: false
		}
	}
}
