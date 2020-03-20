import { getUrlFAQ, getUrlRESA, getHtmlBody } from './mail'
import { getEmailDepartementOfCandidat } from './send-mail-util'
import config from '../../config'

export const getNoSuccessAtExamBody = async (candidat, fnGetTemplate) => {
  const { _id, nomNaissance, departement } = candidat

  const urlFAQ = getUrlFAQ()
  const urlRESA = getUrlRESA(_id)
  const timeoutToRetry = config.timeoutToRetry
  let contactezNous = ''
  try {
    contactezNous = await getEmailDepartementOfCandidat(departement)
  } catch (error) {}

  const body = fnGetTemplate(
    nomNaissance,
    timeoutToRetry,
    urlRESA,
    urlFAQ,
    contactezNous
  )
  return getHtmlBody(body)
}
