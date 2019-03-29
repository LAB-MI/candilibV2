import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

const PlaceSchema = new Schema({
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
  candidat: {
    type: ObjectId, // ObjectId du candidat ayant réservé cette place
    required: false,
    ref: 'Candidat',
  },
})

PlaceSchema.index({ date: 1, centre: 1, inspecteur: 1 }, { unique: true })

export default mongoose.model('Place', PlaceSchema)
