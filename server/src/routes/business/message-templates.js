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
  NB_FAILURES_KO,
  EPREUVE_PRATIQUE_OK_BEFORE_SING_UP,
  getFrenchLuxonFromJSDate,
} from '../../util'
import { SUBJECT_MAIL_INFO } from '../business/send-message-constants'
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
  getEpreuvePratiqueOKBeforeTemplate,
} from './mail'
import { getContactUs } from './send-mail-util'
import { getMessageTransistionRdvPermis } from './mail/transition-rdvpermis'
import { placesAndGeoDepartementsAndCentresCache } from '../middlewares'
import { DateTime } from 'luxon'

const getMailData = async (candidat, flag, urlMagicLink) => {
  const urlFAQ = getUrlFAQ()
  const urlConnexion = `${config.PUBLIC_URL}`

  const {
    codeNeph,
    nomNaissance,
    email,
    emailValidationHash,
    canAccessAt,
    homeDepartement,
  } = candidat

  const contactezNous = getContactUs()

  const urlValidationEmail = `${
    config.PUBLIC_URL
  }/email-validation?e=${encodeURIComponent(email)}&h=${emailValidationHash}`
  const message = {}

  const nomMaj = nomNaissance ? nomNaissance.toUpperCase() : ''

  const INSCRIPTION_KO_MSG = getInscriptionKOTemplate(
    nomMaj,
    codeNeph,
    urlFAQ,
    contactezNous,
  )

  const INSCRIPTION_VALID_MSG = getInscripionValidTemplate(
    nomMaj,
    contactezNous,
  )

  switch (flag) {
    case CANDIDAT_NOK:
      message.content = getHtmlBody(INSCRIPTION_KO_MSG)
      message.subject = 'Inscription Candilib non validée'
      return message
    case VALIDATION_EMAIL: {
      const VALIDATION_EMAIL_MSG = getValidationMailTemplate(
        nomMaj,
        urlValidationEmail,
        urlConnexion,
        contactezNous,
      )
      message.content = getHtmlBody(VALIDATION_EMAIL_MSG)
      message.subject = "Validation d'adresse courriel pour Candilib"
      return message
    }
    case INSCRIPTION_VALID:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = "Confirmation d'inscription Candilib"
      return message
    case CANDIDAT_NOK_NOM:
      message.content = getHtmlBody(INSCRIPTION_KO_MSG)
      message.subject = 'Inscription Candilib non validée'
      return message
    case EPREUVE_PRATIQUE_OK: {
      const EPREUVE_PRATIQUE_OK_MSG = getEpreuvePratiqueOKTemplate(
        nomMaj,
        urlFAQ,
        contactezNous,
      )
      message.content = getHtmlBody(EPREUVE_PRATIQUE_OK_MSG)
      message.subject = SUBJECT_MAIL_INFO
      return message
    }
    case EPREUVE_PRATIQUE_OK_BEFORE_SING_UP: {
      const EPREUVE_PRATIQUE_OK_MSG = getEpreuvePratiqueOKBeforeTemplate(
        nomMaj,
        urlFAQ,
        contactezNous,
      )
      message.content = getHtmlBody(EPREUVE_PRATIQUE_OK_MSG)
      message.subject = SUBJECT_MAIL_INFO
      return message
    }
    case INSCRIPTION_OK:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = 'Inscription Candilib en attente de vérification'
      return message
    case EPREUVE_ETG_KO:
    case NB_FAILURES_KO: {
      const EPREUVE_ETG_KO_MSG = getEpreuveEtgKoTemplate(
        nomMaj,
        urlFAQ,
        contactezNous,
      )
      message.content = getHtmlBody(EPREUVE_ETG_KO_MSG)
      message.subject = 'Problème inscription Candilib'
      return message
    }
    case AURIGE_OK: {
      let warningMessage = ''
      const deps = placesAndGeoDepartementsAndCentresCache.getDepartementInfos()
      if (deps[homeDepartement]?.disableAt) {
        // warningMessage = getMessageTransistionRdvPermis('69, 38 et 26', '31/01/2022')
        const date = getFrenchLuxonFromJSDate(deps[homeDepartement].disableAt).toLocaleString(DateTime.DATE_SHORT)
        warningMessage = getMessageTransistionRdvPermis(homeDepartement, date)
      }
      const INSCRIPTION_OK_MSG = getInscriptionOkTemplate(
        nomMaj,
        urlMagicLink ? urlMagicLink.url : undefined,
        urlConnexion,
        email,
        urlMagicLink ? urlMagicLink.urlContactUs : contactezNous,
        canAccessAt,
        warningMessage,
      )
      message.content = getHtmlBody(INSCRIPTION_OK_MSG)
      message.subject = 'Validation de votre inscription à Candilib'
      return message
    }
    case INSCRIPTION_UPDATE:
      message.content = getHtmlBody(INSCRIPTION_VALID_MSG)
      message.subject = 'Inscription Candilib en attente de vérification'
      return message
    default:
      return ''
  }
}

export default getMailData
