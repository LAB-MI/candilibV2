import moment from 'moment'
import { createPlace } from '../place'
import Place from '../place/place.model'
import { findCentreByName } from '../centre'

export const places = [
  {
    date: (() =>
      moment()
        .date(28)
        .hour(9)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 1',
    inspecteur: 'Inspecteur 1',
  },
  {
    date: (() =>
      moment()
        .date(29)
        .hour(10)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 2',
  },
  {
    date: (() =>
      moment()
        .date(28)
        .hour(11)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 2',
    inspecteur: 'Inspecteur 3',
  },
  {
    date: (() =>
      moment()
        .date(28)
        .hour(9)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 4',
  },
  {
    date: (() =>
      moment()
        .date(30)
        .hour(10)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 5',
  },
  {
    date: (() =>
      moment()
        .date(30)
        .hour(11)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Centre 3',
    inspecteur: 'Inspecteur 6',
  },
]

export const createPlaces = () =>
  Promise.all(
    places.map(async place => {
      const centre = await findCentreByName(place.centre)
      if (!centre) console.warn(`Le centre ${place.centre} non trouvé`)
      else place.centre = centre._id
      return createPlace(place)
    })
  )

export const removePlaces = () => Place.remove()

export const nbPlacesCentres = ({ nom }) =>
  nom ? places.filter(place => place.centre === nom).length : places.length
