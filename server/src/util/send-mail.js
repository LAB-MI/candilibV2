import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import { htmlToText } from 'nodemailer-html-to-text'

import mailMessage from './message-templates'
import config, { smtpOptions } from '../config'
import logger from '../logger'

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
    logger.info('Mail sent: ' + info.response)
  } catch (error) {
    logger.error(error)
    throw error
  } finally {
    transporter.close()
  }
}

export const sendMailToAccount = async (candidat, flag) => {
  const message = mailMessage(candidat, flag)
  sendMail(candidat.email, message)
}

export const sendMagicLink = async (candidat, token) => {
  const flag = 'CHECK_OK'
  const url = `${config.PUBLIC_URL}${
    config.authentificationRoute
  }?token=${encodeURIComponent(token)}&redirect=calendar`

  const message = mailMessage(candidat, flag, url)
  sendMail(candidat.email, message)
}
