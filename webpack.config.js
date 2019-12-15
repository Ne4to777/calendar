module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	output: {
		filename: 'bundle.js'
	},
	devServer: {
		hot: true,
		watchContentBase: true,
	},
}
