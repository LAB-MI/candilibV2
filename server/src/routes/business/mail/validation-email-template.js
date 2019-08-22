export const getValidationMailTemplate = (
  nomMaj,
  urlValidationEmail,
  urlConnexion
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>Vous avez demandé à être inscrit·e sur le site de réservation de l'examen pratique du permis de conduire.</p>
  <br/>
  <p>
  <p>
    Pour poursuivre votre inscription, vous devez valider votre adresse mail en cliquant sur lien ci-après :
  </p>
  <p>
    <a href="${urlValidationEmail}">
      Valider mon adresse email
    </a>
  </p>
  <br/>
  <p>
      <b><u>Ce lien est valable 2 heures à compter de la réception de cet email.</u></b>
  </p>
  <p>
    Passé ce délai, vous devrez de nouveau faire une demande de pré-inscription sur <a href="${urlConnexion}">Candilib</a>.
  </p>
  <br/>

  <p align="right">L'équipe Candilib</p>`
