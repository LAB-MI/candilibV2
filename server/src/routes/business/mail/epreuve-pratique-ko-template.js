export const getEpreuvePratiqueKOTemplate = (
  nameCandidat,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa,
  urlRESA,
  urlFAQ
) => `<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>
En raison de l’application de la réglementation relative au délai imposé entre 2 passages de l’examen, 
votre réservation à l'examen pratique du permis de conduire à ${nameCentre} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} est malheureusement annulée. 
</p>
<p>
Nous vous invitons à vous positionner sur <a href=${urlRESA}>un nouveau créneau</a>.
Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
</p>
<br>
<p align="right">L'équipe Candilib</p>`
