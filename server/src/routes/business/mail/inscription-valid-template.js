export const getInscripionValidTemplate = (
  nomMaj,
  contactezNous,
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <p>
    Votre adresse courriel a été validée et votre demande d’inscription est en cours de vérification.
    Vous recevrez une information sous 48h hors week-end et jours fériés.
  </p>
  <br>
  ${contactezNous}
  <br>
  <p align="right">L'équipe Candilib</p>`
