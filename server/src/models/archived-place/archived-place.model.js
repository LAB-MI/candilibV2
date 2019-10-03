import mongoose from 'mongoose'
import { placeCommonFields } from '../place/place.model'

const { Schema } = mongoose

const ArchivedPlaceFields = {
  ...placeCommonFields,
  placeId: {
    type: Schema.Types.ObjectId,
    default: undefined,
  },
  archivedAt: {
    type: Date,
    default: undefined,
  },
  archiveReason: {
    type: String,
    default: undefined,
  },
  isCandilib: {
    type: Boolean,
    default: undefined,
  },
  byUser: {
    type: String,
    default: undefined,
  },
}

<<<<<<< HEAD
const ArchivedPlaceSchema = new Schema(ArchivedPlaceFields)
=======
/**
 * @typedef {Object} ArchivedPlaceModel
 * @memberof module:models/archived-place
 * @property {ObjectId} placeId
 * @property {Date} archivedAt
 * @property {Boolean} isCandilib
 * @property {String} byUser
 * @property {PlaceModel} placeCommonFields {@link module:models/place}
 *
 */
const ArchivedPlaceSchema = new Schema(ArchivedPlaceFields, {
  timestamps: true,
})
>>>>>>> c1f46b5b... fix model and queries archived places

ArchivedPlaceSchema.pre('save', async function preSave () {
  const archivedPlace = this
  if (!archivedPlace.archivedAt) {
    archivedPlace.archivedAt = new Date()
  }
})

export default mongoose.model('ArchivedPlace', ArchivedPlaceSchema)
