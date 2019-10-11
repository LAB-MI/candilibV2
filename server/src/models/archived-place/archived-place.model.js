/**
 * Model archived-place
 * @module models/archived-place
 */
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

/**
 * @typedef {Object} ArchivedPlaceModel
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

ArchivedPlaceSchema.pre('save', async function preSave () {
  const archivedPlace = this
  if (!archivedPlace.archivedAt) {
    archivedPlace.archivedAt = new Date()
  }
})

export default mongoose.model('ArchivedPlace', ArchivedPlaceSchema)
