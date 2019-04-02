import { getConvocationTemplate } from './mail/convocation-template'
import { getUrlFAQ, getUrlRESA } from './mail/mail.constants'
import { getHtmlBody } from './mail/body-mail-template'
import { dateTimeToFormatFr } from '../../util/date.util'
import { buildMailResaArgsValidation } from './send-mail-util'

const section = 'candidat-sendMail'

export const getConvocationBody = place => {
  const action = 'get-body-convocation'
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

  const body = getConvocationTemplate(
    nomNaissance,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour,
    codeNeph,
    adresse,
    urlRESA,
    urlFAQ
  )

  return getHtmlBody(body)
}
