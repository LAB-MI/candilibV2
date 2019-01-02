import mongoose from 'mongoose'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../util'

const { Schema } = mongoose

const CandidatSchema = new Schema({
  nomNaissance: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: false,
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
    unique: false,
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
  isValid: {
    type: Boolean,
    required: true,
    default: false,
  },
  creneau: {
    type: Object,
    default: {},
  },
})

CandidatSchema.index({ codeNeph: 1, nomNaissance: 1 }, { unique: true })

const Candidat = mongoose.model('Candidat', CandidatSchema)

export const createCandidat = async ({
  codeNeph,
  nomNaissance,
  prenom,
  portable,
  email,
  adresse,
}) => {
  const candidat = new Candidat({
    codeNeph,
    nomNaissance,
    prenom,
    portable,
    email,
    adresse,
  })
  await candidat.save()
  return candidat
}

export const findCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email })
  return candidat
}

export const deleteCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email })
  if (!candidat) {
    throw new Error('No candidat found')
  }
  await candidat.delete()
  return candidat
}

export const deleteCandidat = async candidat => {
  if (!candidat) {
    throw new Error('No candidat given')
  }
  await candidat.delete()
  return candidat
}

export const updateCandidatEmail = async (candidat, email) => {
  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.update({ email })
  const updatedCandidat = await Candidat.findById(candidat._id)
  return updatedCandidat
}
