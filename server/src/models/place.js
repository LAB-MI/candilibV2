import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

const PlaceSchema = new Schema({
  inspecteur: {
    type: String,
    required: false,
  },
  centre: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  isBooked: {
    type: Boolean,
    required: false,
  },
  bookedBy: {
    type: ObjectId, // ObjectId du candidat ayant réservé cette place
    required: false,
  },
})

PlaceSchema.index({ date: 1, centre: 1, inspecteur: 1 }, { unique: true })

const Place = mongoose.model('Place', PlaceSchema)

export const savePlace = async leanPlace => {
  const previousPlace = await Place.findOne(leanPlace)
  if (previousPlace && !(previousPlace instanceof Error)) {
    throw new Error(PLACE_ALREADY_IN_DB_ERROR)
  }

  const place = new Place(leanPlace)

  return place.save()
}

export const findAllPlaces = async () => {
  const places = await Place.find({})
  return places
}

export const findPlaceById = async id => {
  const place = await Place.findById(id)
  return place
}
