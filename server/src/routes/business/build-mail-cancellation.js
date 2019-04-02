import { getHtmlBody } from './mail/body-mail-template'
import { buildMailResaArgsValidation } from './send-mail-util'
import { dateTimeToFormatFr } from '../../util/date.util'
import { getCancelBookingTemplate, getUrlFAQ, getUrlRESA } from './mail'

const section = 'candidat-sendMail'

export const getCancellationBody = place => {
  const action = 'get-body-cancellation'
  console.log({ func: 'sendMailCancellation', action, place })

  const { centre, date, candidat } = place
  const { nom, adresse } = centre
  const { nomNaissance, codeNeph } = candidat
  const urlFAQ = getUrlFAQ()
  const urlRESA = getUrlRESA()

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

  const dateTimeResa = dateTimeToFormatFr(date)

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
