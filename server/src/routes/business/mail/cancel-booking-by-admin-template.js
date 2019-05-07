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
  Votre réservation à ${nameCentre} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} a été annulée suite à un imprévu qui incombe à l'administration.
  Vous serez contacté dans les prochains jours pour replanifier un créneau à votre convenance.
  Vous pouvez aussi solliciter <a href=${urlFAQ}>le service administratif dédié</a> dès à présent.
</p>
<br>
<p align="right">L'équipe Candilib</p>`
