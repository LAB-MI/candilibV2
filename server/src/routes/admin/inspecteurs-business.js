/**
 * Module concernant les logiques métiers des actions sur inspecteurs
 * @module
 */
import {
  findInspecteurById,
  findInspecteursByDepartements,
  updateIpcsr,
  disableIpcsr,
  findActiveInspecteursByDepartements,
} from '../../models/inspecteur'
import { findCentresByDepartement, findCentreById } from '../../models/centre'
import {
  findAllPlacesBookedByCentreAndInspecteurs,
  findPlaceBookedByInspecteur,
} from '../../models/place'
import { getFrenchLuxonRangeFromDate } from '../../util'
import { findUserById } from '../../models/user'
import config from '../../config'

/**
 * Récupère la liste des inspecteurs qui on au moins une réservation.
 *
 * @async
 * @function
 *
 * @param {string} date - Date des réservations d'inspecteurs en chaîne de caractères
 * @param {string} departement - Une chaîne de caractères qui indique le département des inspecteurs
 *
 * @return {Promise.<inspecteursInfo[]>}
 */
export const getInspecteursBookedFromDepartement = async (
  date,
  departement,
) => {
  const { begin: beginDate, end: endDate } = getFrenchLuxonRangeFromDate(date)

  const centres = await findCentresByDepartement(departement)

  const places = (await Promise.all(
    centres.map(centre =>
      findAllPlacesBookedByCentreAndInspecteurs(
        centre._id,
        null,
        beginDate,
        endDate,
      ),
    ),
  ))
    .flat()
    .reduce((acc, { centre, inspecteur }) => {
      if (
        acc.find(place => place.inspecteur.toString() === inspecteur.toString())
      ) {
        return acc
      }

      return [
        ...acc,
        {
          centre,
          inspecteur,
        },
      ]
    }, [])

  const inspecteursInfo = await Promise.all(
    places.map(async place => {
      const centre = await findCentreById(place.centre)
      const inspecteur = await findInspecteurById(place.inspecteur)
      return {
        centre,
        inspecteur,
      }
    }),
  )

  return inspecteursInfo
}

/**
 * Récupère tous les IPCSR de tous les départements d'intervention de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {string} userId - Id de l'utilisateur faisant la requête (admin, délégué ou répartiteur)
 *
 * @returns {Promise.<Inspecteur[]>} - Tableau de tous les inspecteurs trouvés dans les départements de l'utilisateur
 */
export const getAllAppropriateInspecteurs = async userId => {
  const user = await findUserById(userId)
  const inspecteurs = await findInspecteursByDepartements(user.departements)
  return inspecteurs
}

/**
 * Récupère tous les IPCSR non désactivé de tous les départements d'intervention de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {string} userId - Id de l'utilisateur faisant la requête (admin, délégué ou répartiteur)
 *
 * @returns {Promise.<Inspecteur[]>} - Tableau de tous les inspecteurs trouvés dans les départements de l'utilisateur
 */
export const getAllAppropriateActiveInspecteurs = async userId => {
  const user = await findUserById(userId)
  const inspecteurs = await findActiveInspecteursByDepartements(
    user.departements,
  )
  return inspecteurs
}

/**
 * Vérifie si un utilisateur peut créer un IPCSR
 *
 * @async
 * @function
 *
 * @param {string} userId - Id de l'utilisateur faisant la requête (admin, délégué ou répartiteur)
 *
 * @returns {Promise.<boolean>} - Booléen : `true` si l'utilisateur peut créer l'IPCSR, `false` sinon
 */
export const isUserAllowedToCreateIpcsr = async (userId, departement) => {
  const user = await findUserById(userId)
  return user.departements.includes(departement)
}

/**
 * Vérifie si un utilisateur peut modifier un IPCSR
 *
 * @async
 * @function
 *
 * @param {string} userId - Id de l'utilisateur faisant la requête (admin, délégué ou répartiteur)
 *
 * @returns {Promise.<boolean>} - Booléen : `true` si l'utilisateur peut créer l'IPCSR, `false` sinon
 */
export const isUserAllowedToUpdateIpcsr = async (
  userId,
  ipcsrId,
  newDepartement,
) => {
  const user = await findUserById(userId)
  const ipcsr = await findInspecteurById(ipcsrId)
  if (newDepartement) {
    return (user.departements.includes(newDepartement) && user.departements.includes(ipcsr.departement)) || (user.status === config.userStatuses.DELEGUE)
  }
  return user.departements.includes(ipcsr.departement)
}

/**
 * Modifie un IPCSR et retourne le document de l'IPCSR modifié
 *
 * @async
 * @function
 *
 * @param {string} ipcsrId - Id de l'IPCSR à modifier
 * @param {Object} newData - Nouvelles données de l'IPCSR
 * @param {string} newData.departement - Nouveau département de l'IPCSR
 * @param {string} newData.matricule - Nouveau matricule de l'IPCSR
 * @param {string} newData.nom - Nouveau nom de l'IPCSR
 * @param {string} newData.prenom - Nouveau prénom de l'IPCSR
 *
 * @returns {Promise.<Inspecteur>} - Inspecteur modifié
 */
export const updateInspecteur = (ipcsrId, newData) => {
  return updateIpcsr(ipcsrId, newData)
}

/**
 * Inactive un IPCSR et retourne le document de l'IPCSR modifié
 *
 * @async
 * @function
 *
 * @param {string} ipcsrId - Id de l'IPCSR
 * @param {Object} newData - Nouvelles données de l'IPCSR
 *
 * @returns {Promise.<Inspecteur>} - Inspecteur modifié
 */
export const disableInspecteur = ipcsrId => {
  return disableIpcsr(ipcsrId)
}

/**
 * Retourne les places d'un IPCSR
 *
 * @async
 * @function
 *
 * @param {string} ipcsrId - Id de l'IPCSR
 *
 * @returns {Promise.<Places[]>} - Inspecteur modifié
 */
export const isInspecteurBooked = findPlaceBookedByInspecteur
