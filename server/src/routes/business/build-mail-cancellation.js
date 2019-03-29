import { getHtmlBody } from './mail/body-mail-template'
import { validateArgsToBuildBodyMailResa } from './send-mail-util'
import { DateTimeFrFromJSDate } from '../../util/date.util'
import { getCancelBookingTemplate } from './mail'

const section = 'candidat-sendMail'

export const getCancellationBody = place => {
  const action = 'get-body-cancellation'
  const { centre, date, candidat } = place
  const { nom, adresse } = centre
  const { nomNaissance, codeNeph } = candidat

  validateArgsToBuildBodyMailResa(
    date,
    nom,
    adresse,
    nomNaissance,
    codeNeph,
    section,
    action
  )

  const dateTimeResa = DateTimeFrFromJSDate(date)

  const body = getCancelBookingTemplate(
    nomNaissance,
    codeNeph,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour
  )

  return getHtmlBody(body)
}
