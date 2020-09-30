import { createCentres, createInspecteurs } from '../../models/__tests__'
import { getFrenchLuxonFromObject, getFrenchLuxon } from '../../util'
import { createPlace } from '../../models/place'

export let centreDateDisplay
export const createdAtBefore = getFrenchLuxonFromObject({ hour: 9 })
export const visibleAtBefore = getFrenchLuxonFromObject({ hour: 9 })
export const visibleAtNow12h = getFrenchLuxon().set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
export const visibleAtYesterday12h = visibleAtNow12h.minus({ days: 1 })
export const visibleAtTomorrow12h = visibleAtNow12h.plus({ days: 1 })
export const createPlacesWithVisibleAt = async () => {
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
      visibleAt: visibleAtYesterday12h.toISO(),
    },
    {
      date: basePlaceDateTime.set({ hour: 10 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 16 }).minus({ days: 1 }),
      visibleAt: visibleAtNow12h,
    },
    {
      date: basePlaceDateTime.set({ hour: 11 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: createdAtBefore,
      visibleAt: visibleAtNow12h,
    },
    {
      date: basePlaceDateTime.set({ hour: 14 }).toISO(),
      centre: centreDateDisplay._id,
      inspecteur: createdInspecteurs[1]._id,
      createdAt: getFrenchLuxonFromObject({ hour: 16 }),
      visibleAt: getFrenchLuxonFromObject({ hour: 16 }),
    },
  ]

  // let placesUpdated = await createPlace({ ...places[0], date: basePlaceDateTime.set({ hour: 9 }).plus({ days: 1 }).toISO() })
  // placesUpdated.visibleAt = getFrenchLuxon().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISO()
  // placesUpdated = await placesUpdated.save()

  const createdPlaces = await Promise.all(places.map(createPlace))

  // createdPlaces.push(placesUpdated)

  return createdPlaces
}
