module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          node: process.versions.node
        },
        useBuiltIns: "entry",
      },
    ],
  ],
}
