module.exports = {
  apps: [{
    name: 'API',
    script: 'boot-dev.js',
    instances: 2,
    exec_mode: 'cluster',
    watch: ['src'],
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true,
    log_file: '/dev/null',
    out_file: '/dev/null',
    error_file: '/dev/null',
    merge_logs: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}
