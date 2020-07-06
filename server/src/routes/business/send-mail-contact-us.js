import {
  getHtmlBody,
  getContactUsForAdmin,
  getContactUsForCandidat,
} from './mail'

import { sendMail } from './send-mail'

export const sendMailContactUsForAdmin = (
  emailDep,
  candidat,
  hasSignup,
  subject,
  message,
) => {
  const {
    codeNeph,
    nomNaissance,
    prenom,
    email,
    portable,
    homeDepartement,
  } = candidat

  const body = getContactUsForAdmin(
    codeNeph,
    nomNaissance,
    prenom || ' ',
    email,
    portable || ' ',
    homeDepartement,
    hasSignup ? 'OUI' : 'NON',
    subject,
    message,
  )
  const content = getHtmlBody(body)

  const mail = {
    subject,
    content,
  }

  return sendMail(emailDep, mail)
}

export const sendMailContactUsForCandidat = candidat => {
  const { email, homeDepartement, departement } = candidat

  const body = getContactUsForCandidat(
    departement === homeDepartement ? '' : departement,
  )

  const content = getHtmlBody(body)

  const mail = {
    subject: 'Prise en compte de votre demande',
    content,
  }

  return sendMail(email, mail)
}
