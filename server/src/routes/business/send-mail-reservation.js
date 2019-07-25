import { appLogger } from '../../util'
import { getCancellationBody } from './build-mail-cancellation'
import { getCancellationByAdminBody } from './build-mail-cancellation-by-admin'
import { getConvocationBody } from './build-mail-convocation'
import { getFailureExamBody } from './build-mail-failure-exam'
import { sendMail } from './send-mail'
import {
  SUBJECT_CANCEL_BY_FAILURE,
  SUBJECT_CANCEL_RESA,
  SUBJECT_CONVOCATION,
  SUBJECT_CANCEL_BY_ADMIN,
} from './send-message-constants'

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
  const subject = SUBJECT_CONVOCATION

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
  const subject = SUBJECT_CANCEL_RESA

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
  const subject = SUBJECT_CANCEL_BY_FAILURE

  appLogger.debug({ func: 'sendFailureExam', content, subject })

  return sendMail(email, { content, subject })
}

export const sendCancelBookingByAdmin = async (place, candidat) => {
  appLogger.debug({
    func: 'sendCancelBookingByAdmin',
    args: { candidat, place },
  })
  const action = 'SEND_CANCELLATION_BY_ADMIN'
  const { email } = candidat

  appLogger.debug({ func: 'sendCancelBookingByAdmin', candidat, place, email })
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = await getCancellationByAdminBody(place, candidat)
  const subject = SUBJECT_CANCEL_BY_ADMIN

  appLogger.debug({ func: 'sendCancelBookingByAdmin', content, subject })

  return sendMail(email, { content, subject })
}
