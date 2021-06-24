import jimp, { MIME_PNG } from 'jimp'

import mergeImg from './merge-image-tools/index.js'
import { numberOfImages } from '../../../../config.js'
import { modifyImage } from './manage-image-jimp.js'

export const concatImages = async (images) => {
  const jimpFont = await jimp.loadFont(jimp.FONT_SANS_12_BLACK)
  const newImages = await Promise.all(images.map(async (image, index) => {
    try {
      const jimpImg = await modifyImage(image)

      const jimpCreated = await jimp.create(15, 15)
      jimpCreated.print(jimpFont, 0, 0, `${index + 1}`)

      const bufferImage = await jimpImg.getBufferAsync(jimp.MIME_PNG)
      const bufferImageIndex = await jimpCreated.getBufferAsync(jimp.MIME_PNG)

      const imageWithNumber = await mergeImg([bufferImage, bufferImageIndex], { direction: true })
      return imageWithNumber
    } catch (error) {
      return image
    }
  }))

  const img0 = await mergeImg(newImages.slice(0, 3), { offset: 10 })
  const img1 = await mergeImg(newImages.slice(3, numberOfImages), { offset: 10 })

  const img = await mergeImg([img0, img1], { direction: true, offset: 10 })

  return img.getBufferAsync(MIME_PNG)
}

export async function streamImages (isRetina) {
  const pathModuleImages = `/${__dirname}/images/`
  const pathImages = []
  for (let index = 0; index < numberOfImages; index++) {
    const imageOption = this.getImageOptionAtIndex(index)
    let imageFileName = imageOption ? imageOption.path : ''
    let imageFilePath = `${pathModuleImages}${imageFileName}`

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

export const getImageNamePic = async (frontendData) => {
  const font = await jimp.loadFont(`${__dirname}/fonts/poppins-bold/poppins-bold.fnt`)
  const sizeText = jimp.measureText(font, frontendData.imageName)
  const imagename = await jimp.create(sizeText, 22)
  imagename.print(font, 0, 0, frontendData.imageName)
  return imagename.getBase64Async(jimp.MIME_PNG)
}
