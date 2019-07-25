import { Types } from 'mongoose'
import { getHtmlBody } from './mail/body-mail-template'
import { buildMailResaArgsValidation } from './send-mail-util'
import { getFrenchFormattedDateTime } from '../../util/date.util'
import { getCancelBookingByAdminTemplate, getUrlFAQ, getUrlRESA } from './mail'
import { appLogger } from '../../util'
import { findCentreById } from '../../models/centre'

const section = 'candidat-sendMail'

export const getCancellationByAdminBody = async (place, candidat) => {
  const action = 'get-body-cancellation'
  appLogger.debug({ func: 'sendMailCancellation', action, place, candidat })

  const { centre, date } = place
  let centreObject = centre
  if (centre instanceof Types.ObjectId) {
    centreObject = await findCentreById(centre)
  }
  const { nom, adresse } = centreObject
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

  const body = getCancelBookingByAdminTemplate(
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
