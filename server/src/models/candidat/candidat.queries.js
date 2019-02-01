import Candidat from './candidat.model'
import Place from '../place/place.model'
import moment from 'moment'

export const createCandidat = async ({
  codeNeph,
  nomNaissance,
  prenom,
  portable,
  email,
  adresse,
}) => {
  const candidat = await new Candidat({
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

export const deleteCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.findOne({ nomNaissance, codeNeph })
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

export const findBookedCandidats = async (date, inspecteur, centre) => {
  let query = Place.where('bookedBy').exists(true)
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
        const { bookedBy: id } = place
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
