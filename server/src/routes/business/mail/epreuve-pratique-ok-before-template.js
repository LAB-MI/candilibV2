export const getEpreuvePratiqueOKBeforeTemplate = (
  nomMaj,
  urlFAQ,
  contactezNous
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>Selon nos informations vous avez déjà réussi votre examen du permis de conduire, notre service ne vous est plus utile.</p>
  <br>
  <p><b>Attention :</b></p>
  <p>
    Si vous recevez ce message et que vous êtes en situation de retour au permis de conduire après une annulation,
    vous ne pouvez pas rejoindre le site de réservation des candidats libres sans examen du code de la route réussi
    et en cours de validité.
  </p>
  <p>Vous pourrez trouver des informations utiles en consultant notre <a href=${urlFAQ}>aide en ligne</a>.<p>
  <br>
  ${contactezNous}
  <br>
  <p align="right">L'équipe Candilib</p>`
