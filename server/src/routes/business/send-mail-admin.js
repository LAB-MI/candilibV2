import { sendMail } from './send-mail'
import { getHtmlBody } from './mail'
import config from '../../config'
import { addEmailValidationHash } from '../../models/user'

export const getUrlResetLink = async (email) => {
  const emailValidationHash = await addEmailValidationHash(email)
  return `${config.PUBLIC_URL}/reset-link?email=${encodeURIComponent(email)}&hash=${encodeURIComponent(emailValidationHash)}`
}

export const sendMailResetLink = (email) => {
  const urlResetLink = getUrlResetLink(email)
  const mail = getResetLinkMail(urlResetLink)
  return sendMail(email, mail)
}

export const getResetLinkTemplate = (urlResetLink) => `
  <p>Vous avez demandé à réinitialiser votre mot de passe. Vous pouvez dès à present 
  réinitialiser votre mot de passe en cliquant sur le lien suivant ${urlResetLink}
  </p>
  <br>
  <p align="right">L'équipe Candilib</p>
`

export const getResetLinkMailBody = (urlResetLink) => {
  const body = getResetLinkTemplate(urlResetLink)
  return getHtmlBody(body)
}

export const getResetLinkMail = (urlResetLink) => {
  const subject = 'Réinitialisation de votre mot de passe'
  const content = getResetLinkMailBody(urlResetLink)
  return { subject, content }
}
