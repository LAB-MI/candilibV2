/**
 * Fonctions métiers pour la gestion des candidats
 *
 * @module
 */

import { findCandidatById, updateCandidatEmail, updateCandidatHomeDepartement, deleteCandidatCanBookFrom, updateCandidatPhoneNumber } from '../../models/candidat'
import { sendMailUpdateCandidatEmail } from '../business'
import { appLogger } from '../../util'
import { findUserById } from '../../models/user'

export const getCandidat = async (candidatId) => {
  const candidat = await findCandidatById(candidatId)
  if (!candidat) {
    const error = new Error('Candidat non trouvé')
    error.status = 400
    throw error
  }
  return candidat
}

/**
 * Modifier l'adresse mail du candidat
 * @param {*} candidat - document mongoose d'un candidat
 * @param {string} newEmail
 */
export const modifyCandidatEmail = async (candidatId, newEmail, loggerInfo) => {
  const candidat = await getCandidat(candidatId)
  const { email, codeNeph, nomNaissance } = candidat
  const newEmailToLower = newEmail.toLowerCase()
  if (email.toLowerCase() === newEmailToLower) {
    const error = new Error(`Pas de modification pour le candidat ${codeNeph}/${nomNaissance}. La nouvelle adresse courriel est identique à l'ancienne.`)
    error.status = 400
    throw error
  }
  const updatedCandidat = await updateCandidatEmail(candidat, newEmailToLower)
  const messages = []
  try {
    await sendMailUpdateCandidatEmail(updatedCandidat)
  } catch (error) {
    const message = `Le courriel pour ${updatedCandidat.email} n'a pas pu être envoyé`
    appLogger.warn({ ...loggerInfo, description: message, error })
    messages.push(message)
  }
  try {
    await sendMailUpdateCandidatEmail(updatedCandidat, email)
  } catch (error) {
    const message = `Le courriel pour ${email} n'a pas pu être envoyé`
    appLogger.warn({ ...loggerInfo, description: message, error })
    messages.push(message)
  }

  return { candidat: updatedCandidat, messages }
}

/**
 * Modifier le département de résidence du candidat
 * @param {*} candidatId
 * @param {string} homeDepartement
 */
export const modifyCandidatHomeDepartement = async (candidatId, newHomeDepartement) => {
  let candidat = await findCandidatById(candidatId)
  const { homeDepartement } = candidat

  if (homeDepartement === newHomeDepartement) {
    const error = new Error(`Pas de modification pour le candidat ${candidat.codeNeph}/${candidat.nomNaissance}. Le nouveau département de résidence est identique à l'ancien.`)
    error.status = 400
    throw error
  }

  candidat = await updateCandidatHomeDepartement(candidat, newHomeDepartement)

  return { candidat }
}

/**
 * Modifier le numéro de téléphone du candidat
 * @param {*} candidatId
 * @param {string} homeDepartement
 */
export const modifyCandidatPhoneNumber = async (candidatId, newPhoneNumber) => {
  let candidat = await findCandidatById(candidatId)
  const { portable } = candidat

  if (portable === newPhoneNumber) {
    const error = new Error(`Pas de modification pour le candidat ${candidat.codeNeph}/${candidat.nomNaissance}. Le nouveau numéro de  téléphone est identique à l'ancien.`)
    error.status = 400
    throw error
  }

  candidat = await updateCandidatPhoneNumber(candidat, newPhoneNumber)

  return { candidat }
}

export const deletePenalty = async (candidatId, adminId) => {
  const admin = await findUserById(adminId)
  if (!admin) {
    const error = new Error('Adminstrateur non trouvé')
    error.status = 500
    throw error
  }
  const candidat = await getCandidat(candidatId)
  if (!candidat.canBookFrom) {
    const error = new Error("Le candidat n'a pas de date de fin pénalité")
    error.status = 400
    throw error
  }

  if (!admin.departements.includes(candidat.departement)) {
    const error = new Error(`Vous n'êtes pas autorisé à retirer la pénalité de ce candidat. Veuillez contacter les répartiteurs du département ${candidat.departement}.`)
    error.status = 400
    throw error
  }

  const candidatUpdated = await deleteCandidatCanBookFrom(candidat, admin)
  return candidatUpdated
}
