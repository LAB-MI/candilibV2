/**
 * Model archived-place
 * @module
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
  archiveReasons: {
    type: [String],
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
 * Schéma du modèle de données des places archivées
 * @type {ArchivedPlaceModel}
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

/**
 * Modèle de données des places archivées
 * @typedef {Object} ArchivedPlaceModel
 * @property {ObjectId} placeId identifiant de la place à archiver
 * @property {Date} archivedAt la date de création de l'archive
 * @property {string[]} archiveReasons Les raisons de l'archivage
 * @property {string} byUser L'identifiant de l'utilistateur qui a demandé l'archive
 * @property {PlaceFields} placeCommonFields Les champs de [PlaceFields]{@link module:models/place/place-model~PlaceFields} sont réutilisés dans ce modèle
 *
 */

export default mongoose.model('ArchivedPlace', ArchivedPlaceSchema)
