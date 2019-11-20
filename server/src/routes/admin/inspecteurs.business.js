/**
 * Module concernant les logiques métiers des actions sur inspecteurs
 * @module
 */
import { findInspecteurById } from '../../models/inspecteur'
import {
  findCentresByDepartement,
  findCentreById,
} from '../../models/centre/centre.queries'
import { findAllPlacesBookedByCentreAndInspecteurs } from '../../models/place'
import { getFrenchLuxonRangeFromDate } from '../../util'
/**
 * Récupère la liste des inspecteurs qui on au moin une réservation.
 *
 * @async
 * @function
 *
 *
 * @param {string} date Date des réservations d'inspecteurs en chaîne de caractères
 * @param {string} departement Une chaîne de caractères qui indique le département des inspecteur
 *
 * @return {Promise.<inspecteursInfo[]>}
 */

export const getInspecteursBookedFromDepartement = async (
  date,
  departement
) => {
  const { begin: beginDate, end: endDate } = getFrenchLuxonRangeFromDate(date)

  const centres = await findCentresByDepartement(departement)

  const places = (await Promise.all(
    centres.map(centre =>
      findAllPlacesBookedByCentreAndInspecteurs(
        centre._id,
        null,
        beginDate,
        endDate
      )
    )
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
    })
  )

  return inspecteursInfo
}
