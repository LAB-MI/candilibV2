import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreById } from '../centre'
import config from '../../config'
import { createCentres } from './centres'
import { createInspecteurs } from './inspecteurs'
import {
  getFrenchLuxonDateTime,
  getFrenchLuxonDateTimeFromObject,
} from '../../util'

let basePlaceDateTime = getFrenchLuxonDateTimeFromObject({
  day: 18,
  hour: 9,
}).setLocale('fr')

if (
  basePlaceDateTime <
  getFrenchLuxonDateTime().plus({
    days: config.delayToBook + 1,
  })
) {
  basePlaceDateTime = basePlaceDateTime.plus({ months: 1 })
}

export const commonBasePlaceDateTime = basePlaceDateTime

export const createTestPlace = async place => {
  const leanPlace = {
    date: place.date,
    inspecteur: place.inspecteur,
  }
  const centre = await findCentreById(place.centre && place.centre._id)
  if (!centre) {
    console.warn(`Le centre ${place.centre && place.centre._id} non trouvé`)
  } else leanPlace.centre = centre._id
  return createPlace(leanPlace)
}

let testPlaces
let creatingPlaces = false

export const createPlaces = async () => {
  if (testPlaces || creatingPlaces) {
    return testPlaces
  }

  creatingPlaces = true
  const [inspecteur1, inspecteur2] = await createInspecteurs()
  const [centre1, centre2, centre3] = await createCentres()
  const places = [
    {
      date: basePlaceDateTime.toISO(),
      centre: centre1._id,
      inspecteur: inspecteur1._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 1 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 2 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur1._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 1 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur1._id,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 2 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur2._id,
    },
  ]

  testPlaces = await Promise.all(places.map(createPlace))
  creatingPlaces = false
  return testPlaces
}

export const removePlaces = async () => Place.deleteMany({})
