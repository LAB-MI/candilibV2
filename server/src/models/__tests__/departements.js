import { createDepartement, deleteDepartementById } from '../departement'

export const createDepartementTest = async (
  departementId,
  departementEmail
) => {
  const createdDepartement = await createDepartement({
    _id: departementId,
    email: departementEmail,
  })
  return createdDepartement
}

export const createManyDepartementTest = async departements => {
  const createdDepartements = await Promise.all(
    departements.map(({ _id, email }) => createDepartement({ _id, email }))
  )
  return createdDepartements
}

export const deleteDepartementTest = async departementId => {
  const deletedDepartement = await deleteDepartementById(departementId)
  return deletedDepartement
}

export const deleteManyDepartementsTest = async departementList => {
  const deletedDepartements = await Promise.all(
    departementList.map(({ _id }) => {
      deleteDepartementTest(_id)
    })
  )
  return deletedDepartements
}
