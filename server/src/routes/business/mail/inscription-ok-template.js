import { getFrenchFormattedDateTime } from '../../../util/date-util'

export const getInscriptionOkTemplate = (
  nomMaj,
  urlMagicLink,
  urlConnexion,
  email,
  contactezNous,
  canAccessAt
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
      Vous êtes inscrit sur
      le site de réservation de l'examen pratique du permis de conduire.
    </p>
    <br/>
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
      Passé ce délai, allez sur <a href="${urlConnexion}">Candilib</a>, saisissez votre adresse courriel ${email} dans  "déjà inscrit" et vous recevrez un nouveau lien par email.
    </p>
    <p>
      Lorsque vous recevrez l’email, cliquez sur "Se connecter".
    </p>
    <br/>
    <p>
    <strong>Attention : </strong>vous ne devez transmettre cet email à personne. Il permet d'accéder à votre compte personnel, de créer ou modifier votre réservation.
    </p>
  `

  const dateCanAccess = getFrenchFormattedDateTime(canAccessAt).date
  const contentForQueuedCandidat = `
    <p>
      par-contre connexion possible a partir du ${dateCanAccess}
    </p>
  `

  const mainContent = urlMagicLink
    ? contentForAllowedCandidat
    : contentForQueuedCandidat

  return `
    ${header}
    ${mainContent}
    ${footer}
  `
}
