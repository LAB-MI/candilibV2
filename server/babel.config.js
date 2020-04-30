module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: process.versions.node,
        },
      },
    ],
  ],
  plugins: [
    'dynamic-import-node',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-optional-chaining',
  ],
  sourceMaps: 'both',
}
