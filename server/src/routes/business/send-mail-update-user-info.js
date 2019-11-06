/**
 * Ensemble des fonctions pour envoyer les mails aux répartiteurs
 *
 * @module business/send-mail-update-user-info
 */

import { sendMail } from './send-mail'
import { getHtmlBody } from './mail'

/**
 * Envoi d'un courriel de confirmation de modification des informations de l'utilisateur
 * @function
 *
 * @param {string} email Adresse courriel de l'utilisateur
 */

export const sendMailConfirmationUpdateUserInfo = email => {
  const mail = getMailConfirmation()
  return sendMail(email, mail)
}

/**
 * Retourne le contenu du corps du mail
 * @function
 *
 * @param {string} email Adresse courriel de l'utilisateur
 *
 * @returns {string} Contenu HTML de la partie informative du contenu du mail de confirmation de mise à jour des informations de l'utilisateur
 */
export const getMailConfirmationTemplate = email => `
  <p> les informations de l'utilisateur ${email} on bien été modifié.
  </p>
  <br>
  <p align="right">L'équipe Candilib</p>
`

/**
 * Retourne le contenu HTML mail
 * @function
 *
 * @param {string} email Adresse courriel de l'utilisateur
 *
 * @returns Contenu HTML de tout le contenu du mail de confirmation de mise à jour des informations de l'utilisateur
 */
export const getMailConfirmationBody = email => {
  const body = getMailConfirmationTemplate(email)
  return getHtmlBody(body)
}

/**
 * Retourne le sujet et le contenu du mail
 * @function
 *
 * @param {string} email Adresse courriel de l'utilisateur
 *
 * @returns {MailData} Titre et corps du mail à envoyer pour la confirmation de mise à jour des informations de l'utilisateur
 */
export const getMailConfirmation = email => {
  const subject = 'Vos informations sur candilib ont changé'
  const content = getMailConfirmationBody(email)
  return { subject, content }
}

/**
 *
 * @typedef {Object} MailData
 * @property {string} subject - Titre de l'email
 * @property {string} content - Corps de l'email
 */
