import jimp, { MIME_PNG } from 'jimp'

import mergeImg from 'merge-img'
import fs from 'fs'
import mime from 'mime'
import crypto from 'crypto'

export const concatImages = async (images) => {
  console.log({ images })
  const jimpFont = await jimp.loadFont(jimp.FONT_SANS_12_BLACK)
  const newImages = await Promise.all(images.map(async (image, index) => {
    try {
      const jimpImg = await jimp.read(image)
      const jimpCreated = await jimp.create(28, 28, 0xffffffff)
      jimpCreated.print(jimpFont, 0, 0, `${index + 1}`)

      const imageWithNumber = await mergeImg([await jimpImg.getBufferAsync(jimp.MIME_PNG), await jimpCreated.getBufferAsync(jimp.MIME_PNG)], { direction: true })
      return imageWithNumber
    } catch (error) {
      console.log('ADDFONT', { error })
      return image
    }
  }))

  console.log({ newImages })
  const img0 = await mergeImg(newImages.slice(0, 3), { offset: 10 })
  const img1 = await mergeImg(newImages.slice(3, 5), { offset: 10 })

  const img = await mergeImg([img0, img1], { direction: true, offset: 10 })

  const asyncImg = new Promise((resolve, reject) => {
    img.getBuffer(MIME_PNG, (error, img) => {
      if (error) reject(error)
      else resolve(img)
    })
  })

  return asyncImg
}

export async function streamImages (isRetina) {
  const pathModule = require.resolve('visualcaptcha')
  const lastindex = pathModule.lastIndexOf('/')
  const pathModuleImages = `/${pathModule.slice(1, lastindex)}/images/`
  const pathImages = []
  for (let index = 0; index < 5; index++) {
    const imageOption = this.getImageOptionAtIndex(index)
    let imageFileName = imageOption ? imageOption.path : ''
    let imageFilePath = `${pathModuleImages}${imageFileName}`

    // Force boolean for isRetina
    if (!isRetina) {
      isRetina = false
    } else {
      isRetina = true
    }

    // If retina is requested, change the file name
    if (isRetina) {
      imageFileName = imageFileName.replace(/\.png/gi, '@2x.png')
      imageFilePath = imageFilePath.replace(/\.png/gi, '@2x.png')
    }
    if (!imageFileName) {
      const error = new Error('Not Found')
      error.status = 404
      throw error
    }

    pathImages.push(imageFilePath)
  }

  const newImage = await concatImages(pathImages)
  return {
    mimeType: MIME_PNG,
    newImage,
  }
}

export function streamImage1 (index, response, isRetina) {
  const pathModule = require.resolve('visualcaptcha')
  const lastindex = pathModule.lastIndexOf('/')
  const pathModuleImages = `/${pathModule.slice(1, lastindex)}/images/`

  const imageOption = this.getImageOptionAtIndex(index)
  let imageFileName = imageOption ? imageOption.path : ''
  let imageFilePath = `${pathModuleImages}${imageFileName}`

  // Force boolean for isRetina
  if (!isRetina) {
    isRetina = false
  } else {
    isRetina = true
  }

  // If retina is requested, change the file name
  if (isRetina) {
    imageFileName = imageFileName.replace(/\.png/gi, '@2x.png')
    imageFilePath = imageFilePath.replace(/\.png/gi, '@2x.png')
  }

  // If the index is non-existent, the file name will be empty, same as if the options weren't generated
  if (imageFileName) {
    try {
      fs.accessSync(imageFilePath, fs.constants.R_OK)
      const mimeType = mime.getType(imageFilePath)

      // Set the appropriate mime type
      response.set('content-type', mimeType)

      // Make sure this is not cached
      response.set('cache-control', 'no-cache, no-store, must-revalidate')
      response.set('pragma', 'no-cache')
      response.set('expires', 0)

      const stream = fs.createReadStream(imageFilePath)
      const responseData = []

      if (stream) {
        stream.on('data', function (chunk) {
          responseData.push(chunk)
        })

        stream.on('end', function () {
          if (!response.headerSent) {
            var finalData = Buffer.concat(responseData)
            response.write(finalData)

            // Add some noise randomly, so images can't be saved and matched easily by filesize or checksum
            var noiseData = crypto.randomBytes(Math.round((Math.random() * 1999)) + 501).toString('hex')
            response.write(noiseData)

            response.end()
          }
        })
      } else {
        response.status(404).send('Not Found')
      }
    } catch (error) {
      console.log({ error })
      response.status(404).send('Not Found')
    }
  } else {
    response.status(404).send('Not Found')
  }
}
