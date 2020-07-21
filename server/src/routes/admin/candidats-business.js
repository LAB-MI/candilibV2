/**
 * Fonctions métiers pour la gestion des candidats
 *
 * @module
 */

import { findCandidatById, updateCandidatEmail } from '../../models/candidat'

/**
 * Modifier l'adresse mail du candidat
 * @param {*} candidatId
 * @param {string} newEmail
 */
export const modifyCandidatEmail = async (candidatId, newEmail) => {
  let candidat = await findCandidatById(candidatId)
  const newEmailToLower = newEmail.toLowerCase()
  if (candidat.email.toLowerCase() === newEmailToLower) {
    const error = new Error(`Pas de modification pour le candidat ${candidat.codeNeph}/${candidat.nomNaissance}. La nouvelle adresse courriel est identique à l'ancienne.`)
    error.status = 400
    throw error
  }
  candidat = await updateCandidatEmail(candidat, newEmailToLower)

  return candidat
}
