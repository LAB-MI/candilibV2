import { getHtmlBody } from './mail/body-mail-template'
import { validateArgsToBuildBodyMailResa } from './send-mail-util'
import { dateTimeToDateAndHourFormat } from '../../util/date.util'
import { getCancelBookingTemplate } from './mail'

const section = 'candidat-sendMail'

export const getCancellationBody = place => {
  const action = 'get-body-cancellation'
  const { centre, date, bookedBy } = place
  const { nom, adresse } = centre
  const { nomNaissance, codeNeph } = bookedBy

  validateArgsToBuildBodyMailResa(
    date,
    nom,
    adresse,
    nomNaissance,
    codeNeph,
    section,
    action
  )

  const dateTimeResa = dateTimeToDateAndHourFormat(date)

  const body = getCancelBookingTemplate(
    nomNaissance,
    codeNeph,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour
  )

  return getHtmlBody(body)
}
