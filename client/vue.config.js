const apiHost = process.env.API_HOST || 'localhost'
const apiPort = process.env.API_PORT || 8000

const VUE_APP_URL_API = 'http://' + apiHost + (apiPort ? ':' + apiPort : '')

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
