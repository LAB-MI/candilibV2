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
  return sendMail()
}

export const sendMagicLink = async (candidat, token) => {
  return sendMail()
}
