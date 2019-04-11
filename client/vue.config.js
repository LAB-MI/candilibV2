const apiHost = process.env.API_HOST || 'localhost'
const apiPort = process.env.API_PORT || 8000

const VUE_APP_URL_API = 'http://' + apiHost + (apiPort ? ':' + apiPort : '')

module.exports = {
  publicPath: '/candilib',
  outputDir: 'dist',

  devServer: {
    proxy: {
      '/candilib/api': {
        pathRewrite: {
          '/candilib': '',
        },
        target: VUE_APP_URL_API || 'http://localhost:8000',
      },
    },
  },

  chainWebpack (config) {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('html-loader')
      .loader('html-loader')
      .tap(options => ({
        minimize: true,
      }))
  },

  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {},
  },
}
