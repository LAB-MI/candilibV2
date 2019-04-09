import {
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
  EPREUVE_PRATIQUE_OK,
  EPREUVE_ETG_KO,
  INSCRIPTION_OK,
  INSCRIPTION_VALID,
  INSCRIPTION_UPDATE,
  AURIGE_OK,
  VALIDATION_EMAIL,
} from '../../util'
import config from '../../config'
import {
  getHtmlBody,
  getInscriptionOkTemplate,
  getValidationMailTemplate,
  getInscriptionKOTemplate,
  getEpreuvePratiqueOKTemplate,
  getEpreuveEtgKoTemplate,
  getInscripionValidTemplate,
  getUrlFAQ,
} from './mail'

const getMailData = async (candidat, flag, urlMagicLink) => {
  const urlFAQ = getUrlFAQ()
  const urlConnexion = `${config.PUBLIC_URL}`

  const { codeNeph, nomNaissance, email, emailValidationHash } = candidat

  const urlValidationEmail = `${
    config.PUBLIC_URL
  }/email-validation?e=${email}&h=${emailValidationHash}`

  const message = {}

  const nomMaj = nomNaissance ? nomNaissance.toUpperCase() : ''

  const INSCRIPTION_OK_MSG = getInscriptionOkTemplate(
    nomMaj,
    urlMagicLink,
    urlConnexion,
    email
  )

  const VALIDATION_EMAIL_MSG = getValidationMailTemplate(
    nomMaj,
    urlValidationEmail,
    urlConnexion
  )

  const INSCRIPTION_KO_MSG = getInscriptionKOTemplate(
    nomMaj,
    codeNeph,
    nomMaj,
    urlFAQ
  )

  const EPREUVE_PRATIQUE_OK_MSG = getEpreuvePratiqueOKTemplate(nomMaj, urlFAQ)

  const EPREUVE_ETG_KO_MSG = getEpreuveEtgKoTemplate(nomMaj, urlFAQ)

  const INSCRIPTION_VALID_MSG = getInscripionValidTemplate(nomMaj)

  switch (flag) {
    case CANDIDAT_NOK:
      message.content = getHtmlBody(INSCRIPTION_KO_MSG)
      message.subject = 'Inscription Candilib non validée'
      return message
    case VALIDATION_EMAIL:
      message.content = getHtmlBody(VALIDATION_EMAIL_MSG)
      message.subject = "Validation d'adresse email pour Candilib"
      return message
    case INSCRIPTION_VALID:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = "Confirmation d'inscription Candilib"
      return message
    case CANDIDAT_NOK_NOM:
      message.content = getHtmlBody(INSCRIPTION_KO_MSG)
      message.subject = 'Inscription Candilib non validée'
      return message
    case EPREUVE_PRATIQUE_OK:
      message.content = getHtmlBody(EPREUVE_PRATIQUE_OK_MSG)
      message.subject = 'Problème inscription Candilib'
      return message
    case INSCRIPTION_OK:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = 'Inscription Candilib en attente de vérification'
      return message
    case EPREUVE_ETG_KO:
      message.content = getHtmlBody(EPREUVE_ETG_KO_MSG)
      message.subject = 'Problème inscription Candilib'
      return message
    case AURIGE_OK:
      message.content = getHtmlBody(INSCRIPTION_OK_MSG)
      message.subject = 'Validation de votre inscription à Candilib'
      return message
    case INSCRIPTION_UPDATE:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = 'Inscription Candilib en attente de vérification'
      return message
    default:
      return ''
  }
}

export default getMailData
