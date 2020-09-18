import { createCentres, createInspecteurs } from '../../models/__tests__'
import { getFrenchLuxonFromObject } from '../../util'
import { createPlace } from '../../models/place'

export let centreDateDisplay
export const createdAtBefore = getFrenchLuxonFromObject({ hour: 9 })
export const createPlacesWithCreatedAtDiff = async () => {
  const createdCentres = await createCentres()
  centreDateDisplay = createdCentres[1]
  const createdInspecteurs = await createInspecteurs()
  const basePlaceDateTime = getFrenchLuxonFromObject({
    day: 18,
  })
    .plus({ months: 1 })
    .startOf('week')
    .setLocale('fr')
  const places = [
    {
      date: basePlaceDateTime.set({ hour: 9 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1 }),
    },
    {
      date: basePlaceDateTime.set({ hour: 10 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 16 }).minus({ days: 1 }),
    },
    {
      date: basePlaceDateTime.set({ hour: 11 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: createdAtBefore,
    },
    {
      date: basePlaceDateTime.set({ hour: 14 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 16 }),
    },
  ]

  let placesUpdated = await createPlace({ ...places[0], date: basePlaceDateTime.set({ hour: 9 }).plus({ days: 1 }).toISO() })
  placesUpdated.updatedAt = getFrenchLuxonFromObject({ hour: 9 })
  placesUpdated = await placesUpdated.save()

  const createdPlaces = await Promise.all(places.map(createPlace))
  createdPlaces.push(placesUpdated)

  return createdPlaces
}
