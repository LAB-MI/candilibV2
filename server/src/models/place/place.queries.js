import Place from './place.model'
import mongoose from 'mongoose'

export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

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
