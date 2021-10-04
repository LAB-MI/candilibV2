/**
 * Fonctions métiers pour la gestion des candidats
 *
 * @module
 */

import { findCandidatById, updateCandidatEmail, updateCandidatHomeDepartement } from '../../models/candidat'
import { sendMailUpdateCandidatEmail } from '../business'
import { appLogger } from '../../util'

/**
 * Modifier l'adresse mail du candidat
 * @param {*} candidatId
 * @param {string} newEmail
 */
export const modifyCandidatEmail = async (candidatId, newEmail, loggerInfo) => {
  let candidat = await findCandidatById(candidatId)
  const { email } = candidat
  const newEmailToLower = newEmail.toLowerCase()
  if (email.toLowerCase() === newEmailToLower) {
    const error = new Error(`Pas de modification pour le candidat ${candidat.codeNeph}/${candidat.nomNaissance}. La nouvelle adresse courriel est identique à l'ancienne.`)
    error.status = 400
    throw error
  }
  candidat = await updateCandidatEmail(candidat, newEmailToLower)
  const messages = []
  try {
    await sendMailUpdateCandidatEmail(candidat)
  } catch (error) {
    const message = `Le courriel pour ${candidat.email} n'a pas pu être envoyé`
    appLogger.warn({ ...loggerInfo, description: message, error })
    messages.push(message)
  }
  try {
    await sendMailUpdateCandidatEmail(candidat, email)
  } catch (error) {
    const message = `Le courriel pour ${email} n'a pas pu être envoyé`
    appLogger.warn({ ...loggerInfo, description: message, error })
    messages.push(message)
  }

  return { candidat, messages }
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
