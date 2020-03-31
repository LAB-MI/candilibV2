
const https = require('https')
const lengthArgv = process.argv.length
const url = process.argv[lengthArgv - 1]

https.get(url, (res) => {
  let rawData = ''
  res.on('data', (chunk) => { rawData += chunk })
  res.on('end', () => {
    try {
      console.log(rawData)
    } catch (e) {
      console.error(e.message)
    }
  })
})
