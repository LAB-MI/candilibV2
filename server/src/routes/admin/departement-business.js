// TODO: JSDOC
/**
 * Contrôleur regroupant les fonctions d'actions sur les départements
 * @module routes/admin/departement-business
 */

import {
  createDepartement,
  findDepartementById,
  updateDepartementById,
  deleteDepartementById,
} from '../../models/departement'

export const createDepartements = async (departementId, email) => {
  const isDepartementAlreadyExist = await findDepartementById(departementId)

  if (isDepartementAlreadyExist) {
    const message = 'Département exist déjà'
    throw new Error(message)
  }

  const result = await createDepartement({ departementId, email })
  return result
}

export const getDepartements = async (departementIds) => {
  const result = await Promise.all(departementIds.map(departementId => findDepartementById(departementId)))
  return result
}

export const updateDepartements = async (departementId) => {
  const result = await updateDepartementById(departementId)
  return result
}

export const deleteDepartement = async (departementId) => {
  const result = await deleteDepartementById(departementId)
  return result
}
