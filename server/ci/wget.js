
const fs = require('fs')

const lengthArgv = process.argv.length
const url = process.argv[lengthArgv - 1]
const https = url.startsWith('https') ? require('https') : require('http')
const paths = url.split('/')
const fileName = paths[paths.length - 1]
const writeStream = fs.createWriteStream(`./${fileName}`)
let href
function wgetFrom (urlValue) {
  const reqget = https.get(urlValue, (res) => {
    let rawdata = ''
    const contentType = res.headers['content-type']
    const isHtml = contentType.startsWith('text/html')
    if (isHtml) {
      res.on('data', chunk => { rawdata += chunk })
      res.on('end', () => {
        try {
          const REGEX = /href="([^"]*)">/
          const matchHref = rawdata.match(REGEX)
          href = matchHref[matchHref.length - 1]
          console.log(rawdata)
          if (href) { wgetFrom(href) } else {
            console.log(rawdata)
          }
        } catch (e) {
          console.error(e.message, e)
        }
      })
    } else {
      // res.on('data', chunk => process.stdout.write(chunk))
      res.on('data', chunk => writeStream.write(chunk))
      // res.on('data', chunk => { rawdata += chunk })
      res.on('end', () => {
        console.log(fileName)
      })
    }
  })

  reqget.on('error', error => {
    console.log({ error })
  })
}

wgetFrom(url)
