module.exports = {
  publicPath: '/candilib',
  outputDir: 'dist',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
      },
    },
  },
}
