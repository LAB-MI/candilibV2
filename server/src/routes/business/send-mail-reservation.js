import { appLogger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'
import { sendMail } from './send-mail'
import { getCancellationBody } from './build-mail-cancellation'

const section = 'candidat-sendMail'

const validateToSendMailResa = reservation => {
  if (!reservation) {
    throw new Error("Il n'y a aucune réservation")
  }
  if (!reservation.candidat) {
    throw new Error("Il n'y a aucune candidat pour cette réservation")
  }

  const { email } = reservation.candidat
  if (!email) {
    throw new Error("Le candidat n'a pas de courriel")
  }
}

export const sendMailConvocation = reservation => {
  appLogger.debug({ func: 'sendMailConvocation', arg: { reservation } })

  try {
    validateToSendMailResa(reservation)
  } catch (error) {
    appLogger.error({ section, error })
    throw error
  }

  const { email } = reservation.bookedBy
  const content = getConvocationBody(reservation)
  const subject = "Convocation à l'examen pratique du permis de conduire"

  appLogger.debug({ func: 'sendMailConvocation', content, subject })

  return sendMail(email, { content, subject })
}

export const sendCancelBooking = (candidat, place) => {
  appLogger.debug({ func: 'sendMailCancellation', arg: { candidat, place } })

  place.bookedBy = candidat
  const reservation = place

  try {
    validateToSendMailResa(reservation)
  } catch (error) {
    appLogger.error({ section, error })
    throw error
  }
  const { email } = candidat
  const content = getCancellationBody(reservation)
  const subject = "Annulation de votre convocation à l'examen"

  appLogger.debug({ func: 'sendMailCancellation', content, subject })

  return sendMail(email, { content, subject })
}
