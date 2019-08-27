import config from '../../../config'

export const getCancelBookingTemplate = (
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
  Votre réservation à l'examen pratique du permis de conduire
  à ${nameCentre.toUpperCase()} le ${dateResa} à ${houreResa} avec le numéro NEPH ${codeNeph} est bien annulée.
</p>
<p>
Si vous avez annulé ${config.daysForbidCancel} jours avant la date prévue,
  vous pourrez librement choisir <a href=${urlRESA}>un autre créneau disponible</a>.
  Si vous avez annulé à moins de ${
  config.daysForbidCancel
} jours de la date prévue,
  un délai de repassage de ${
  config.timeoutToRetry
} jours à partir de la date de réservation annulée, vous sera appliqué.
  Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>
</p>
<br>
<p align="right">L'équipe Candilib</p>`
