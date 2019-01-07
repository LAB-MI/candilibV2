import Whitelisted from './whitelisted.model'

export const findAllWhitelisted = async email => {
  const whitelisted = await Whitelisted.find({}).sort('-dateAdded')
  return whitelisted
}

export const findWhitelistedByEmail = async email => {
  const whitelisted = await Whitelisted.findOne({ email })
  return whitelisted
}

export const findWhitelistedById = async id => {
  const whitelisted = await Whitelisted.findById(id)
  return whitelisted
}

export const createWhitelisted = async email => {
  const whitelisted = new Whitelisted({ email })
  await whitelisted.save()
  return whitelisted
}

export const deleteWhitelistedByEmail = async email => {
  const whitelisted = await Whitelisted.findOne({ email })
  if (!whitelisted) {
    throw new Error(`No whitelisted found with email: ${email}`)
  }
  await whitelisted.delete()
  return whitelisted
}

export const deleteWhitelisted = async id => {
  if (!id) {
    throw new Error('No whitelisted given')
  }
  const whitelisted = await findWhitelistedById(id)
  await whitelisted.delete()
  return whitelisted
}
