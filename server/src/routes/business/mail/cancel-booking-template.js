export const getCancelBookingTemplate = (
  nomNaissance,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa
) => `<p>Madame, Monsieur ${nomNaissance},</p>
<br>
<p>
  Votre réservation à l'examen pratique du permis de conduire 
  à ${nameCentre} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} est bien annulée.
  Vous pouvez choisir un autre créneau disponible.
</p>

<br>
<p align="right">L'équipe Candilib</p>`
