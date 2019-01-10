import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

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

export default mongoose.model('Place', PlaceSchema)
