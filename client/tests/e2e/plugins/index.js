// https://docs.cypress.io/guides/guides/plugins-guide.html

module.exports = (on, config) => {
  config.mailHogUrl = config.env.mailHogUrl || 'http://localhost:8025'

  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-dev-shm-usage')
      return launchOptions
    }

    return launchOptions
  })
  on('task', {
    log (message) {
      console.log(message)

      return null
    },
  })
  return config
}
