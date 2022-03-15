const apiHost = process.env.API_HOST || 'localhost'
const apiPort = process.env.API_PORT || 8000

const VUE_APP_URL_API = 'http://' + apiHost + (apiPort ? ':' + apiPort : '')
const publicPath = process.env.VUE_APP_URL_PUBLIC_PATH || '/candilib'

module.exports = {
  publicPath: publicPath,
  outputDir: 'dist',
  productionSourceMap: false,
  runtimeCompiler: true,

  css: {
    extract: { ignoreOrder: true },
  },

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
  chainWebpack: config => {
    config.module.rules.delete('svg')
    const vueRule = config.module.rule('vue')

    vueRule
      .use('vue-loader')
      .tap(args => {
        args.compilerOptions.whitespace = 'condense'
      })
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'vue-svg-loader',
        },
      ],
    },
  },
}
