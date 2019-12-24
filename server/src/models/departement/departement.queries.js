import Departement from './departement.model'

export const createDepartement = async ({ _id, email }) => {
  const departement = new Departement({
    _id,
    email,
  })
  await departement.save()
  return departement
}

export const findDepartementById = async _id => Departement.findById(_id)

export const findAllDepartement = async () => Departement.find()

export const findDepartementsByEmail = async email =>
  Departement.find({ email })

export const deleteDepartementById = async _id => {
  const departement = await findDepartementById(_id)
  if (!departement) {
    throw new Error('No departement found with id')
  }
  await departement.delete()
  return departement
}

export const findAllDepartements = async () => Departement.find({}, '-__v')

export const updateDepartementById = async ({ _id, email }) => {
  const departement = await findDepartementById(_id)
  if (!departement) {
    throw new Error('No departement found with id')
  }
  await departement.updateOne({ email })
  const updatedDepartement = await Departement.findById(departement._id)
  return updatedDepartement
}
