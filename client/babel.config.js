module.exports = {
  presets: ['@vue/app'],
  env: {
    test: {
      presets: [['@babel/env', { targets: { node: 'current' } }]],
    },
  },
}
