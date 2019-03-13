import { DateTime } from 'luxon'

import logger from '../../util/logger'
import { getConvocationTemplate } from './mail/convocation-template'
import { getUrlFAQ, getUrlRESA } from './mail/mail.constants'
import { getHtmlBody } from './mail/body-mail-template'

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
    logger.error(
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
      'Les information date, nom, adresse, nom de naissance ou code Neph sont manquantes.'
    )
  }

  const dateTimeResa = DateTime.fromJSDate(date).setLocale('fr')
  if (!dateTimeResa || !dateTimeResa.isValid) {
    throw new Error("la date n'est pas une date.")
  }

  const dateResaStr = dateTimeResa.toFormat('cccc dd LLLL yyyy')

  const houreResaStr = dateTimeResa.toLocaleString(DateTime.TIME_24_SIMPLE)
  const body = getConvocationTemplate(
    nomNaissance,
    nom,
    dateResaStr,
    houreResaStr,
    codeNeph,
    adresse,
    urlRESA,
    urlFAQ
  )

  return {
    content: getHtmlBody(body),
    subject: "Convocation à l'examen",
  }
}
