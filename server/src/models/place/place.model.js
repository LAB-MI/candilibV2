import mongoose from 'mongoose'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

const PlaceSchema = new Schema({
  inspecteur: {
    type: String,
    required: false,
    trim: true,
  },
  // /**
  //  * @deprecated donnée de la v1
  //  */
  // centre: {
  //   type: String, // nom du centre pour la V1
  //   required: false,
  //   trim: true,
  // },
  /**
   * @todo A valider
   * Pour la v2
   */
  centre: {
    type: ObjectId, // ObjectId du centre pour la V2
    required: false,
    ref: 'Centre',
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
