export const getCancelBookingByAdminTemplate = (
  nomNaissance,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa,
  urlRESA,
  urlFAQ
) => `<p>Madame, Monsieur ${nomNaissance},</p>
<br>
<p>
  Votre réservation à ${nameCentre.toUpperCase()} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} a été annulée suite à un imprévu lié à l'administration.
  Vous pouvez dès à présent replanifier un créneau à votre convenance : <a href=${urlRESA}>se connecter</a>
  Veuillez nous excuser pour la gène occasionnée.
</p>
<br>
<p align="right">L'équipe Candilib</p>`
