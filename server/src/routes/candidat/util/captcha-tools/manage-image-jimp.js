import sharp from 'sharp'

export const modifyImage = async (buffer) => {
  let image = await sharp(buffer)
  const rd = Math.random()
  const w = (await image.metadata()).width + rd * 10
  const h = (await image.metadata()).height + rd * 10

  image = image.resize(w, h)

  return image
}

export const drawTextInImage = async (image, text) => {
  try {
    let newImage
    let width = 700
    let height = 100
    let fontSize = '50px'
    if (image) {
      newImage = sharp(image)
      const metadata = await newImage.metadata()
      width = metadata.width
      height = 25
      fontSize = '20px'
    }
    newImage = await sharp(
      {
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      },
    )

    const svgImage = `
    <svg width="${width}" height="${height}">
      <style>
      .title { fill: #001; font-size: ${fontSize}; font-weight: bold;}
      </style>
      <text x="50%" y="70%" text-anchor="middle" class="title">${text}</text>
    </svg>
    `

    const svgBuffer = Buffer.from(svgImage)
    newImage.composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ])
    newImage = newImage.png().toBuffer()
    return newImage
  } catch (error) {
    console.error(error)
  }
}
