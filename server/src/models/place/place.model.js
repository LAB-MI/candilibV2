import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

export const placeCommonFields = {
  inspecteur: {
    type: String,
    required: false,
    trim: true,
  },
  centre: {
    type: ObjectId, // ObjectId du centre pour la V2
    required: false,
    ref: 'Centre',
  },
  date: {
    type: Date,
    required: false,
  },
}

const PlaceSchema = new Schema({
  ...placeCommonFields,
  candidat: {
    type: ObjectId, // ObjectId du candidat ayant réservé cette place
    required: false,
    ref: 'Candidat',
  },
})

PlaceSchema.index({ date: 1, centre: 1, inspecteur: 1 }, { unique: true })

export default mongoose.model('Place', PlaceSchema)
