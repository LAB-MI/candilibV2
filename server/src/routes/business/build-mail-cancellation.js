import { getHtmlBody } from './mail/body-mail-template'
import { buildMailResaArgsValidation } from './send-mail-util'
import { getFrenchFormattedDateTime } from '../../util/date-util'
import { getCancelBookingTemplate, getUrlFAQ, getUrlRESA } from './mail'
import { appLogger } from '../../util'

const section = 'candidat-sendMail'

export const getCancellationBody = (place, candidat) => {
  const action = 'get-body-cancellation'
  appLogger.debug({ func: 'sendMailCancellation', action, place, candidat })

  const { centre, date } = place
  const { nom, adresse } = centre
  const { _id, nomNaissance, codeNeph } = candidat
  const urlFAQ = getUrlFAQ()
  const urlRESA = getUrlRESA(_id)

  buildMailResaArgsValidation(
    date,
    nom,
    adresse,
    nomNaissance,
    codeNeph,
    section,
    action,
    urlFAQ,
    urlRESA
  )

  const dateTimeResa = getFrenchFormattedDateTime(date)

  const body = getCancelBookingTemplate(
    nomNaissance,
    codeNeph,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour,
    urlRESA,
    urlFAQ
  )

  return getHtmlBody(body)
}
