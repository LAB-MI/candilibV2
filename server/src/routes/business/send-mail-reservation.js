import { appLogger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'
import { sendMail } from './send-mail'
import { getCancellationBody } from './build-mail-cancellation'

const section = 'candidat-sendMail'

const sendMailResaArgsValidation = reservation => {
  if (!reservation) {
    appLogger.debug({ func: 'sendMailResaArgsValidation', reservation })
    throw new Error("Il n'y a aucune réservation")
  }
  if (!reservation.candidat) {
    appLogger.debug({
      func: 'sendMailResaArgsValidation',
      candidat: reservation.candidat,
    })
    throw new Error("Il n'y a aucun candidat pour cette réservation")
  }

  const { email } = reservation.candidat
  if (!email) {
    appLogger.debug({ func: 'sendMailResaArgsValidation', email })
    throw new Error("Le candidat n'a pas de courriel")
  }
  return email
}

export const sendMailConvocation = reservation => {
  const action = 'SEND_CONVOVATION'
  appLogger.debug({ func: 'sendMailConvocation', arg: { reservation } })

  try {
    sendMailResaArgsValidation(reservation)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const { email } = reservation.candidat
  const content = getConvocationBody(reservation)
  const subject = "Convocation à l'examen pratique du permis de conduire"

  appLogger.debug({ func: 'sendMailConvocation', content, subject })

  return sendMail(email, { content, subject })
}

export const sendCancelBooking = (candidat, place) => {
  appLogger.debug({ func: 'sendMailCancellation', args: { candidat, place } })
  const action = 'SEND_CANCELLATION'
  const { email } = candidat
  const reservation = place
  reservation.candidat = candidat

  appLogger.debug({ func: 'sendMailCancellation', reservation, email })
  try {
    sendMailResaArgsValidation(reservation)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = getCancellationBody(reservation)
  const subject = "Annulation de votre convocation à l'examen"

  appLogger.debug({ func: 'sendMailCancellation', content, subject })

  return sendMail(email, { content, subject })
}
