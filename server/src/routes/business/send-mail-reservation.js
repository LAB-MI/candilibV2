import { appLogger } from '../../util'
import { getConvocationBody } from './build-mail-convocation'
import { getCancelBookingTemplate, getHtmlBody } from './mail'
import { sendMail } from './send-mail'

export const sendMailConvocation = async reservation => {
  appLogger.debug({ func: sendMailConvocation, arg: { reservation } })

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
  const message = getConvocationBody(reservation)
  appLogger.debug({ func: sendMailConvocation, message })
  return sendMail(email, message)
}

export const sendCancelBooking = async candidat => {
  appLogger.debug({ func: sendMailConvocation, arg: { candidat } })

  if (!candidat) {
    throw new Error("Le candidat n'a pas de données")
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
  appLogger.debug({ func: sendCancelBooking, message })

  return sendMail(email, message)
}
