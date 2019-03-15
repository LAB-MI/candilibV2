import moment from 'moment'

import {
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
  EPREUVE_PRATIQUE_OK,
  EPREUVE_ETG_KO,
  INSCRIPTION_OK,
  INSCRIPTION_VALID,
  INSCRIPTION_UPDATE,
  AURIGE_OK,
  MAIL_CONVOCATION,
  ANNULATION_CONVOCATION,
  VALIDATION_EMAIL,
} from '../../util'
import config from '../../config'
import { findAllCentres } from '../../models/centre'
import {
  getHtmlBody,
  getCancelBookingTemplate,
  getConvocationTemplate,
  getInscriptionOkTemplate,
  getValidationMailTemplate,
  getInscriptionKOTemplate,
  getEpreuvePratiqueOKTemplate,
  getEpreuveEtgKoTemplate,
  getInscripionValidTemplate,
} from './mail'

const getCentres = async () => findAllCentres()

const getMailData = async (candidat, flag, urlMagicLink) => {
  const urlFAQ = `${config.PUBLIC_URL}/informations`
  const urlRESA = `${config.PUBLIC_URL}/auth?redirect=calendar`
  const urlConnexion = `${config.PUBLIC_URL}`

  const { codeNeph, nomNaissance, place, email, emailValidationHash } = candidat

  const urlValidationEmail = `${
    config.PUBLIC_URL
  }/email-validation?e=${email}&h=${emailValidationHash}`

  const message = {}

  const nomMaj = nomNaissance ? nomNaissance.toUpperCase() : ''

  const site = place && place.title ? place.title : ''
  const dateCreneau =
    place && place.start ? moment(place.start).format('DD MMMM YYYY') : ''
  const heureCreneau =
    place && place.start ? moment(place.start).format('HH:mm') : ''

  let siteAdresse = []

  if (place && place.title) {
    const sites = await getCentres()
    siteAdresse = sites.find(item => item.nom.toUpperCase() === place.title)
  }

  const ANNULATION_CONVOCATION_MSG = getCancelBookingTemplate(nomMaj, codeNeph)

  const MAIL_CONVOCATION_MSG = getConvocationTemplate(
    nomMaj,
    site,
    dateCreneau,
    heureCreneau,
    codeNeph,
    siteAdresse.adresse,
    urlRESA,
    urlFAQ
  )

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
    case MAIL_CONVOCATION:
      // TODO : A supprimer les données sont dans le model place
      message.content = getHtmlBody(MAIL_CONVOCATION_MSG)
      message.subject = "Convocation à l'examen"
      return message
    case ANNULATION_CONVOCATION:
      message.content = getHtmlBody(ANNULATION_CONVOCATION_MSG)
      message.subject = "Annulation de Convocation à l'examen"
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
