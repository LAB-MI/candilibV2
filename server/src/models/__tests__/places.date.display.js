import { createCentres, createInspecteurs } from '../../models/__tests__'
import { getFrenchLuxonFromObject } from '../../util'
import { createPlace } from '../../models/place'

export let centreDateDisplay01
export let centreDateDisplay02
export const createdAtBefore = getFrenchLuxonFromObject({ hour: 10 })
export const createPlacesWithCreatedAtDiff = async () => {
  const createdCentres = await createCentres()
  centreDateDisplay01 = createdCentres[1]
  centreDateDisplay02 = createdCentres[0]
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
      centre: centreDateDisplay01._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 10 }),
    },
    {
      date: basePlaceDateTime.set({ hour: 10 }).toISO(),
      centre: centreDateDisplay02._id,
      inspecteur: createdInspecteurs[0]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 12 }),
    },
    {
      date: basePlaceDateTime.set({ hour: 11 }).toISO(),
      centre: centreDateDisplay01._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 13 }),
    },
    {
      date: basePlaceDateTime.set({ hour: 14 }).toISO(),
      centre: centreDateDisplay01._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 14 }),
    },
  ]

  const createdPlaces = await Promise.all(places.map(createPlace))
  return createdPlaces
}
