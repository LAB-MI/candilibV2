import moment from 'moment'

import ArchivedCandidat from '../archived-candidat/archived-candidat.model'
import Candidat from './candidat.model'
import Place from '../place/place.model'
import { getFrenchLuxon, techLogger } from '../../util'

export const createCandidat = async ({
  adresse,
  codeNeph,
  email,
  emailValidationHash,
  isValidatedEmail,
  nomNaissance,
  portable,
  prenom,
  departement,
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
    departement,
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
  if (options && options.dateDernierEchecPratique) {
    options.noReussites = 1
  }
  const candidat = await Candidat.findById(id, options)
  return candidat
}

export const findCandidatsMatching = async $search => {
  const search = new RegExp($search, 'i')

  const candidats = await Candidat.find({
    $or: [
      { nomNaissance: search },
      { prenom: search },
      { codeNeph: search },
      { email: search },
    ],
  })
  const fullTextCandidats = await Candidat.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })

  return [
    ...candidats,
    ...fullTextCandidats.filter(
      candidat =>
        !candidats.some(cand => cand._id.toString() === candidat._id.toString())
    ),
  ]
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
    techLogger.error({
      func: 'query-candidat-delete',
      action: 'archive-candidat',
      description: `Could not archive candidat: ${candidat.nomNaissance} ${candidat.codeNeph} ${error.message}`,
      error,
    })
  }
  await Candidat.findByIdAndDelete(candidat._id)
  return candidat
}

export const updateCandidatEmail = async (candidat, email) => {
  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.updateOne({ email })
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

  if (inspecteur) {
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
  await candidat.updateOne({ prenom, email, portable, adresse })
  const updatedCandidat = await Candidat.findById(candidat._id)
  return updatedCandidat
}

export const updateCandidatById = async (id, updatedData) => {
  const updateInfo = await Candidat.findByIdAndUpdate(id, updatedData)
  return updateInfo
}

export const updateCandidatCanBookFrom = async (candidat, canBookFrom) => {
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

export const setCandidatFirstConnection = async id => {
  const candidat = await findCandidatById(id)
  if (!candidat.firstConnection) {
    candidat.firstConnection = new Date()
    return candidat.save()
  }
  return candidat
}

export const addPlaceToArchive = (
  candidat,
  place,
  reason,
  byUser,
  isCandilib
) => {
  const { _id, inspecteur, centre, date, bookedAt, bookedByAdmin } = place
  const archivedAt = getFrenchLuxon()
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
    byUser,
    isCandilib,
    bookedAt,
    bookedByAdmin,
  })
  return candidat
}

export const archivePlace = async (
  candidat,
  place,
  reason,
  byUser,
  isCandilib
) => {
  candidat = addPlaceToArchive(candidat, place, reason, byUser, isCandilib)
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

export const updateCandidatNoReussite = async (
  candidat,
  { lastNoReussite, canBookFrom }
) => {
  candidat.lastNoReussite = lastNoReussite
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

export const setCandidatToVIP = (candidat, resaCanceledByAdmin) => {
  candidat.resaCanceledByAdmin = resaCanceledByAdmin
  return candidat.save()
}

export const isCandidatExisting = async _id => {
  const isExist = await Candidat.exists({ _id })
  return isExist
}

export const countCandidatsInscritsByDepartement = async departement => {
  return Candidat.countDocuments({
    departement,
    isValidatedByAurige: true,
  })
}
