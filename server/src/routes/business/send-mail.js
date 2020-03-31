/**
 * Module pour envoi de mails
 * @module
 */
import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import { htmlToText } from 'nodemailer-html-to-text'

import getMailData from './message-templates'
import config, { smtpOptions } from '../../config'
import {
  appLogger,
  createToken,
  getFrenchLuxonFromJSDate,
  techLogger,
  getFrenchLuxon,
  AURIGE_OK,
} from '../../util'

const messages = []

/**
 * Callback pour indiqué la fin de l'envoi des lots de mails
 * @callback callbackEndSend
 * @param {Object} response - Object avec une error ou vide
 */
/**
 * Envoyer un lot de mails présent la queue
 * Pour l'utiliser, il faut faire appel à {@link import("./send-mail")..addMailToSend|addMailToSend} avant
 * @function
 * @param {callbackEndSend} callbackEndSend
 */
export const sendMails = async callbackEndSend => {
  try {
    const transporterPooled = await transporterBuilder(callbackEndSend)
    if (transporterPooled.isIdle() && messages.length) {
      await sendOneMailFromQueue(transporterPooled)
    }
  } catch (error) {
    callbackEndSend && callbackEndSend({ error })
  }
}
/**
 * Ajouter dans la queue les courriels à envoyer
 * Pour envoyer, utiliser la fonction {@link import("./send-mail")..sendMails|sendMails}
 * @function
 * @param {String} to - destinataire du courriel
 * @param {Object} param1
 * @param {String} param1.subject - sujet du courriel
 * @param {String} param1.content - contenu de courriel
 */
export const addMailToSend = (to, { subject, content: html }) => {
  const mailOptions = {
    from: config.mailFrom,
    to,
    subject,
    html,
  }

  messages.push({ mailOptions, countError: 0 })
}

async function sendOneMailFromQueue (transporter) {
  const { mailOptions, countError } = messages.shift()
  const { to, subject } = mailOptions
  try {
    const info = await transporter.sendMail(mailOptions)
    appLogger.info({
      section: 'send-mails',
      to,
      subject,
      description: 'Mail sent: ' + info.response,
      info,
    })
  } catch (error) {
    const nbError = countError + 1
    if (countError < config.smtpMaxAttemptsToSend) {
      messages.push({ mailOptions, countError: nbError })
    }
    techLogger.error({
      section: 'send-mails',
      to,
      subject,
      countError,
      description: error.message + `( ${nbError} echecs)`,
      error,
    })
  }
}

async function transporterBuilder (callbackEndSend) {
  const transporterPooled = nodemailer.createTransport({
    pool: true,
    ...smtpOptions,
    maxConnections: config.smtpMaxConnections,
    rateDelta: config.smtpRateDelta,
    rateLimit: config.smtpRateLimit,
  })

  try {
    await transporterPooled.verify()
    techLogger.info({
      section: 'send-mails',
      action: 'CONNECTION SMTP',
      description: 'Connexion SMTP ouvert',
    })

    transporterPooled.use('compile', htmlToText())

    transporterPooled.on('idle', async function () {
      while (transporterPooled.isIdle() && messages.length) {
        await sendOneMailFromQueue(transporterPooled)
      }
      if (!messages.length) {
        callbackEndSend && callbackEndSend()
        transporterPooled.close()
      }
    })
  } catch (error) {
    techLogger.error({
      section: 'send-mails',
      description: error.message,
      error,
    })
    transporterPooled.close()
    throw error
  }

  return transporterPooled
}

export const sendMail = async (to, { subject, content: html }) => {
  const transporter = nodemailer.createTransport(smtpTransport(smtpOptions))
  transporter.use('compile', htmlToText())

  const mailOptions = {
    from: config.mailFrom,
    to,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    appLogger.info({
      section: 'send-mail',
      to,
      subject,
      description: 'Mail sent: ' + info.response,
      info,
    })
  } catch (error) {
    techLogger.error({
      section: 'send-mail',
      to,
      subject,
      description: error.message,
      error,
    })
    throw error
  } finally {
    transporter.close()
  }
}

export const sendMailToAccount = async (candidat, flag, addInQueue) => {
  const message = await getMailData(candidat, flag)
  if (addInQueue) {
    return addMailToSend(candidat.email, message)
  } else {
    return sendMail(candidat.email, message)
  }
}

export const sendMagicLink = async (candidat, addInQueue) => {
  const flag = AURIGE_OK

  const url = getUrl(candidat)

  const message = await getMailData(candidat, flag, url)
  if (addInQueue) {
    return addMailToSend(candidat.email, message)
  } else {
    return sendMail(candidat.email, message)
  }
}

export const getUrl = candidat => {
  const candidatAccessDate = getFrenchLuxonFromJSDate(candidat.canAccessAt)
  const dateNow = getFrenchLuxon().startOf('day')

  if (!candidat.canAccessAt || dateNow >= candidatAccessDate) {
    const token = createToken(candidat.id, config.userStatuses.CANDIDAT)
    const authUrl = `${config.PUBLIC_URL}${config.CANDIDAT_ROUTE}`
    return `${authUrl}?token=${encodeURIComponent(token)}`
  }

  return null
}
