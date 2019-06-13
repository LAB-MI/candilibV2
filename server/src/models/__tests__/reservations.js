import { commonBasePlaceDateTime } from './places'
import { findCandidatByEmail } from '../candidat'
import { candidats } from './candidats'
import placeModel from '../place/place.model'

export const makeResa = (place, candidat) => {
  place.candidat = candidat._id
  return place.save()
}

let placesDb

export const makeResas = async () => {
  const place1 = await placeModel.findOne({
    date: commonBasePlaceDateTime.toISO(),
  })
  const place2 = await placeModel.findOne({
    date: commonBasePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
  })
  const candidat1 = await findCandidatByEmail(candidats[0].email)
  const candidat2 = await findCandidatByEmail(candidats[1].email)

  const result = await Promise.all([
    makeResa(place1, candidat1),
    makeResa(place2, candidat2),
  ])
  return result
}

export const NUMBER_RESA = 2

export const nbPlacesDispoByCentres = async ({ nom }) => {
  const places = await placesDb
  return (nom
    ? places.filter(place => place.centre === nom).length
    : places.length) -
    (places[0].centre === nom)
    ? 1
    : 0 - (places[1].centre === nom)
      ? 1
      : 0
}

export const removeAllResas = async () => {
  const places = await placeModel.find({ candidat: { $ne: undefined } })
  const placesAsPromises = places.map(place => {
    place.candidat = undefined
    return place.save()
  })
  const removesResas = await Promise.all(placesAsPromises)
  return removesResas
}
