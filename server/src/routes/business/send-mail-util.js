import { appLogger } from '../../util'

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
