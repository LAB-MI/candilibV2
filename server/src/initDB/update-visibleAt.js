import Place from '../models/place/place.model'
import { getFrenchLuxon } from '../util'
import { getDateVisibleForPlaces } from '../routes/candidat/util/date-to-display'

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
