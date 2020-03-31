/**
 * Ensemble des fonctions pour envoyer les mails aux répartiteurs
 *
 * @module business/send-mail-create-account
 */

import { sendMail } from './send-mail'
import { getHtmlBody } from './mail'
import { getUrlResetLink } from './send-mail-util'

/**
 * Envoi un email contenant le lien de réinitialisation
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 */
export const sendMailCreateAccount = async email => {
  const urlResetLink = await getUrlResetLink(email)
  const mail = await getResetLinkMail(urlResetLink)
  return sendMail(email, mail)
}

/**
 * Génère le contenu du mail
 * @function
 *
 * @param {string} urlResetLink - Lien à envoyer dans le mail avec l'adresse courriel et le hash de réinitialisation
 *
 * @returns {string} - Contenu HTML de la partie informative du contenu du mail de création de compte et de réinitialisation du mot de passe
 */
export const getResetLinkTemplate = urlResetLink => `
  <p>
    Votre compte sur Candilib vient d'être créé. 
    Vous pouvez dès à présent modifier votre mot de passe en cliquant sur le lien suivant :
    <a href='${urlResetLink}'>modifier mon mot de passe</a>
  </p>
  <br>
  <p align="right">L'équipe Candilib</p>
`

/**
 * Retourne le contenu du mail
 * @function
 *
 * @param {string} urlResetLink - Lien à envoyer dans le mail avec l'adresse courriel et le hash de réinitialisation
 *
 * @returns {string} - Contenu HTML de tout le contenu du mail de réinitialisation du mot de passe
 */
export const getResetLinkMailBody = urlResetLink => {
  const content = getResetLinkTemplate(urlResetLink)
  return getHtmlBody(content)
}

/**
 * Retourne le sujet et le contenu du mail
 * @function
 *
 * @param {string} urlResetLink - Lien à envoyer dans le mail avec l'adresse courriel et le hash de réinitialisation
 *
 * @returns {MailData} - Titre et corps du mail à envoyer pour la réinitialisation du mot de passe
 */
export const getResetLinkMail = urlResetLink => {
  const subject = 'Création de compte Candilib'
  const content = getResetLinkMailBody(urlResetLink)
  return { subject, content }
}

/**
 *
 * @typedef {Object} MailData
 * @property {string} subject - Titre de l'email
 * @property {string} content - Corps de l'email
 */
