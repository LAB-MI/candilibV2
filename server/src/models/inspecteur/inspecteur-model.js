/**
 * Schema et model des IPCSR
 *
 * @module
 */
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import { email as emailRegex, matricule as matriculeRegex } from '../../util'
import { EMAIL_ALREADY_SET, EMAIL_EXISTE, INVALID_EMAIL_FOR } from './inspecteur.constants'

const { Schema } = mongoose

export const inspecteurFields = {
  active: {
    type: Boolean,
    required: false,
  },

  nom: {
    type: String,
    required: true,
    uppercase: true,
  },

  prenom: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: emailRegex,
    lowercase: true,
  },

  secondEmail: {
    type: [String],
    required: false,
    match: emailRegex,
    lowercase: true,
  },

  matricule: {
    type: String,
    required: true,
    match: matriculeRegex,
    unique: true,
  },

  departement: {
    type: String,
    required: false,
  },
}

const InspecteurSchema = new Schema(inspecteurFields, { timestamps: true })

InspecteurSchema.index({
  nom: 'text',
  prenom: 'text',
  email: 'text',
  matricule: 'text',
})

InspecteurSchema.index({ matricule: 1 })
InspecteurSchema.index({ departement: 1, active: 1 })
InspecteurSchema.index({ email: 1 })

InspecteurSchema.pre('save', async function preSave () {
  const inspecteur = this

  Object.keys(inspecteurFields).map(key => {
    const value = inspecteur[key]
    if (value && typeof value === 'string') {
      inspecteur[key] = sanitizeHtml(value)
    }
  })

  inspecteur.prenom =
    inspecteur.prenom &&
    inspecteur.prenom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  inspecteur.nom =
    inspecteur.nom &&
    inspecteur.nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  inspecteur.email = inspecteur.email.toLowerCase()

  let foundInspecteur = await Inspecteur.findOne({
    secondEmail: inspecteur.email,
  })
  if (foundInspecteur) {
    const error = new Error(EMAIL_EXISTE(inspecteur.email))
    error.status = 409
    throw error
  }

  if (!inspecteur.secondEmail || !inspecteur.secondEmail.length) return

  const resultCheck = inspecteur.secondEmail.reduce((acc, current) => {
    if (!emailRegex.test(current)) {
      // throw new Error(INVALID_EMAIL_FOR(current))
      acc.invalid.push(current)
      return acc
    }
    if (!acc.invalid.length) {
      const email = current.toLowerCase()
      if (acc.secondEmail.includes(email)) {
        acc.doublons.push(email)
        return acc
      }
      acc.secondEmail.push(email)
      return acc
    }
  }, { secondEmail: [], invalid: [], doublons: [] })

  if (resultCheck.invalid.length) {
    const error = new Error(INVALID_EMAIL_FOR(resultCheck.invalid))
    error.status = 409
    throw error
  }

  if (resultCheck.secondEmail.includes(inspecteur.email) && !resultCheck.doublons.includes(inspecteur.email)) {
    resultCheck.doublons.push(inspecteur.email)
  }

  if (resultCheck.doublons.length) {
    const error = new Error(EMAIL_ALREADY_SET(resultCheck.doublons))
    error.status = 409
    throw error
  }

  inspecteur.secondEmail = resultCheck.secondEmail

  foundInspecteur = await Inspecteur.findOne({
    email: { $in: inspecteur.secondEmail },
  })

  if (foundInspecteur) {
    const error = new Error(EMAIL_EXISTE(foundInspecteur.email))
    error.status = 409
    throw error
  }

  const emails = [...inspecteur.secondEmail, inspecteur.email]
  foundInspecteur = await Inspecteur.findOne({
    secondEmail: { $in: emails },
  })

  if (foundInspecteur) {
    const error = new Error(EMAIL_EXISTE(foundInspecteur.secondEmail.filter(email => emails.includes(email))))
    error.status = 409
    throw error
  }
})

const Inspecteur = mongoose.model('Inspecteur', InspecteurSchema)
export default Inspecteur

/**
 * @typedef {Object} InspecteurMongooseDocument
 * @mixes import('mongoose').Document
 *
 * @property {string} email - Adresse courriel de l'IPCSR
 * @property {string} matricule - Matricule de l'IPCSR
 * @property {string} departement - Département d'intervention de l'IPCSR
 * @property {string} nom - Nom de l'IPCSR
 * @property {string} prenom - Prénom de l'IPCSR
 */
