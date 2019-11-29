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
} from '../../util'

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

export const sendMailToAccount = async (candidat, flag) => {
  const message = await getMailData(candidat, flag)
  return sendMail(candidat.email, message)
}

export const sendMagicLink = async candidat => {
  const flag = 'CHECK_OK'

  const url = getUrl(candidat)

  const message = await getMailData(candidat, flag, url)
  return sendMail(candidat.email, message)
}

function getUrl (candidat) {
  const candidatAccessDate = getFrenchLuxonFromJSDate(candidat.canAccessAt)
  const dateNow = getFrenchLuxon()

  if (!candidatAccessDate || dateNow > candidatAccessDate) {
    const token = createToken(candidat.id, config.userStatuses.CANDIDAT)
    const authUrl = `${config.PUBLIC_URL}${config.CANDIDAT_ROUTE}`
    return `${authUrl}?token=${encodeURIComponent(token)}`
  }

  return null
}
