import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'
import { placeCommonFields } from '../place/place.model'
import { ECHEC } from './objetDernierNonReussite.values'

const { Schema } = mongoose

const ArchivedPlaceFields = {
  ...placeCommonFields,
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

const ArchivedPlaceSchema = new Schema(ArchivedPlaceFields)

const noReussiteFields = {
  date: {
    type: Date,
    default: undefined,
    required: false,
  },
  reason: {
    type: String,
    trim: true,
    required: false,
  },
}

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
  departement: {
    type: String,
    trim: true,
  },
  homeDepartement: {
    type: String,
    trim: true,
  },
  dateReussiteETG: {
    type: Date,
    required: false,
  },
  reussitePratique: {
    type: Date,
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
  isEvaluationDone: {
    type: Boolean,
  },
  places: {
    type: [ArchivedPlaceSchema],
    default: undefined,
  },
  resaCanceledByAdmin: {
    type: Date,
    default: undefined,
  },
  nbEchecsPratiques: {
    type: Number,
    default: 0,
    required: false,
  },
  noReussites: [noReussiteFields],
  firstConnection: {
    type: Date,
    required: false,
  },
  canAccessAt: {
    type: Date,
    required: false,
  },
}

const CandidatSchema = new Schema(candidatFields, { timestamps: true })

CandidatSchema.index({ codeNeph: 1, nomNaissance: 1 }, { unique: true })
CandidatSchema.index({ email: 1 })

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
  candidat.nomNaissance =
    candidat.nomNaissance &&
    candidat.nomNaissance.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
})

CandidatSchema.index({
  nomNaissance: 'text',
  prenom: 'text',
  email: 'text',
  codeNeph: 'text',
})

const theLast = noReussite => {
  if (!noReussite || noReussite.length === 0) {
    return undefined
  }
  return noReussite[noReussite.length - 1]
}

CandidatSchema.virtual('dateDernierNonReussite').get(function () {
  const lastNoReussite = theLast(this.noReussites)
  return lastNoReussite && lastNoReussite.date
})

CandidatSchema.virtual('objetDernierNonReussite').get(function () {
  const lastNoReussite = theLast(this.noReussites)
  return lastNoReussite && lastNoReussite.reason
})

CandidatSchema.virtual('dateDernierEchecPratique')
  .get(function () {
    const lastNoReussite = theLast(this.noReussites)
    return lastNoReussite && lastNoReussite.date
  })
  .set(function (value) {
    if (value) {
      this.noReussites.push({
        date: value,
        reason: ECHEC,
      })
      this.nbEchecsPratiques++
    }
  })

CandidatSchema.virtual('lastNoReussite')
  .get(function () {
    return theLast(this.noReussites)
  })
  .set(function (value) {
    const { date, reason } = value
    if (date && reason) {
      this.noReussites.push({
        date,
        reason,
      })
    }
  })

export default mongoose.model('Candidat', CandidatSchema)
