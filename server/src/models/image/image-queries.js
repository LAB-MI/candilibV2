import Image from './image-model'

export const createImage = async (
  type,
  name,
  data,
  path,
) => {
  const image = new Image({
    type,
    name,
    data,
    path,
  })

  await image.save()
  return image
}

export const getImages = async () => {
  const images = Image.find({})
  return images
}
