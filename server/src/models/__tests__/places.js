import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreById, findCentreByName } from '../centre'
import config from '../../config'
import { createCentres } from './centres'
import { createInspecteurs } from './inspecteurs'
import { getFrenchLuxon, getFrenchLuxonFromObject } from '../../util'
import { findInspecteurById, findInspecteurByName } from '../inspecteur'

let basePlaceDateTime = getFrenchLuxonFromObject({
  day: 18,
  hour: 9,
}).setLocale('fr')

if (
  basePlaceDateTime <
  getFrenchLuxon().plus({
    days: config.delayToBook + 1,
  })
) {
  basePlaceDateTime = basePlaceDateTime.plus({ months: 1 })
}

export const commonBasePlaceDateTime = basePlaceDateTime

export const createTestPlace = async place => {
  const { date, inspecteur, centre, createdAt } = place
  const leanPlace = {
    date,
    createdAt,
  }
  let centreFound

  if (centre instanceof Object) {
    const { _id, nom } = centre
    centreFound = _id
      ? await findCentreById(_id)
      : await findCentreByName(nom.toUpperCase())
  } else {
    centreFound = await findCentreByName(centre.toUpperCase())
  }
  if (!centreFound) {
    throw new Error(`Le centre ${JSON.stringify(centre)} non trouvé`)
  }
  leanPlace.centre = centreFound._id
  let inspecteurFound
  if (inspecteur instanceof Object) {
    const { _id, nom, prenom } = inspecteur
    // TODO: A améliorer
    if (_id) {
      inspecteurFound = await findInspecteurById(_id)
    } else {
      inspecteurFound = await findInspecteurByName(prenom, nom.toUpperCase())
    }
  } else {
    inspecteurFound = await findInspecteurByName(
      undefined,
      inspecteur.toUpperCase()
    )
  }
  if (!inspecteurFound) {
    throw new Error(
      `L'inspecteur ${JSON.stringify(inspecteur)} n'a pas été trouvé`
    )
  }
  leanPlace.inspecteur = inspecteurFound._id

  return createPlace(leanPlace)
}

let testPlaces
let creatingPlaces = false

export const setInitCreatedPlaces = () => {
  testPlaces = undefined
  creatingPlaces = false
}

export const dateYesteday = getFrenchLuxonFromObject({ hour: 10 })
  .minus({ days: 1 })
  .toISO()

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
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 1 }).toISO(),
      centre: centre2._id,
      inspecteur: inspecteur2._id,
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 2 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur1._id,
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 1 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur1._id,
      createdAt: dateYesteday,
    },
    {
      date: basePlaceDateTime.plus({ days: 3, hour: 2 }).toISO(),
      centre: centre3._id,
      inspecteur: inspecteur2._id,
      createdAt: dateYesteday,
    },
  ]

  testPlaces = await Promise.all(places.map(createPlace))
  creatingPlaces = false
  return testPlaces
}

export const removePlaces = async () => Place.deleteMany({})
