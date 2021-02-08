import config from '../../../config'

export const getCancelBookingTemplate = (
  nomNaissance,
  codeNeph,
  nameCentre,
  dateResa,
  houreResa,
  urlFAQ,
  contactezNous,
) => `<p>Madame, Monsieur ${nomNaissance},</p>
<br>
<p>
  Votre réservation à l'examen pratique du permis de conduire
  à ${nameCentre.toUpperCase()} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} est bien annulée.
</p>
<p>
  Si vous avez annulé, un délai de présentation de ${
    config.timeoutToRetry
  } jours à partir de la date de réservation annulée, vous sera appliqué.
  <br/>Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>
  ${contactezNous}
</p>
<br>
<p align="right">L'équipe Candilib</p>`
