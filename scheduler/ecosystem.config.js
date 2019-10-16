module.exports = {
  apps: [{
    name: 'API',
    script: 'src/index.js',
    node_args: '-r esm --experimental-modules',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}
