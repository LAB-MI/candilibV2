import { appLogger } from '../../util'
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

  buildMailResaArgsValidation(
    date,
    nom,
    adresse,
    nomNaissance,
    codeNeph,
    section,
    action
  )

  const urlFAQ = getUrlFAQ()
  const urlRESA = getUrlRESA()

  if (!urlFAQ || !urlRESA) {
    const message =
      'Les informations lien de la FAQ ou de la réservation sont manquantes.'
    appLogger.error({
      section,
      action,
      arguments: {
        urlFAQ,
        urlRESA,
      },
      message,
    })
    throw new Error(
      'Les informations lien de la FAQ ou de la réservation sont manquantes.'
    )
  }

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
