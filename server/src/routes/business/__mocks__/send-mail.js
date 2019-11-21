import getMailData from '../message-templates'

let mail
export const __initMail = () => {
  mail = undefined
}

export const getMail = () => mail

export const sendMail = async (to, { subject, content: html } = {}) => {
  mail = { to, subject, html }
  return true
}

export const sendMailToAccount = async (candidat, flag) => {
  const message = await getMailData(candidat, flag)
  return sendMail(candidat.email, message)
}
export const sendMagicLink = async (candidat, token) => {
  return sendMail()
}
