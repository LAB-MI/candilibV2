export const getValidationMailTemplate = (
  nomMaj,
  urlValidationEmail,
  urlConnexion
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>Vous avez demandé à être inscrit·e sur le site de réservation de l'examen pratique du permis de conduire.</p>
  <br/>
  <p>
    <a href="${urlValidationEmail}">
      Valider mon adresse email
    </a>
  </p>
  <br/>
  <p>
      Ce lien est valable 2 heures à compter de la réception de cet email.
  </p>
  <p>
    Passé ce délai, vous devrez de nouveau faire une demande de pré-inscription sur <a href="${urlConnexion}">Candilib</a>.
  </p>
  <br/>

  <p align="right">L'équipe Candilib</p>`
