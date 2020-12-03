import { getFrenchFormattedDateTime } from '../../util/date-util'
import { getHtmlBody } from './mail/body-mail-template'
import { getConvocationTemplate } from './mail/convocation-template'
import { getUrlFAQ } from './mail/mail.constants'
import {
  buildMailResaArgsValidation,
  getCandidatToken,
  getUrlRESAByToken,
  getContactUs,
} from './send-mail-util'

const section = 'candidat-sendMail'

export const getConvocationBody = async place => {
  const action = 'get-body-convocation'
  const { centre, date, candidat } = place
  const { nom, adresse, geoloc, departement } = centre
  const { _id, nomNaissance, codeNeph } = candidat

  const [lon, lat] = geoloc.coordinates

  const linkOfLocalisation = `http://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=24`

  const urlFAQ = getUrlFAQ()
  const token = await getCandidatToken(_id, candidat)
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

  const body = getConvocationTemplate(
    nomNaissance,
    nom,
    dateTimeResa.date,
    dateTimeResa.hour,
    codeNeph,
    adresse,
    urlRESA,
    urlFAQ,
    contactezNous,
    departement,
    linkOfLocalisation,
  )

  return getHtmlBody(body)
}
