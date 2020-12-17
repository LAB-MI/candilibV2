import Place from '../models/place/place.model'
import { getFrenchLuxon, techLogger } from '../util'
import { getDateVisibleForPlaces } from '../routes/candidat/util/date-to-display'
import { unsetFalseBookedPlace } from '../models/place'

/**
 * Mise à jours de la visibilité des places
 * @function
 */
export const updateVisibleAt = async () => {
  const now = getFrenchLuxon()
  const nowAt12 = getDateVisibleForPlaces()

  const result = await Place.updateMany({
    date: { $gte: now.toISODate() },
    visibleAt: { $exists: false },
    candidat: { $exists: false },
  }, {
    $set: {
      visibleAt: nowAt12.toISO(),
    },
  })
  return result
}

/**
 * Supprimer les doublons de réservations en erreur
 */
export const removeDuplicateBooked = async () => {
  const loggerInfo = {
    section: 'RESET DUPLICATE BOOKED',
  }
  try {
    const bookedAt = getFrenchLuxon().minus({ hours: 1 })
    const result = await unsetFalseBookedPlace(bookedAt)

    techLogger.info({
      ...loggerInfo,
      description: `Nombre de places en erreur: ${result}`,
    })
  } catch (error) {
    techLogger.warn({
      ...loggerInfo,
      description: error.message,
      error,
    })
  }
}
