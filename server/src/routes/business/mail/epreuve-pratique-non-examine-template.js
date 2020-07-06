export const getNoExamineAtExamTemplate = (
  nameCandidat,
  timeoutToRetry,
  urlRESA,
  urlFAQ,
  contactezNous,
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
Vous n'avez pas été examiné car vous ne remplissiez pas toutes les conditions réglementaires obligatoires pour tout candidat.
<br>
Nous avons perdu une place qui aurait pu bénéficier à un autre candidat. 
</p>
<p>
Vous conserverez votre accès à Candilib, mais il vous sera appliqué une pénalité de ${timeoutToRetry} jours de délais avant de pouvoir effectuer <a href=${urlRESA}>une nouvelle réservation</a>.
</p>
<p>
Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
<br>
${contactezNous}
<br>
</p>
<p align="right">L'équipe Candilib</p>`
