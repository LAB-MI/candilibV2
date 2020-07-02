const apiHost = process.env.API_HOST || 'localhost'
const apiPort = process.env.API_PORT || 8000

const VUE_APP_URL_API = 'http://' + apiHost + (apiPort ? ':' + apiPort : '')
const publicPath = process.env.VUE_APP_URL_PUBLIC_PATH || '/candilib'

module.exports = {
  publicPath: publicPath,
  outputDir: 'dist',

  runtimeCompiler: true,

  devServer: {
    proxy: {
      '/candilib/api': {
        pathRewrite: {
          [publicPath]: '',
        },
        target: VUE_APP_URL_API || 'http://localhost:8000',
      },
    },
  },

  chainWebpack (config) {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('svg-inline-loader')
      .loader('svg-inline-loader')

    const vueRule = config.module.rule('vue')

    vueRule
      .use('vue-loader')
      .tap(args => {
        args.compilerOptions.whitespace = 'condense'
      })
  },

  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {},
  },
}
