import config from '../../../config'
import { createToken } from '../../../util'

export const getUrlFAQ = () => `${config.PUBLIC_URL}/faq`
export const getUrlRESA = (id) => {
  const token = createToken(id, config.userStatuses.CANDIDAT)
  return `${config.PUBLIC_URL}/candidat/home?token=${token}`
}
