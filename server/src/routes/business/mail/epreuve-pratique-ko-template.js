export const getEpreuvePratiqueKOTemplate = (
  nameCandidat,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa,
  urlRESA,
  urlFAQ,
  contactezNous,
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
Votre réservation à l'examen pratique du permis de conduire à ${nameCentre.toUpperCase()} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} est annulée.
</p>
<p>
Nous vous invitons à vous positionner sur <a href=${urlRESA}>un nouveau créneau</a>.
Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
<br>
${contactezNous}
<br>
</p>
<br>
<p align="right">L'équipe Candilib</p>`
