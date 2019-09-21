/**
 * Ensemble des fonctions pour envoyer les mails aux répartiteurs
 *
 * @module business/send-mail-confirmation-new-password
 */

import { sendMail } from './send-mail'
import { getHtmlBody } from './mail'

/**
 * Envoi un email de confirmation de réinitialisation du mot de passe
 * @function
 *
 * @param {string} email Adresse courriel de l'utilisateur
 */

export const sendMailConfirmationPassword = email => {
  const mail = getMailConfirmation()
  return sendMail(email, mail)
}

/**
 * Retourne le contenu du corps du mail
 * @function
 *
 * @param {string} email Adresse email du candidat
 *
 * @returns {string} Contenu HTML de la partie informative du contenu du mail de confirmation du mot de passe
 */
export const getMailConfirmationTemplate = email => `
  <p>Votre mot de passe a bien été
  réinitialisé.
  </p>
  <br>
  <p align="right">L'équipe Candilib</p>
`

/**
 * Retourne le contenu HTML mail
 * @function
 *
 * @param {string} email Adresse email de l'utilisateur
 *
 * @returns Contenu HTML de tout le contenu du mail de confirmation de réinitialisation du mot de passe
 */
export const getMailConfirmationBody = email => {
  const body = getMailConfirmationTemplate(email)
  return getHtmlBody(body)
}

/**
 * Retourne le sujet et le contenu du mail
 * @function
 *
 * @param {string} email Adresse email du candidat
 *
 * @returns {MailData} Titre et corps du mail à envoyer pour la confirmation de réinitialisation du mot de passe
 */
export const getMailConfirmation = email => {
  const subject = 'Votre mot de passe a été réinitialisé'
  const content = getMailConfirmationBody(email)
  return { subject, content }
}

/**
 *
 * @typedef {Object} MailData
 * @property {string} subject - Titre de l'email
 * @property {string} content - Corps de l'email
 */
