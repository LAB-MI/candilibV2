import { getHtmlBody } from './mail/body-mail-template'
import { buildMailResaArgsValidation } from './send-mail-util'
import { dateTimeToFormatFr } from '../../util/date.util'
import { getUrlFAQ, getUrlRESA } from './mail'
import { appLogger } from '../../util'
import { getEpreuvePratiqueKOTemplate } from './mail/epreuve-pratique-ko-template'
import { findCentreById } from '../../models/centre'
import { Types } from 'mongoose'

const section = 'candidat-sendMail'

export const getFailureExamBody = async (place, candidat) => {
  const action = 'get-body-failure-exam'
  appLogger.debug({ func: 'getFailureExamBody', action, place, candidat })

  const { centre, date } = place

  let centreObject = centre
  if (centre instanceof Types.ObjectId) {
    centreObject = await findCentreById(centre)
  }

  const { nom, adresse } = centreObject
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
