import { appLogger } from '../../util'
import { findDepartementById } from '../../models/departement'
import config from '../../config'
import { addEmailValidationHash } from '../../models/user'

export function buildMailResaArgsValidation (
  date,
  nom,
  adresse,
  nomNaissance,
  codeNeph,
  section,
  action,
  urlFAQ,
  urlRESA
) {
  if (!date || !nom || !adresse || !nomNaissance || !codeNeph) {
    const message =
      'Les informations date, nom, adresse, nom de naissance ou code Neph sont manquantes.'
    appLogger.error({
      section,
      action,
      arguments: {
        date,
        nom,
        adresse,
        nomNaissance,
        codeNeph,
      },
      description: message,
    })
    throw new Error(message)
  }
  if (!urlFAQ || !urlRESA) {
    const message =
      'Les informations lien de la FAQ ou de la réservation sont manquantes.'
    appLogger.error({
      section,
      action,
      arguments: {
        urlFAQ,
        urlRESA,
      },
      description: message,
    })
    throw new Error(message)
  }
}

export const getEmailDepartementOfCandidat = async departementId => {
  const infoLogger = {
    section: 'send-mail-util',
    func: 'getEmailDepartementOfCandidat',
    arguments: {
      departementId,
    },
  }
  try {
    const departementInfo = await findDepartementById(departementId)
    if (departementInfo && departementInfo.email) {
      return `Vous pouvez nous contacter à cette adresse <a href="mailto:${departementInfo.email}">${departementInfo.email}</a>`
    }
    const message = `L'adresse courriel du département: ${departementId} est manquante.`
    appLogger.error({
      ...infoLogger,
      description: message,
    })
    return ''
  } catch (error) {
    const message = `Une erreur s'est produite lors de la récupération des informations du département: ${departementId}.`
    appLogger.error({
      ...infoLogger,
      description: message,
    })
    throw new Error(message)
  }
}

/**
 * Renvoi le lien de réinitialisation contenant le hash
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 */

export const getUrlResetLink = async email => {
  const emailValidationHash = await addEmailValidationHash(email)
  return `${config.ADMIN_URL}/reset-link?email=${encodeURIComponent(
    email
  )}&hash=${encodeURIComponent(emailValidationHash)}`
}
