import { DateTime } from 'luxon'
import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreByName } from '../centre'
import config from '../../config'

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

export const places = [
  {
    date: (() => basePlaceDateTime.toISO())(),
    centre: 'Centre 1',
    inspecteur: 'Inspecteur 1',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 1, hour: 1 }).toISO())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 2',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 3',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 2 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 4',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 3, hour: 1 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 5',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 3, hour: 2 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 6',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 1, hour: 2 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 6',
  },
  {
    date: (() => basePlaceDateTime.plus({ days: 1 }).toISO())(),
    centre: 'Centre 1',
    inspecteur: 'Inspecteur 7',
  },
]

export const createTestPlace = async place => {
  const leanPlace = {
    date: place.date,
    inspecteur: place.inspecteur,
  }
  const centre = await findCentreByName(place.centre)
  if (!centre) console.warn(`Le centre ${place.centre} non trouvé`)
  else leanPlace.centre = centre._id
  return createPlace(leanPlace)
}

export const createPlaces = () => Promise.all(places.map(createTestPlace))

export const removePlaces = () => Place.remove()

export const nbPlacesByCentres = ({ nom }) =>
  nom ? places.filter(place => place.centre === nom).length : places.length
