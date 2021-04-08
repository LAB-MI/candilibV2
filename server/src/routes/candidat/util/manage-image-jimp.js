import { read, MIME_PNG } from 'jimp'
import crypto from 'crypto'
import { fstat, open, write, writeFileSync, close } from 'fs'
export const cvt2Jpeg = async (buffer) => {
  const image = await read(buffer)
  const rd = Math.random(100)
  const w = image.getWidth() + rd
  const h = image.getHeight() + rd
  console.log({ w, h, rd })
  image.resize(w, h) // resize
  //   .quality(60) // set JPEG quality
  //   .greyscale() // set greyscale
  // .getBufferAsync()
  // .write('/tmp/lena-small-bw.jpg')
  // return image

  return image.getBufferAsync(MIME_PNG)
}

// export const md5SumPNG = () => {
//   const md5Sum1 = crypto.createHash('md5')
//   md5Sum1.update()
// }
