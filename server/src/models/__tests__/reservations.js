import { findAllPlaces } from '../place'
import { findAllCandidatsLean } from '../candidat'
import { candidats } from './candidats'
import placeModel from '../place/place.model'

export const makeResa = (place, candidat) => {
  place.candidat = candidat._id
  return place.save()
}

export const makeResas = async () => {
  const placesDb = await findAllPlaces()

  const place1 = placesDb.find(
    place => place.inspecteur.toString() === placesDb[0].inspecteur.toString()
  )

  const place2 = placesDb.find(
    place => place.inspecteur.toString() === placesDb[1].inspecteur.toString()
  )
  const candidatsDb = await findAllCandidatsLean()
  const candidat1 = candidatsDb.find(
    candidat => candidat.codeNeph === candidats[0].codeNeph
  )
  const candidat2 = candidatsDb.find(
    candidat => candidat.codeNeph === candidats[1].codeNeph
  )

  return Promise.all([makeResa(place1, candidat1), makeResa(place2, candidat2)])
}

export const NUMBER_RESA = 2

export const nbPlacesDispoByCentres = ({ nom }) =>
  (nom ? placesDb.filter(place => place.centre === nom).length : placesDb.length) -
  (placesDb[0].centre === nom)
    ? 1
    : 0 - (placesDb[1].centre === nom)
      ? 1
      : 0

export const removeAllResas = async () => {
  const places = await placeModel.find({ candidat: { $ne: undefined } })
  const promsieSaves = places.map(place => {
    place.candidat = undefined
    return place.save()
  })
  const removesResas = await Promise.all(promsieSaves)
  return removesResas
}
