import Place from './place.model'
import mongoose from 'mongoose'

export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

/**
 * TODO: A vérifier l'utilité
 * @param {*} leanPlace
 */
export const createPlace = async leanPlace => {
  const previousPlace = await Place.findOne(leanPlace)
  if (previousPlace && !(previousPlace instanceof Error)) {
    throw new Error(PLACE_ALREADY_IN_DB_ERROR)
  }

  const place = new Place(leanPlace)

  return place.save()
}

export const deletePlace = async place => {
  const deletedPlace = place
  await place.delete()
  return deletedPlace
}

export const findAllPlaces = async () => {
  const places = await Place.find({})
  return places
}

export const findPlaceById = async id => {
  const place = await Place.findById(id)
  return place
}

export const findPlaceByCandidatId = async id => {
  const places = await Place.find({ bookedBy: new mongoose.Types.ObjectId(id) })
  return places
}

// /**
//  * @deprecated pour les données de la v1
//  * @param {*} centre
//  */
// export const findPlacesByCentre = async (centre, beginDate, endDate) => {
//   const places = await Place.find({ centre })
//   return places
// }
// /**
//  * @deprecated pour les données de la v1
//  * @param {*} centre
//  */
// export const countPlacesByCentre = async (centre, beginDate, endDate) => {
//   const nbPlaces = await Place.count({ centre })
//   return nbPlaces
// }

const queryPlaceByCentre = ({ _id }, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate && endDate) {
    query.where('date')
    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }

  return query.where('centre', _id)
}

export const findPlacesByCentre = async ({ _id }, beginDate, endDate) => {
  const places = await queryPlaceByCentre({ _id }, beginDate, endDate).exec()
  return places
}
/**
 * @todo A valider
 * pour la v2
 */
export const countPlacesByCentre = async ({ _id }, beginDate, endDate) => {
  const nbPlaces = await queryPlaceByCentre({ _id }, beginDate, endDate).count()
  return nbPlaces
}
