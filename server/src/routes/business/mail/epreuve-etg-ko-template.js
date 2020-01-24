export const getEpreuveEtgKoTemplate = (
  nomMaj,
  urlFAQ,
  contactezNous
) => `<p>Madame, Monsieur ${nomMaj},</p>
<br>
<p>Votre code de la route n’est pas/plus valide.</p>
</p>Vous ne pouvez pas rejoindre le site de réservation des candidats libres sans examen du code de la route réussi et en cours de validité.</p>
<p>Vous pourrez trouver des informations utiles en consultant <a href=${urlFAQ}>notre aide en ligne</a>.<p>
<br>
${contactezNous}
<br>
<p align="right">L'équipe Candilib</p>`
