import { appLogger } from '../../util'
import { findDepartementById } from '../../models/departement'

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
      return `<a href="mailto:${departementInfo.email}"> Contactez-nous </a>`
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
