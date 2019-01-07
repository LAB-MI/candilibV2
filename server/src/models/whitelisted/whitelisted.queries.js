import Whitelisted from './whitelisted.model'

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

export const deleteWhitelisted = async whitelisted => {
  if (!whitelisted) {
    throw new Error('No whitelisted given')
  }
  await whitelisted.delete()
  return whitelisted
}
