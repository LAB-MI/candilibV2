module.exports = {
  apps: [{
    name: 'API',
    script: 'dist/index.js',
    instances: 2,
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: false,
    log_file: '/dev/stdout',
    out_file: '/dev/stdout',
    error_file: '/dev/stdout',
    merge_logs: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  },
  {
    name: 'AUTOMATE',
    script: 'dist/automate/index.js',
    instances: 1,
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true,
    log_file: '/dev/stdout',
    out_file: '/dev/stdout',
    error_file: '/dev/stdout',
    merge_logs: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}
