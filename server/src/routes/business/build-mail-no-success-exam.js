import { getUrlFAQ, getHtmlBody } from './mail'
import {
  getContactUs,
  getCandidatToken,
  getUrlRESAByToken,
} from './send-mail-util'
import config from '../../config'

export const getNoSuccessAtExamBody = async (candidat, fnGetTemplate) => {
  const { _id, nomNaissance } = candidat

  const urlFAQ = getUrlFAQ()
  const timeoutToRetry = config.timeoutToRetry
  const token = await getCandidatToken(_id, candidat)
  const urlRESA = getUrlRESAByToken(token)
  const contactezNous = getContactUs(token)

  const body = fnGetTemplate(
    nomNaissance,
    timeoutToRetry,
    urlRESA,
    urlFAQ,
    contactezNous,
  )
  return getHtmlBody(body)
}
