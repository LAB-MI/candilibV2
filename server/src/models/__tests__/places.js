import { DateTime } from 'luxon'
import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreById } from '../centre'
import config from '../../config'
import { createCentres } from './centres'
import { createInspecteurs } from './inspecteurs'

let basePlaceDateTime = DateTime.fromObject({ day: 18, hour: 9 })

if (
  basePlaceDateTime <
  DateTime.local().plus({
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
      centre: centre1,
      inspecteur: inspecteur1,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
      centre: centre2,
      inspecteur: inspecteur2,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
      centre: centre2,
      inspecteur: inspecteur2,
    },
    {
      date: basePlaceDateTime.plus({ days: 1 }).toISO(),
      centre: centre2,
      inspecteur: inspecteur2,
    },
    {
      date: basePlaceDateTime.plus({ days: 2 }).toISO(),
      centre: centre3,
      inspecteur: inspecteur1,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 1 }).toISO(),
      centre: centre3,
      inspecteur: inspecteur1,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 2 }).toISO(),
      centre: centre3,
      inspecteur: inspecteur2,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
      centre: centre3,
      inspecteur: inspecteur2,
    },
  ]

  testPlaces = Promise.all(
    places.map(place => {
      createPlace(place)
    })
  )
  creatingPlaces = false
  return testPlaces
}

export const removePlaces = async () => Place.deleteMany({})
