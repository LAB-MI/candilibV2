import { DateTime } from 'luxon'

import { appLogger } from '../../util'
import { getConvocationTemplate } from './mail/convocation-template'
import { getUrlFAQ, getUrlRESA } from './mail/mail.constants'
import { getHtmlBody } from './mail/body-mail-template'
import { dateTimeToDateAndHourFormat } from '../../util/date.util'

export const getConvocationBody = place => {
  const { centre, date, bookedBy } = place
  const { nom, adresse } = centre
  const { nomNaissance, codeNeph } = bookedBy
  const urlFAQ = getUrlFAQ()
  const urlRESA = getUrlRESA()

  if (
    !date ||
    !nom ||
    !adresse ||
    !nomNaissance ||
    !codeNeph ||
    !urlFAQ ||
    !urlRESA
  ) {
    appLogger.error(
      JSON.stringify({
        date,
        nom,
        adresse,
        nomNaissance,
        codeNeph,
        urlFAQ,
        urlRESA,
      })
    )
    throw new Error(
      'Les informations date, nom, adresse, nom de naissance ou code Neph sont manquantes.'
    )
  }

  const dateTimeResa = DateTime.fromJSDate(date)
  if (!dateTimeResa || !dateTimeResa.isValid) {
    throw new Error("La date n'est pas une date.")
  }

  const datetimeStr = dateTimeToDateAndHourFormat(dateTimeResa)
  const body = getConvocationTemplate(
    nomNaissance,
    nom,
    datetimeStr.date,
    datetimeStr.houre,
    codeNeph,
    adresse,
    urlRESA,
    urlFAQ
  )

  return {
    content: getHtmlBody(body),
    subject: "Convocation à l'examen pratique du permis de conduire",
  }
}
