const VUE_APP_URL_API = 'http://' + process.env.API_HOST + (process.env.API_PORT ? ':' + process.env.API_PORT : '')

module.exports = {
  publicPath: '/candilib',
  outputDir: 'dist',

  devServer: {
    proxy: {
      '/api': {
        target: VUE_APP_URL_API || 'http://localhost:8000',
      },
    },
  },

  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {},
  },
}
