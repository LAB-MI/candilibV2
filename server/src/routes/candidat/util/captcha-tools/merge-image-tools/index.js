import Jimp, { read } from 'jimp'
import alignImage from './alignImage'
import calcMargin from './calcMargin'

const processImg = async (img) => {
  if (img instanceof Jimp) {
    return { img }
  }

  const imgObj = await read(img)
  return { img: imgObj }
}

const concatAllImages = (imgs, {
  direction = false,
  color = 0x00000000,
  align = 'start',
  offset = 0,
  margin,
} = {}) => {
  let totalX = 0
  let totalY = 0

  const imgData = imgs.reduce((accu, { img, offsetX = 0, offsetY = 0 }) => {
    const { bitmap: { width, height } } = img

    accu.push({
      img,
      x: totalX + offsetX,
      y: totalY + offsetY,
      offsetX,
      offsetY,
    })

    totalX += width + offsetX
    totalY += height + offsetY

    return accu
  }, [])

  const { top, right, bottom, left } = calcMargin(margin)
  const marginTopBottom = top + bottom
  const marginRightLeft = right + left

  const totalWidth = direction
    ? Math.max(...imgData.map(({ img: { bitmap: { width } }, offsetX }) => width + offsetX))
    : imgData.reduce((accu, { img: { bitmap: { width } }, offsetX }, index) => accu + width + offsetX + (Number(index > 0) * offset), 0)

  const totalHeight = direction
    ? imgData.reduce((accu, { img: { bitmap: { height } }, offsetY }, index) => accu + height + offsetY + (Number(index > 0) * offset), 0)
    : Math.max(...imgData.map(({ img: { bitmap: { height } }, offsetY }) => height + offsetY))

  const baseImage = new Jimp(totalWidth + marginRightLeft, totalHeight + marginTopBottom, color)

  const imgDataEntries = imgData.map((data, index) => [index, data])

  for (const [index, { img, x, y, offsetX, offsetY }] of imgDataEntries) {
    const { bitmap: { width, height } } = img
    const [px, py] = direction
      ? [alignImage(totalWidth, width, align) + offsetX, y + (index * offset)]
      : [x + (index * offset), alignImage(totalHeight, height, align) + offsetY]

    baseImage.composite(img, px + left, py + top)
  }

  return baseImage
}

export default async function mergeImg (images, options) {
  if (!Array.isArray(images)) {
    throw new TypeError('`images` must be an array that contains images')
  }

  if (images.length < 1) {
    throw new Error('At least `images` must contain more than one image')
  }

  const imgs = await Promise.all(images.map(processImg))
  return concatAllImages(imgs, options)
}
