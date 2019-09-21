import { sendMail } from './send-mail'
import { getHtmlBody } from './mail'

export const sendMailConfirmation = (email) => {
  const mail = getMailConfirmation()
  return sendMail(email, mail)
}

export const getMailConfirmationTemplate = (email) => `
  <p>Votre mot de passe correspondant à l'adresse email ${email} à bien été 
  réinitialisé. 
  </p>
  <br>
  <p align="right">L'équipe Candilib</p>
`

export const getMailConfirmationBody = (email) => {
  const body = getMailConfirmationTemplate(email)
  return getHtmlBody(body)
}

export const getMailConfirmation = (email) => {
  const subject = 'Votre mot de passe à été réinitialisé'
  const content = getMailConfirmationBody(email)
  return { subject, content }
}
