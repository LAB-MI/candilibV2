import {
  getFrenchFormattedDateTime,
  getFrenchLuxon,
  getFrenchLuxonFromJSDate,
} from '../../../util/date-util'
import { Interval } from 'luxon'

import config from '../../../config'

export const getInscriptionOkTemplate = (
  nomMaj,
  urlMagicLink,
  urlConnexion,
  email,
  contactezNous,
  accessDate
) => {
  const header = `
    <p>Madame, Monsieur ${nomMaj},</p>
    <br>
    <p>Bienvenue sur Candilib !</p>
    <br>
    <p>
      Vous êtes inscrit sur
      le site de réservation de l'examen pratique du permis de conduire.
    </p>
    <br/>
  `

  const footer = `
    ${contactezNous}
    <br/>
    <br/>
    <p align="right">L'équipe Candilib</p>
  `

  const contentForAllowedCandidat = `
    <p>
      <a href="${urlMagicLink}">
        Se connecter
      </a>
    </p>
    <br/>
    <p>
        Ce lien est valable 3 jours à compter de la réception de cet email.
    </p>
    <p>
      Passé ce délai, allez sur <a href="${urlConnexion}">Candilib</a>, saisissez votre adresse courriel ${email} dans "déjà inscrit" et vous recevrez un nouveau lien par email.
    </p>
    <p>
      Lorsque vous recevrez l’email, cliquez sur "Se connecter".
    </p>
    <br/>
    <p>
    <strong>Attention : </strong>vous ne devez transmettre cet email à personne. Il permet d'accéder à votre compte personnel, de créer ou modifier votre réservation.
    </p>
  `

  if (urlMagicLink) {
    return `
    ${header}
    ${contentForAllowedCandidat}
    ${footer}
    `
  }

  const dateNow = getFrenchLuxon().startOf('day')
  const remainingDays =
    Interval.fromDateTimes(
      dateNow,
      getFrenchLuxonFromJSDate(accessDate).startOf('day')
    ).count('days') - 1

  const contentForQueuedCandidat = `
    <p>
      Cependant vous devez attendre ${
        config.LINE_DELAY
      } jours à partir de votre validation, avant d'accéder au planning de réservation.
      Cette mise en file d'attente vous permet de planifier votre préparation en vue de réussir votre examen pratique du permis de conduire.
    </p>
    <p>
      À ce jour, il vous reste donc <strong style="font-size: 1.2em;">${remainingDays} jours</strong> avant de pouvoir vous connecter.
    </p>
    <p>
    Vous pourrez accéder au planning de réservation le
    <strong style="font-size: 1.2em;">
    ${getFrenchFormattedDateTime(accessDate).date}
    </strong>.
    </p>
  `
  return `
    ${header}
    ${contentForQueuedCandidat}
    ${footer}
  `
}
