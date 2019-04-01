import { appLogger } from '../../util'

export function buildMailResaArgsValidation (
  date,
  nom,
  adresse,
  nomNaissance,
  codeNeph,
  section,
  action
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
      message,
    })
    throw new Error(message)
  }
}
