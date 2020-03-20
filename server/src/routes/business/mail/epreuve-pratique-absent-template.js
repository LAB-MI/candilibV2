export const getAbsentAtExamTemplate = (
  nameCandidat,
  timeoutToRetry,
  urlRESA,
  urlFAQ,
  contactezNous
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
Vous avez été absent à l'examen, et nous avons perdu une place qui aurait pu bénéficier à un autre candidat. 
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
