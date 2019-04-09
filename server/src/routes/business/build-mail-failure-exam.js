import { getHtmlBody } from './mail/body-mail-template'
import { buildMailResaArgsValidation } from './send-mail-util'
import { dateTimeToFormatFr } from '../../util/date.util'
import { getUrlFAQ, getUrlRESA } from './mail'
import { appLogger } from '../../util'
import { getEpreuvePratiqueKOTemplate } from './mail/epreuve-pratique-ko-template'

const section = 'candidat-sendMail'

export const getFailureExamBody = (place, candidat) => {
  const action = 'get-body-failure-exam'
  appLogger.debug({ func: 'getFailureExamBody', action, place, candidat })

  const { centre, date } = place
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

  const body = getEpreuvePratiqueKOTemplate(
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
