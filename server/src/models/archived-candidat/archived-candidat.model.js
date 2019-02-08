import mongoose from 'mongoose'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'

const { Schema } = mongoose

const ArchivedCandidatFields = {
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
  archivedAt: {
    type: Date,
    default: undefined,
  },
}

const ArchivedCandidatSchema = new Schema(ArchivedCandidatFields)

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
