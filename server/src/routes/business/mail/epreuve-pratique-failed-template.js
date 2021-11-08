export const getFailedAtExamTemplate = (
  nameCandidat,
  timeoutToRetry,
  urlRESA,
  urlFAQ,
  contactezNous,
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
    Vous venez de passer l'examen du permis de conduire.
<br>Votre résultat est disponible entre 2 et 4 jours ouvrables après le passage de l'examen (week-end et jours fériés non inclus) <a href="https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire#/step-connexion">ici</a>.
</p>
<p>
En-cas de réussite, félicitations!
<br>En cas d'échec, vous conserverez votre accès à Candilib, mais il vous sera appliqué une pénalité de ${timeoutToRetry} jours de délais avant de pouvoir effectuer <a href=${urlRESA}>une nouvelle réservation</a>.
</p>
<p>
Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
<br>
${contactezNous}
<br>
</p>
<p align="right">L'équipe Candilib</p>`
