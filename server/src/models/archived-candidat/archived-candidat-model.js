/**
 * Modèle Mongoose des candidats archivés dans la base de données
 * @module
 */

import mongoose from 'mongoose'

import { candidatFields } from '../candidat/candidat-model'

const { Schema } = mongoose

const ArchivedCandidatFields = {
  ...candidatFields,

  archivedAt: {
    type: Date,
    default: undefined,
  },

  archiveReason: {
    type: String,
    default: undefined,
  },
}

ArchivedCandidatFields.email = { ...ArchivedCandidatFields.email }
ArchivedCandidatFields.email.unique = false

const ArchivedCandidatSchema = new Schema(ArchivedCandidatFields, {
  timestamps: true,
})

ArchivedCandidatSchema.index(
  {
    codeNeph: 'text',
    nomNaissance: 'text',
  },
  {
    name: 'NephNom',
  }
)

ArchivedCandidatSchema.pre('save', async function preSave () {
  const archivedCandidat = this
  if (!archivedCandidat.archivedAt) {
    archivedCandidat.archivedAt = new Date()
  }
})

export default mongoose.model('ArchivedCandidat', ArchivedCandidatSchema)

/**
 * Modèle de données des places archivées
 * @typedef {Object} ArchivedCandidatMongooseDocument
 * @mixes import('mongoose').Document
 *
 * @property {Date} archivedAt la date de création de l'archive
 * @property {string} archiveReason Raison de l'archivage
 * //@property {candidatFields} ArchivedCandidatFields Les champs de [PlaceFields]{@link module:models/candidat/candidat-model~CandidatFields} sont réutilisés dans ce modèle
 */

/**
 * Modèle de données leger des places archivées
 * @typedef {Object} ArchivedCandidatMongooseLeanDocument
 *
 * @property {Date} archivedAt la date de création de l'archive
 * @property {string} archiveReason Raison de l'archivage
 * //@property {candidatFields} ArchivedCandidatFields Les champs de [PlaceFields]{@link module:models/candidat/candidat-model~CandidatFields} sont réutilisés dans ce modèle
 */
