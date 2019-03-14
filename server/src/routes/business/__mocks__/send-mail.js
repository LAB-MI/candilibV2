export const sendMail = async (to, { subject, content: html } = {}) => {
  return true
}

export const sendMailToAccount = async (candidat, flag) => {
  return sendMail()
}

export const sendMagicLink = async (candidat, token) => {
  return sendMail()
}

export const sendMailConvocation = async reservation => {
  return sendMail()
}
