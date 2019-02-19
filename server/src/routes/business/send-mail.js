import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import { htmlToText } from 'nodemailer-html-to-text'

import getMailData from './message-templates'
import config, { smtpOptions } from '../../config'
import { appLogger, techLogger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'

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
    appLogger.info('Mail sent: ' + info.response)
  } catch (error) {
    techLogger.error(error)
    throw error
  } finally {
    transporter.close()
  }
}

export const sendMailToAccount = async (candidat, flag) => {
  const message = await getMailData(candidat, flag)
  return sendMail(candidat.email, message)
}

export const sendMailConvocation = async reservation => {
  appLogger.debug(
    JSON.stringify({ func: sendMailConvocation, arg: { reservation } })
  )

  if (!reservation) {
    throw new Error('Il y a aucune réservation')
  }
  if (!reservation.bookedBy) {
    throw new Error('Il y a aucune candidat pour cette réservation')
  }

  const { email } = reservation.bookedBy
  if (!email) {
    throw new Error("Le candidat n'a pas de courriel")
  }
  const message = getConvocationBody(reservation)
  appLogger.debug(JSON.stringify(message))
  return sendMail(email, message)
}

export const sendMagicLink = async (candidat, token) => {
  const flag = 'CHECK_OK'
  const authUrl = `${config.PUBLIC_URL}${config.CANDIDAT_ROUTE}`

  const url = `${authUrl}?token=${encodeURIComponent(token)}&redirect=calendar`

  const message = await getMailData(candidat, flag, url)
  return sendMail(candidat.email, message)
}
