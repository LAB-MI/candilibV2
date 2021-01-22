export const getAbsentAtExamTemplate = (
  nameCandidat,
  timeoutToRetry,
  urlRESA,
  urlFAQ,
  contactezNous,
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
Vous avez été absent à l'examen, et nous avons perdu une place qui aurait pu bénéficier à un autre candidat en attente. 
</p>
<p>
Vous conserverez votre accès à Candilib, mais il vous est appliqué un délai de présentation de ${timeoutToRetry} jours à partir de la date de l'examen où vous ne vous êtes pas présenté.
</p>
<p>
Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
<br>
${contactezNous}
<br>
</p>
<p align="right">L'équipe Candilib</p>`
