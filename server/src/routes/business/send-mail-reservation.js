import { appLogger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'
import { sendMail } from './send-mail'
import { getCancellationBody } from './build-mail-cancellation'
import { getFailureExamBody } from './build-mail-failure-exam'

const section = 'candidat-sendMail'

const sendMailResaArgsValidation = (reservation, candidat) => {
  if (!reservation) {
    appLogger.debug({ func: 'sendMailResaArgsValidation', reservation })
    throw new Error("Il n'y a aucune réservation")
  }
  if (!candidat) {
    appLogger.debug({
      func: 'sendMailResaArgsValidation',
      candidat: candidat,
    })
    throw new Error("Il n'y a aucun candidat pour cette réservation")
  }

  const { email } = candidat
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
    sendMailResaArgsValidation(
      reservation,
      reservation ? reservation.candidat : undefined
    )
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

  appLogger.debug({ func: 'sendMailCancellation', candidat, place, email })
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = getCancellationBody(place, candidat)
  const subject = "Annulation de votre convocation à l'examen"

  appLogger.debug({ func: 'sendMailCancellation', content, subject })

  return sendMail(email, { content, subject })
}

export const sendFailureExam = async (place, candidat) => {
  appLogger.debug({
    func: 'sendFailureExam',
    args: { candidat, place },
  })
  const action = 'SEND_REMOVE_BOOKING_BY_AURIGE'
  const { email } = candidat

  appLogger.debug({ func: 'sendFailureExam', place, candidat, email })
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = await getFailureExamBody(place, candidat)
  const subject =
    "Annulation de votre convocation suite à l'echec de votre examen pratique"

  appLogger.debug({ func: 'sendFailureExam', content, subject })

  return sendMail(email, { content, subject })
}
