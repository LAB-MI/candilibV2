export const getCancelBookingByAdminTemplate = (
  nomNaissance,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa,
  urlRESA,
  urlFAQ,
) => `<p>Madame, Monsieur ${nomNaissance},</p>
<br>
<p>
  Votre réservation à ${nameCentre.toUpperCase()} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} a été annulée à la suite d'un imprévu lié à l'administration.
  <br>Vous pouvez dès à présent replanifier un créneau à votre convenance : <a href=${urlRESA}>se connecter</a>
</p>
<p>
  Veuillez nous excuser pour la gêne occasionnée.
</p>
<br>
<p align="right">L'équipe Candilib</p>`
