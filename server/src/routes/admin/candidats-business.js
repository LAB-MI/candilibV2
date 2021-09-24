/**
 * Fonctions métiers pour la gestion des candidats
 *
 * @module
 */

import { findCandidatById, updateCandidatEmail } from '../../models/candidat'
import { sendMailUpdateCandidatEmail } from '../business'
import { appLogger } from '../../util'

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
export const modifyCandidatEmail = async (candidat, newEmail, loggerInfo) => {
  const { email } = candidat
  const newEmailToLower = newEmail.toLowerCase()
  if (email.toLowerCase() === newEmailToLower) {
    const error = new Error(`Pas de modification pour le candidat ${candidat.codeNeph}/${candidat.nomNaissance}. La nouvelle adresse courriel est identique à l'ancienne.`)
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
