import Departement from './departement.model'

export const createDepartement = async ({ _id, email }) => {
  const departement = new Departement({
    _id,
    email,
  })
  await departement.save()
  return departement
}

export const findDepartementbyId = async _id => Departement.findById(_id)

export const findDepartementsByEmail = async email =>
  Departement.find({ email })

export const deleteDepartementById = async _id => {
  const departement = await findDepartementbyId(_id)
  if (!departement) {
    throw new Error('No departement found with id')
  }
  await departement.delete()
  return departement
}
