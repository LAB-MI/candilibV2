import Whitelisted from './whitelisted.model'

export const findAllWhitelisted = async departement => {
  const whitelisted = await Whitelisted.find({ departement })
  return whitelisted
}

export const findLastCreatedWhitelisted = async (departement, limit = 50) => {
  const whitelisted = await Whitelisted.find({
    departement,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
  return whitelisted
}

export const findWhitelistedMatching = async (searchQuery, departement) => {
  const email = new RegExp(searchQuery, 'i')
  const whitelisted = await Whitelisted.find({ email, departement }).sort(
    '-dateAdded'
  )
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

export const createWhitelisted = async (email, departement) => {
  const whitelisted = new Whitelisted({ email, departement })
  await whitelisted.save()
  return whitelisted
}

export const createWhitelistedBatch = (emails, departement) =>
  Promise.all(
    emails.map(email =>
      Whitelisted.create({ email, departement })
        .then(result => ({
          code: 201,
          email,
          success: true,
        }))
        .catch(error => ({
          code: error.message.includes('duplicate key')
            ? 409
            : error.message.includes('Path `email` is invalid')
              ? 400
              : 500,
          email,
          success: false,
          message: error.message,
        }))
    )
  )

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
