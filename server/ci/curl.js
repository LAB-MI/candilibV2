
const lengthArgv = process.argv.length
const url = process.argv[lengthArgv - 1]

const http = url.startsWith('https') ? require('https') : require('http')

http.get(url, (res) => {
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
