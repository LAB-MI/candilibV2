// https://docs.cypress.io/guides/guides/plugins-guide.html

module.exports = (on, config) => {
  config.mailHogUrl = config.env.mailHogUrl || 'http://localhost:8025'

  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'chrome') {
      args.push('--disable-dev-shm-usage')
      return args
    }

    return args
  })
  on('task', {
    log (message) {
      console.log(message)

      return null
    },
  })
  return config
}
