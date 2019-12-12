import {
  countAvailablePlacesByCentre,
  findAllPlacesByCentre,
} from '../../models/place'

import { findUserById } from '../../models/user'

import {
  findCentresByDepartement,
  findAllActiveCentres,
  findAllCentres,
  findCentreById,
  updateCentreActiveState,
} from '../../models/centre'
import { getFrenchLuxon } from '../../util'

export async function findCentresWithNbPlaces (departement, beginDate, endDate) {
  const centres = departement
    ? await findCentresByDepartement(departement)
    : await findAllActiveCentres()

  if (!beginDate) {
    beginDate = getFrenchLuxon().toISODate()
  }

  const centresWithNbPlaces = await Promise.all(
    centres.map(async centre => {
      const count = await countAvailablePlacesByCentre(
        centre._id,
        beginDate,
        endDate
      )
      return { centre, count }
    })
  )
  return centresWithNbPlaces
}

export async function findCentresWithPlaces (departement, beginDate, endDate) {
  if (!departement) throw new Error('departement value is undefined')

  const centres = await findCentresByDepartement(departement)

  if (!beginDate) {
    beginDate = getFrenchLuxon().toISODate()
  }

  const centresWithPlaces = await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesByCentre(centre._id, beginDate, endDate)
      return { centre, places }
    })
  )
  return centresWithPlaces
}

/**
 * Retourne une liste de centre pour les départements voulus
 *
 * @async
 * @function
 *
 * @param {string[]} departements - Départements pour lesquels récupérer les centres
 * @returns {Centre[]} Liste des centres correspondants
 */
export async function findAllCentresForAdmin (departements) {
  if (!departements || !departements.length) {
    throw new Error('departement value is undefined')
  }

  const centres = await findAllCentres(departements)

  return centres
}

/**
 * Met à jour le statut (actif ou inactif) d'un centre
 * @async
 * @function
 *
 * @param {string} id - Id du centre à modifier
 * @param {boolean} status - Statut désiré, `true` pour un centre à activer, `false` pour le désactiver
 */
export async function updateCentreStatus (id, status, userId) {
  const centre = await findCentreById(id)

  if (!centre) {
    const error = new Error('Centre introuvable')
    error.status = 404
    throw error
  }

  const user = await findUserById(userId)

  if (!user.departements.includes(centre.departement)) {
    const error = new Error("Vous n'avez pas accès à ce centre")
    error.status = 403
    throw error
  }

  const updatedCentre = await updateCentreActiveState(
    centre,
    status,
    user.email
  )

  return updatedCentre
}
