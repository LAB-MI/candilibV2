import {
  countAvailablePlacesByCentre,
  findAllPlacesByCentre,
} from '../../models/place'

import {
  findCentresByDepartement,
  findAllActiveCentres,
  findAllCentres,
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

  const allCentres = await findAllCentres()
  const centres = allCentres.filter(centre =>
    departements.includes(centre.departement)
  )

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
export async function updateCentreStatus (id, status) {
  const allCentres = await findAllCentres()
  const centre = allCentres.filter(centre => (centre._id = id))[0]

  if (!centre) throw new Error('Centre introuvable')

  const updatedCentre = await updateCentreActiveState(centre, status)

  return updatedCentre
}
