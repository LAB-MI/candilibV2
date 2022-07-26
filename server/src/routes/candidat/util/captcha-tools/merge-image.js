
import { numberOfImages } from '../../../../config.js'
import {
  drawTextInImage,
} from './manage-image-jimp.js'
import joinImages from 'join-images'

export const concatImages = async (images) => {
  const newImages = await Promise.all(images.map(async (image, index) => {
    try {
      const imgIndex = await drawTextInImage(image, `${index + 1}`)
      const newImage = await (await joinImages([image, imgIndex], { direction: 'vertical', offset: 10, color: { b: 255, g: 255, r: 255 } }))
      return newImage.png().toBuffer()
    } catch (error) {
      return image
    }
  }))

  const img0 = await (await joinImages(newImages.slice(0, 3), { direction: 'horizontal', offset: 10, color: { b: 255, g: 255, r: 255 } })).png().toBuffer()
  const img1 = await (await joinImages(newImages.slice(3, numberOfImages), { direction: 'horizontal', offset: 10, color: { b: 255, g: 255, r: 255 } })).png().toBuffer()

  const img = await joinImages([img0, img1], { direction: 'vertical', offset: 10, color: { b: 255, g: 255, r: 255 } })
  return img.png()
    .toBuffer()
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
    mimeType: 'image/png',
    newImage,
  }
}

export const getImageNamePic = async (frontendData) => {
  const bufferTextImg = await drawTextInImage(undefined, frontendData.imageName)
  return `data:image/png;base64,${bufferTextImg.toString('base64')}`
}
