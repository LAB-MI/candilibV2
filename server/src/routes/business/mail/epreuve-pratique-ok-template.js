export const getEpreuvePratiqueOKTemplate = (
  nomMaj,
  urlFAQ,
  contactezNous
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>Selon nos informations, vous avez réussi l'examen que vous venez de passer.</p>
  <p>Votre certificat d'examen sera disponible sous 48 heures (hors week-end et jours fériés) <a href:'https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire#/step-connexion'> ici</a>.
  </p>
  <br>
  <p><b>Attention :</b></p>
  <p>
    Seul le certificat téléchargé sur ce site établira officiellement votre réussite et vous autorisera la conduite.
    <br>Ce mail est purement informatif et n'engage en rien l'administration sur votre résultat définitif.
  </p>
  <p>Vous pourrez trouver des informations utiles en consultant notre <a href=${urlFAQ}>aide en ligne</a>.<p>
  <br>
  ${contactezNous}
  <br>
  <p align="right">L'équipe Candilib</p>`
