import { getHtmlBody } from './mail/body-mail-template'
import {
  buildMailResaArgsValidation,
  getUrlRESAByToken,
  getContactUs,
  getCandidatToken,
} from './send-mail-util'
import { getFrenchFormattedDateTime } from '../../util/date-util'
import { getCancelBookingTemplate, getUrlFAQ } from './mail'

const section = 'candidat-sendMail'

export const getCancellationBody = (place, candidat) => {
  const action = 'get-body-cancellation'
  // appLogger.debug({ func: 'sendMailCancellation', action, place, candidat })

  const { centre, date } = place
  const { nom, adresse } = centre
  const { _id, nomNaissance, codeNeph, candidatStatus } = candidat
  const urlFAQ = getUrlFAQ()
  const token = getCandidatToken(_id, candidatStatus)
  const urlRESA = getUrlRESAByToken(token)
  const contactezNous = getContactUs(token)

  buildMailResaArgsValidation(
    date,
    nom,
    adresse,
    nomNaissance,
    codeNeph,
    section,
    action,
    urlFAQ,
    urlRESA,
  )

  const dateTimeResa = getFrenchFormattedDateTime(date)

  const body = getCancelBookingTemplate(
    nomNaissance,
    codeNeph,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour,
    urlRESA,
    urlFAQ,
    contactezNous,
  )

  return getHtmlBody(body)
}
