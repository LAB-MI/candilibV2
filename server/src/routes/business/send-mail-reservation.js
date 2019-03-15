import { logger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'
import { getCancelBookingTemplate, getHtmlBody } from './mail'
import { sendMail } from './send-mail'

export const sendMailConvocation = async reservation => {
  logger.debug(
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
  logger.debug(JSON.stringify({ func: sendMailConvocation, message }))
  return sendMail(email, message)
}

export const sendCancelBooking = async candidat => {
  logger.debug(JSON.stringify({ func: sendMailConvocation, arg: { candidat } }))

  if (!candidat) {
    throw new Error('Les données du candidat sont vide')
  }

  const { email, codeNeph, nomNaissance } = candidat

  if (!email) {
    throw new Error("Le candidat n'a pas de courriel")
  }

  if (!codeNeph || !nomNaissance) {
    throw new Error('Les informations du candidat sont manquantes')
  }

  const contentMsg = getCancelBookingTemplate(nomNaissance, codeNeph)

  const message = {
    content: getHtmlBody(contentMsg),
    subject: "Annulation de Convocation à l'examen",
  }

  return sendMail(email, message)
}
