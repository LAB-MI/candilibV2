import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'
import { placeCommonFields } from '../place/place.model'

const { Schema } = mongoose

const ArchivedPlaceFileds = {
  ...placeCommonFields,
  archivedAt: {
    type: Date,
    default: undefined,
  },
  archiveReason: {
    type: String,
    default: undefined,
  },
  byUser: {
    type: String,
    default: undefined,
  },
}

const ArchivedPlaceSchema = new Schema(ArchivedPlaceFileds)

export const candidatFields = {
  nomNaissance: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  prenom: {
    type: String,
    required: false,
    trim: true,
  },
  codeNeph: {
    type: String,
    required: true,
    match: nephRegex,
    trim: true,
  },
  dateReussiteETG: {
    type: Date,
    required: false,
  },
  dateDernierEchecPratique: {
    type: Date,
    required: false,
  },
  reussitePratique: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: emailRegex,
  },
  portable: {
    type: String,
    required: true,
    trim: true,
    match: phoneRegex,
  },
  adresse: {
    type: String,
    trim: true,
  },
  // retourAurige
  isValidatedByAurige: {
    type: Boolean,
    default: null,
  },
  presignedUpAt: {
    type: Date,
    default: undefined,
  },
  place: {
    type: Object,
    default: undefined,
  },
  isValidatedEmail: {
    type: Boolean,
    default: false,
  },
  emailValidationHash: {
    type: String,
    default: undefined,
  },
  emailValidatedAt: {
    type: Date,
    default: undefined,
  },
  aurigeValidatedAt: {
    type: Date,
    default: undefined,
  },
  canBookFrom: {
    type: Date,
    default: undefined,
  },
  places: {
    type: [ArchivedPlaceSchema],
    default: undefined,
  },
  resaCanceledByAdmin: {
    type: Date,
    default: undefined,
  },
}

const CandidatSchema = new Schema(candidatFields)

CandidatSchema.index({ codeNeph: 1, nomNaissance: 1 }, { unique: true })

CandidatSchema.pre('save', async function preSave () {
  const candidat = this

  Object.keys(candidatFields).map(key => {
    const value = candidat[key]
    if (value && typeof value === 'string') {
      candidat[key] = sanitizeHtml(value)
    }
  })

  candidat.email = candidat.email.toLowerCase()

  candidat.prenom =
    candidat.prenom &&
    candidat.prenom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  candidat.nom =
    candidat.nom &&
    candidat.nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
})

export default mongoose.model('Candidat', CandidatSchema)
