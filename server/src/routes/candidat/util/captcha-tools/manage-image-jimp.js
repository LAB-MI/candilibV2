import { read } from 'jimp'

const getRandomValue = (idx = 0) => {
  const tmp = Math.floor(Math.random() * 10) * idx
  return tmp
}

export const modifyImage = async (buffer) => {
  const image = await read(buffer)
  const rd = Math.random()
  const w = image.getWidth() + rd * 10
  const h = image.getHeight() + rd * 10

  image.resize(w, h)

  const numberTmp = () => Math.random() * (1000 - 500) + 500
  Array(Math.floor(numberTmp())).fill(true).map((el, idx) => {
    // TODO: Randomise color
    const hex = 0xFFECFFEE
    const index = Math.floor(Math.random() * 10) % idx
    image.setPixelColor(hex, getRandomValue(index), getRandomValue(index)) // sets the colour of that pixel
  })

  return image
}
