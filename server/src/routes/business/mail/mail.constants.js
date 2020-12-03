import config from '../../../config'
import { createToken } from '../../../util'

export const getUrlFAQ = () => `${config.PUBLIC_URL}/faq`
export const getUrlRESA = async (candidat) => {
  const {
    _id,
  } = candidat

  const token = await createToken(_id, config.userStatuses.CANDIDAT, undefined, candidat)
  return `${config.PUBLIC_URL}/candidat/home?token=${token}`
}
