/**
 * Modèle Mongoose des candidats dans la base de données
 * @module
 */

import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'
import { placeCommonFields } from '../place/place-model'
import { ECHEC } from './objetDernierNonReussite-values'

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
  nom: 'text',
  prenom: 'text',
  mail: 'text',
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

/**
 *  Modèle de données des candidats
 * @typedef {Object} CandidatMongooseDocument
 * @mixes import('mongoose').Document
 *
 * @property {string} nomNaissance - Nom de naissance du candidat
 * @property {string} prenom - Prénom de naissance du candidat
 * @property {string} codeNeph - Code NEPH du candidat
 * @property {ObjectId} departement - Département du candidat
 * @property {string} email - Adresse courriel du candidat
 * @property {string} portable - Numéro de portable du candidat
 * @property {string} adresse - Adresse du candidat
 * @property {date} dateReussiteETG - date de réussite
 * @property {date} reussitePratique - date de réussite de l'examen pratique
 * @property {date} presignedUpAt - date de pré-inscription
 * @property {boolean} isValidatedEmail - validité de l'adresse de couriel
 * @property {string} emailValidationHash - hash de validation de l'addresse couriel
 * @property {date} emailValidatedAt - date de validation de l'adresse couriel du candidat
 * @property {date} aurigeValidatedAt - date de validation par Aurige
 * @property {date} canBookFrom -date à partir de laquelle le candidat peut réserver une place
 * @property {boolean} isEvaluationDone -
 * @property {ObjectId} places - place attribuée au candidat
 * @property {date} resaCanceledByAdmin - date de
 * @property {number} nbEchecsPratiques - nombre d'echec à l'examen pratique
 * @property {date} firstConnection - date de la première connexion
 * @property {date} canAccessAt - date à partir de laquelle le candidat peut accèder au service
 */

/**
 *  Modèle de données leger des candidats
 * @typedef {Object} CandidatMongooseLeanDocument
 *
 * @property {string} nomNaissance - Nom de naissance du candidat
 * @property {string} prenom - Prénom de naissance du candidat
 * @property {string} codeNeph - Code NEPH du candidat
 * @property {ObjectId} departement - Département du candidat
 * @property {string} email - Adresse courriel du candidat
 * @property {string} portable - Numéro de portable du candidat
 * @property {string} adresse - Adresse du candidat
 * @property {date} dateReussiteETG - date de réussite
 * @property {date} reussitePratique - date de réussite de l'examen pratique
 * @property {date} presignedUpAt - date de pré-inscription
 * @property {boolean} isValidatedEmail - validité de l'adresse de couriel
 * @property {string} emailValidationHash - hash de validation de l'addresse couriel
 * @property {date} emailValidatedAt - date de validation de l'adresse couriel du candidat
 * @property {date} aurigeValidatedAt - date de validation par Aurige
 * @property {date} canBookFrom -date à partir de laquelle le candidat peut réserver une place
 * @property {boolean} isEvaluationDone -
 * @property {ObjectId} places - place attribuée au candidat
 * @property {date} resaCanceledByAdmin - date de
 * @property {number} nbEchecsPratiques - nombre d'echec à l'examen pratique
 * @property {date} firstConnection - date de la première connexion
 * @property {date} canAccessAt - date à partir de laquelle le candidat peut accèder au service
 */
