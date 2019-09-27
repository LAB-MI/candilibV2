// https://docs.cypress.io/guides/guides/plugins-guide.html

module.exports = (on, config) => {
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
  return Object.assign({}, config, {
    mailHogUrl: 'http://mailhog:8025',
  })
}
