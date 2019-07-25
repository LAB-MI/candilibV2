import { getFrenchFormattedDateTime } from '../../util/date.util'
import { getHtmlBody } from './mail/body-mail-template'
import { getConvocationTemplate } from './mail/convocation-template'
import { getUrlFAQ, getUrlRESA } from './mail/mail.constants'
import { buildMailResaArgsValidation } from './send-mail-util'

const section = 'candidat-sendMail'

export const getConvocationBody = place => {
  const action = 'get-body-convocation'
  const { centre, date, candidat } = place
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
