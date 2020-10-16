import ArchivedCandidat from './archived-candidat.model'
import Place from '../place/place.model'
import moment from 'moment'

export const createArchivedCandidat = async candidatData => {
  const candidat = await ArchivedCandidat.create(candidatData)
  return candidat
}

export const createArchivedCandidatFromCandidat = async (
  candidat,
  archiveReason,
) => {
  const { _id: candidatId } = candidat
  const candidatData = {
    ...candidat,
    candidatId,
    archiveReason,
  }
  delete candidatData._id
  const archiviedCandidat = await ArchivedCandidat.create(candidatData)
  return archiviedCandidat
}

export const countArchivedCandidats = async () =>
  ArchivedCandidat.countDocuments()

export const findAllArchivedCandidatsLean = async (limit = 20, skip = 0) => {
  const candidats = await ArchivedCandidat.find({}, null, {
    limit,
    skip,
  }).lean()
  return candidats
}

export const findArchivedCandidatByCandidatId = async candidatId => {
  const candidat = await ArchivedCandidat.findOne({ candidatId })
  return candidat
}

export const findArchivedCandidatByEmail = async email => {
  const candidat = await ArchivedCandidat.findOne({ email })
  return candidat
}

export const findArchivedCandidatById = async (id, options) => {
  const candidat = await ArchivedCandidat.findById(id, options)
  return candidat
}

export const findActiveArchivedCandidatByEmail = async email => {
  const candidat = await ArchivedCandidat.findOne({
    email,
    archived: undefined,
  })
  return candidat
}

export const findArchivedCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await ArchivedCandidat.findOne({ nomNaissance, codeNeph })
  return candidat
}

export const findArchivedCandidatByNomNephFullText = async $search => {
  const candidat = await ArchivedCandidat.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } },
  ).sort({ score: { $meta: 'textScore' } })
  return candidat
}

export const deleteArchivedCandidatByNomNeph = async (
  nomNaissance,
  codeNeph,
) => {
  const candidat = await ArchivedCandidat.findOne({ nomNaissance, codeNeph })
  if (!candidat) {
    throw new Error('No candidat found')
  }
  await candidat.delete()
  return candidat
}

export const deleteArchivedCandidat = async candidat => {
  if (!candidat) {
    throw new Error('No candidat given')
  }
  await candidat.delete()
  return candidat
}

export const updateArchivedCandidatEmail = async (candidat, email) => {
  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.updateOne({ email })
  const updatedArchivedCandidat = await ArchivedCandidat.findById(candidat._id)
  return updatedArchivedCandidat
}

export const findBookedArchivedCandidats = async (date, inspecteur, centre) => {
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
  if (centre && centre.trim().length > 0) query = query.where('centre', centre)

  const places = await query.exec()
  if (places) {
    const candidats = await Promise.all(
      places.map(async place => {
        const { candidat: id } = place
        const candidat = await ArchivedCandidat.findById(id)
        if (!candidat) return {}
        candidat.place = place
        return candidat
      }),
    )
    return candidats
  }
  return null
}

export const updateArchivedCandidatSignUp = async (candidat, data) => {
  const { prenom, email, portable, adresse } = data

  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.updateOne({ prenom, email, portable, adresse })
  const updatedArchivedCandidat = await ArchivedCandidat.findById(candidat._id)
  return updatedArchivedCandidat
}

export const updateArchivedCandidatById = async (id, updatedData) => {
  const updateInfo = await ArchivedCandidat.findByIdAndUpdate(id, updatedData)
  return updateInfo
}
