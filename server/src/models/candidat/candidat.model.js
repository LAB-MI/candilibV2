import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'

const { Schema } = mongoose

const candidatFields = {
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
    default: '',
    required: true,
    trim: true,
    unique: true,
    match: emailRegex,
  },
  portable: {
    type: String,
    default: '',
    required: true,
    trim: true,
    match: phoneRegex,
  },
  adresse: {
    type: String,
    default: '',
    trim: true,
  },
  // retourAurige
  isValid: {
    type: Boolean,
    default: null,
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

  candidat.prenom =
    candidat.prenom &&
    candidat.prenom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  candidat.nom =
    candidat.nom &&
    candidat.nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
})

export default mongoose.model('Candidat', CandidatSchema)
