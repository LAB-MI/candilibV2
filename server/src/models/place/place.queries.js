import Place from './place.model'
import mongoose from 'mongoose'
import { logger } from '../../util'

export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

export const createPlace = async leanPlace => {
  logger.debug(JSON.stringify({ func: 'createPlace', leanPlace }))
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

/**
 *
 * @param {*} param0 - _id : recupére l' _id de l'object centre
 * @param {*} beginDate - date de debut de recherche
 * @param {*} endDate - date de fin de recherche
 */
const queryAvailablePlacesByCentre = (_id, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate && endDate) {
    query.where('date')
    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }
  query.where('isBooked').exists(false)

  return query.where('centre', _id)
}

export const findAvailablePlacesByCentre = async (
  centreId,
  beginDate,
  endDate
) => {
  logger.debug(
    JSON.stringify({
      func: 'findAvailablePlacesByCentre',
      args: { centreId, beginDate, endDate },
    })
  )

  const places = await queryAvailablePlacesByCentre(
    centreId,
    beginDate,
    endDate
  ).exec()
  return places
}

export const countAvailablePlacesByCentre = async (
  centreId,
  beginDate,
  endDate
) => {
  logger.debug(
    JSON.stringify({
      func: 'countAvailablePlacesByCentre',
      args: { centreId, beginDate, endDate },
    })
  )

  const nbPlaces = await queryAvailablePlacesByCentre(
    centreId,
    beginDate,
    endDate
  ).count()
  return nbPlaces
}
