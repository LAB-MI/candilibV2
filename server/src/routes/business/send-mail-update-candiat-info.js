import { sendMail } from './send-mail'
import { getUrlContactUs } from './send-mail-util'
import { getHtmlBody } from './mail'
import { SUBJECT_UPDATE_CANDDIAT_MAIL } from './send-message-constants'

const getUpdateCandidatEmailToConnect = (
  nomMaj,
  urlContactus,
) =>
  `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>
  Nous vous informons que votre adresse courriel a été modifiée. 
  <br>
  Si vous n'avez fait aucune demande de modification, veuillez <a href="${urlContactus}">nous contacter</a>.
  <br>
  <p align="right">L'équipe Candilib</p>`

export const sendMailUpdateCandidatEmail = (candidat, oldEmail) => {
  const { nomNaissance, email } = candidat
  const urlContactUs = getUrlContactUs()
  const body = getUpdateCandidatEmailToConnect(nomNaissance, urlContactUs)

  const content = getHtmlBody(body)
  const subject = SUBJECT_UPDATE_CANDDIAT_MAIL

  return sendMail(oldEmail || email, { content, subject })
}
