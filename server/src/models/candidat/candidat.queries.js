import { DateTime } from 'luxon'
import moment from 'moment'

import ArchivedCandidat from '../archived-candidat/archived-candidat.model'
import Candidat from './candidat.model'
import Place from '../place/place.model'
import { appLogger } from '../../util'

export const createCandidat = async ({
  adresse,
  codeNeph,
  email,
  emailValidationHash,
  isValidatedEmail,
  nomNaissance,
  portable,
  prenom,
}) => {
  const candidat = await new Candidat({
    adresse,
    codeNeph,
    email,
    emailValidationHash,
    isValidatedEmail,
    nomNaissance,
    portable,
    prenom,
    presignedUpAt: new Date(),
  })
  await candidat.save()
  return candidat
}

export const findAllCandidatsLean = async () => {
  const candidats = await Candidat.find({}).lean()
  return candidats
}

export const findCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email })
  return candidat
}

export const findCandidatById = async (id, options) => {
  const candidat = await Candidat.findById(id, options)
  return candidat
}

export const findActiveCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email, archived: undefined })
  return candidat
}

export const findCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.findOne({ nomNaissance, codeNeph })
  return candidat
}

export const deleteCandidatByNomNeph = async (
  nomNaissance,
  codeNeph,
  reason
) => {
  const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)
  if (!candidat) {
    throw new Error('No candidat found')
  }
  await deleteCandidat(candidat, reason)
  return candidat
}

export const deleteCandidat = async (candidat, reason) => {
  if (!candidat) {
    throw new Error('No candidat given')
  }
  try {
    const cleanedCandidat = candidat.toObject ? candidat.toObject() : candidat
    delete cleanedCandidat._id
    cleanedCandidat.archiveReason = reason
    await ArchivedCandidat.create(cleanedCandidat)
  } catch (error) {
    appLogger.warn(
      `Could not archive candidat: ${candidat.nomNaissance} ${candidat.codeNeph}
      ${error.message}`
    )
  }
  await Candidat.findByIdAndDelete(candidat._id)
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

export const findBookedCandidats = async (date, inspecteur, centre) => {
  let query = Place.where('candidat').exists(true)
  if (date && moment(date).isValid()) {
    const startDate = moment(date)
      .startOf('day')
      .toISOString()
    const endDate = moment(date)
      .endOf('day')
      .toISOString()
    query
      .where('date')
      .gte(startDate)
      .lt(endDate)
  }

  if (inspecteur && inspecteur.trim().length > 0) {
    query = query.where('inspecteur', inspecteur)
  }

  if (centre) query = query.where('centre', centre)

  const places = await query.populate('centre').exec()
  if (places) {
    const candidats = await Promise.all(
      places.map(async place => {
        const { candidat: id } = place
        const candidat = await Candidat.findById(id)
        if (!candidat) return {}
        candidat.place = place
        return candidat
      })
    )
    return candidats
  }
  return null
}

export const updateCandidatSignUp = async (candidat, data) => {
  const { prenom, email, portable, adresse } = data

  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.update({ prenom, email, portable, adresse })
  const updatedCandidat = await Candidat.findById(candidat._id)
  return updatedCandidat
}

export const updateCandidatById = async (id, updatedData) => {
  const updateInfo = await Candidat.findByIdAndUpdate(id, updatedData)
  return updateInfo
}

export const updateCandidatCanAfterBook = async (candidat, canBookFrom) => {
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

export const buildAddArchivePlace = (candidat, place, reason) => {
  const { _id, inspecteur, centre, date } = place
  const archivedAt = DateTime.local()
  const archiveReason = reason

  if (!candidat.places) {
    candidat.places = []
  }
  candidat.places.push({
    _id,
    inspecteur,
    centre,
    date,
    archivedAt,
    archiveReason,
  })
  return candidat
}

export const addArchivePlace = async (candidat, place, reason) => {
  candidat = buildAddArchivePlace(candidat, place, reason)
  return candidat.save()
}

export const updateCandidatFailed = async (
  candidat,
  { dateDernierEchecPratique, canBookFrom }
) => {
  candidat.dateDernierEchecPratique = dateDernierEchecPratique
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}
