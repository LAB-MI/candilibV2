import Candidat from './candidat.model'

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

export const findActiveCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email, archived: undefined })
  return candidat
}

export const findCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.findOne({ nomNaissance, codeNeph })
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
