import Departement from './departement.model'

export const createDepartement = async ({ _id, email }) => {
  const departement = new Departement({
    _id,
    email,
  })
  await departement.save()
  return departement
}

export const findDepartementbyId = async _id =>
  Departement.findById(_id)

export const findDepartementByEmail = async email =>
  Departement.findOne({ email })

export const deleteDepartementById = async _id => {
  const departement = await findDepartementbyId(_id)
  if (!departement) {
    throw new Error('No departement found with id')
  }
  await departement.delete()
  return departement
}

export const deleteDepartementByEmail = async email => {
  const departement = await findDepartementByEmail(email)
  if (!departement) {
    throw new Error('No Departement found with email')
  }
  await departement.delete()
  return departement
}

export const updatedEmailDepartements = async (email, departements) => {
  if (!email) {
    throw new Error('email is undefined')
  }
  await email.update({ departements })
  const updatedEmail = await email.findbyId(email._id)
  return updatedEmail
}
