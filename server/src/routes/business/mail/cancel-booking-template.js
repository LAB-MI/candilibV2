export const getCancelBookingTemplate = (
  nomNaissance,
  codeNeph
) => `<p>Madame, Monsieur ${nomNaissance},</p>
<br>
<p>votre réservation à l'examen pratique du permis de conduire avec
le numéro NEPH ${codeNeph} est bien annulée. </p>
<br>
<p align="right">L'équipe Candilib</p>`
