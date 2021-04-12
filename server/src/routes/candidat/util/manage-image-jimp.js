import { read, MIME_PNG } from 'jimp'

export const modifyImage = async (buffer) => {
  console.log({ __dirname })
  // const image = await read(path.resolve('./node_modules/visualcaptcha/images/airplane.png'))
  const image = await read(buffer)
  const rd = Math.random()
  const w = image.getWidth() + rd * 10
  const h = image.getHeight() + rd * 10
  console.log({ w, h, rd })
  image.resize(w, h)
  const vert = Math.round(Math.random())
  const horiz = Math.round(Math.random())
  console.log({ vert, horiz })
  image.mirror(!horiz, !vert) // resize

  image.sepia()

  return image.getBufferAsync(MIME_PNG)
}

// export const md5SumPNG = () => {
//   const md5Sum1 = crypto.createHash('md5')
//   md5Sum1.update()
// }
