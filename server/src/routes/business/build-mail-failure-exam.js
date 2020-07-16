import { Types } from 'mongoose'
import { findCentreById } from '../../models/centre'
import { appLogger } from '../../util'
import { getFrenchFormattedDateTime } from '../../util/date-util'
import { getUrlFAQ } from './mail'
import { getHtmlBody } from './mail/body-mail-template'
import { getEpreuvePratiqueKOTemplate } from './mail/epreuve-pratique-ko-template'
import {
  buildMailResaArgsValidation,
  getContactUs,
  getUrlRESAByToken,
  getCandidatToken,
} from './send-mail-util'

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
  const { _id, nomNaissance, codeNeph } = candidat

  const urlFAQ = getUrlFAQ()
  const token = getCandidatToken(_id)
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

  const body = getEpreuvePratiqueKOTemplate(
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
