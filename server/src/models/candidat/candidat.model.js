import mongoose from 'mongoose'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'

const { Schema } = mongoose

const CandidatSchema = new Schema({
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
  },
  // retourAurige
  isValid: {
    type: Boolean,
    default: null,
  },
  place: {
    type: Object,
    default: {},
  },
})

CandidatSchema.index({ codeNeph: 1, nomNaissance: 1 }, { unique: true })

export default mongoose.model('Candidat', CandidatSchema)
