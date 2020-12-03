import { appLogger } from '../../util'
import { getCancellationBody } from './build-mail-cancellation'
import { getCancellationByAdminBody } from './build-mail-cancellation-by-admin'
import { getConvocationBody } from './build-mail-convocation'
import { getFailureExamBody } from './build-mail-failure-exam'
import { sendMail, addMailToSend } from './send-mail'
import {
  SUBJECT_CANCEL_BY_FAILURE,
  SUBJECT_CANCEL_RESA,
  SUBJECT_CONVOCATION,
  SUBJECT_CANCEL_BY_ADMIN,
  SUBJECT_MAIL_INFO,
} from './send-message-constants'
import { ObjectLastNoReussitValues } from '../../models/candidat/objetDernierNonReussite.values'
import { getFailedAtExamTemplate } from './mail/epreuve-pratique-failed-template'
import { getAbsentAtExamTemplate } from './mail/epreuve-pratique-absent-template'
import { getNoExamineAtExamTemplate } from './mail/epreuve-pratique-non-examine-template'
import { getNoSuccessAtExamBody } from './build-mail-no-success-exam'

const section = 'candidat-sendMail'

const sendMailResaArgsValidation = (reservation, candidat) => {
  if (!reservation) {
    // appLogger.debug({ func: 'sendMailResaArgsValidation', reservation })
    throw new Error("Il n'y a aucune réservation")
  }

  if (!candidat) {
    // appLogger.debug({
    //   func: 'sendMailResaArgsValidation',
    //   candidat: candidat,
    // })
    throw new Error("Il n'y a aucun candidat pour cette réservation")
  }

  const { email } = candidat
  if (!email) {
    // appLogger.debug({ func: 'sendMailResaArgsValidation', email })
    throw new Error("Le candidat n'a pas de courriel")
  }
  return email
}

export const sendMailConvocation = async reservation => {
  const action = 'SEND_CONVOVATION'
  // appLogger.debug({ func: 'sendMailConvocation', arg: { reservation } })

  try {
    sendMailResaArgsValidation(
      reservation,
      reservation ? reservation.candidat : undefined,
    )
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const { email } = reservation.candidat
  const content = await getConvocationBody(reservation)
  const subject = SUBJECT_CONVOCATION

  // appLogger.debug({ func: 'sendMailConvocation', content, subject })

  return sendMail(email, { content, subject })
}

export const sendCancelBooking = async (candidat, place) => {
  // appLogger.debug({ func: 'sendMailCancellation', args: { candidat, place } })
  const action = 'SEND_CANCELLATION'
  const { email } = candidat

  // appLogger.debug({ func: 'sendMailCancellation', candidat, place, email })
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = await getCancellationBody(place, candidat)
  const subject = SUBJECT_CANCEL_RESA

  // appLogger.debug({ func: 'sendMailCancellation', content, subject })

  return sendMail(email, { content, subject })
}

export const sendFailureExam = async (
  place,
  candidat,
  lastNoReussite,
  addInQueue,
) => {
  let action = 'SEND_BY_AURIGE_TO_NO_SUCCESS'
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }
  // appLogger.debug(section, action, place, candidat)
  const { email } = candidat
  let content
  let subject = SUBJECT_MAIL_INFO
  switch (lastNoReussite.reason) {
    case ObjectLastNoReussitValues.ECHEC: {
      action = 'SEND_BY_AURIGE_TO_FAIL'
      content = await getNoSuccessAtExamBody(candidat, getFailedAtExamTemplate)
      break
    }
    case ObjectLastNoReussitValues.ABSENT: {
      action = 'SEND_BY_AURIGE_TO_ABSENT'
      content = await getNoSuccessAtExamBody(candidat, getAbsentAtExamTemplate)
      break
    }
    case ObjectLastNoReussitValues.CANCELED:
    case ObjectLastNoReussitValues.NO_ADMISSIBLE:
    case ObjectLastNoReussitValues.NO_EXAMINABLE: {
      action = 'SEND_BY_AURIGE_TO_NO_EXAMINE'
      content = await getNoSuccessAtExamBody(
        candidat,
        getNoExamineAtExamTemplate,
      )
      break
    }
    default: {
      action = 'SEND_REMOVE_BOOKING_BY_AURIGE'
      content = await getFailureExamBody(place, candidat)
      subject = SUBJECT_CANCEL_BY_FAILURE
    }
  }
  appLogger.info({ section, action, email })
  if (addInQueue) {
    return addMailToSend(email, { content, subject })
  } else {
    return sendMail(email, { content, subject })
  }
}

export const sendCancelBookingByAdmin = async (place, candidat) => {
  // appLogger.debug({
  //   func: 'sendCancelBookingByAdmin',
  //   args: { candidat, place },
  // })
  const action = 'SEND_CANCELLATION_BY_ADMIN'
  const { email } = candidat

  // appLogger.debug({ func: 'sendCancelBookingByAdmin', candidat, place, email })
  try {
    sendMailResaArgsValidation(place, candidat)
  } catch (error) {
    appLogger.error({ section, action, error })
    throw error
  }

  const content = await getCancellationByAdminBody(place, candidat)
  const subject = SUBJECT_CANCEL_BY_ADMIN

  // appLogger.debug({ func: 'sendCancelBookingByAdmin', content, subject })

  return sendMail(email, { content, subject })
}
