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

export const getEmailDepartementOfCandidat = async departement => {
  const result = await findDepartementById(departement)
  const { email } = result
  return email ? `<a href="mailto:${email}"> Contactez-nous </a>` : ''
}
