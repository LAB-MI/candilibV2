module.exports = {
  publicPath: '/candilib',
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}
