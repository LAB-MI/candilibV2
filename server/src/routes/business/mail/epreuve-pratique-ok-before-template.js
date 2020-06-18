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
  Si vous recevez ce message et que vous êtes en situation de retour au
  permis de conduire après une annulation de votre permis, vous ne pouvez pas vous
  pré-inscrire sur le site Candilib.
  <br> Nous vous invitons à prendre contact
  avec le service Candilib en indiquant votre situation.
  </p>
  ${contactezNous}
  <br>
  <p>Vous pourrez trouver des informations utiles en consultant notre <a href=${urlFAQ}>aide en ligne</a>.<p>
  <br>
  <p align="right">L'équipe Candilib</p>`
