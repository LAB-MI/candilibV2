import { commonBasePlaceDateTime } from './places'
import { findCandidatByEmail } from '../candidat'
import { candidats, createCandidats } from './candidats'
import placeModel from '../place/place.model'

export const makeResa = (place, candidat, bookedAt) => {
  place.candidat = candidat._id
  place.bookedAt = bookedAt
  return place.save()
}

let placesDb

export const makeResas = async bookedAt => {
  const place1 = await placeModel.findOne({
    date: commonBasePlaceDateTime.toISO(),
  })
  const place2 = await placeModel.findOne({
    date: commonBasePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
  })

  const candidat1 = await findCandidatByEmail(candidats[0].email)
  const candidat2 = await findCandidatByEmail(candidats[1].email)

  const result = await Promise.all([
    makeResa(place1, candidat1, bookedAt),
    makeResa(place2, candidat2, bookedAt),
  ])
  return result
}

export const makeCandidatsResas = async bookedAt => {
  const candidats = await createCandidats()

  const place1 = await placeModel.findOne({
    date: commonBasePlaceDateTime.plus({ days: 1, hour: 1 }).toISO(),
  })
  const place2 = await placeModel.findOne({
    date: commonBasePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
  })

  const candidat1 = await findCandidatByEmail(candidats[0].email)
  const candidat2 = await findCandidatByEmail(candidats[1].email)

  place1.candidat = candidat1._id
  place1.bookedAt = bookedAt
  const result1 = await place1.save()
  place2.candidat = candidat2._id
  place2.bookedAt = bookedAt
  const result2 = await place2.save()

  return { result1, result2 }
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
  const promsieSaves = places.map(place => {
    place.candidat = undefined
    return place.save()
  })
  const removesResas = await Promise.all(promsieSaves)
  return removesResas
}
