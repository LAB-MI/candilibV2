import { DateTime } from 'luxon'
import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreByName } from '../centre'

export const places = [
  {
    date: (() => DateTime.fromObject({ day: 18, hour: 9 }).toISO())(),
    centre: 'Centre 1',
    inspecteur: 'Inspecteur 1',
  },
  {
    date: (() => DateTime.fromObject({ day: 19, hour: 10 }).toISO())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 2',
  },
  {
    date: (() => DateTime.fromObject({ day: 19, hour: 11 }).toISO())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 3',
  },
  {
    date: (() => DateTime.fromObject({ day: 20, hour: 9 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 4',
  },
  {
    date: (() => DateTime.fromObject({ day: 21, hour: 10 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 5',
  },
  {
    date: (() => DateTime.fromObject({ day: 21, hour: 11 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 6',
  },
  {
    date: (() => DateTime.fromObject({ day: 19, hour: 11 }).toISO())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 6',
  },
  {
    date: (() => DateTime.fromObject({ day: 19, hour: 9 }).toISO())(),
    centre: 'Centre 1',
    inspecteur: 'Inspecteur 7',
  },
]

export const createPlaces = () =>
  Promise.all(
    places.map(async place => {
      const leanPlace = {
        date: place.date,
        inspecteur: place.inspecteur,
      }
      const centre = await findCentreByName(place.centre)
      if (!centre) console.warn(`Le centre ${place.centre} non trouvé`)
      else leanPlace.centre = centre._id
      return createPlace(leanPlace)
    })
  )

export const removePlaces = () => Place.remove()

export const nbPlacesByCentres = ({ nom }) =>
  nom ? places.filter(place => place.centre === nom).length : places.length
