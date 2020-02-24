import Status from './status.model'

export const createStatus = async ({ type, message }) => {
  try {
    const status = new Status({
      type,
      message,
    })
    await status.save()
    return status
  } catch (error) {
    throw new Error("Impossible d'enregistrer le status")
  }
}

export const findStatusById = id => Status.findById(id)

export const findStatusByType = ({ type }) => Status.findOne({ type })

export const upsertStatusByType = async ({ type, message }) => {
  const newStatus = await Status.updateOne(
    { type },
    { message },
    { upsert: true }
  )
  return { ...newStatus }
}

export const deleteStatusById = async id => {
  const status = await findStatusById(id)
  if (!status) {
    throw new Error('No Status found with id')
  }
  await status.delete()
  return status
}

export const deleteStatusByType = async type => {
  const status = await findStatusByType({ type })
  if (!status) {
    throw new Error('No Status found with id')
  }
  await status.delete()
  return status
}

export const updateStatusById = async (id, { type, message }) => {
  const status = await Status.updateOne({ _id: id }, { type, message })
  return status
}
