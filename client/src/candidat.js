
export default {
  app_name: 'Candilib',
  app_subtitle: 'Réservez votre place d\'examen',
  preinscription_title: 'Candilib',
  preinscription_form_notice: 'Tous les champs marqués d\'un astérisque * sont obligatoires',
  preinscription_neph: 'NEPH (obligatoire)',
  preinscription_neph_erreur: 'Le code neph n\'est pas valide',
  preinscription_nom_naissance: 'Nom de naissance (obligatoire)',
  preinscription_prenom: 'Prénom',
  preinscription_email: 'Courriel (obligatoire)',
  preinscription_email_erreur: 'L\'adresse courriel doit être valide',
  preinscription_email_vide: 'Veuillez renseigner votre adresse courriel',
  preinscription_mobile: 'Portable (obligatoire)',
  preinscription_mobile_erreur: 'Le numéro de téléphone doit être valide',
  preinscription_adresse: 'Adresse (obligatoire)',
  preinscription_bouton_submit: 'Pré-inscription',
  preinscription_bouton_deja_inscrit: 'Déjà Inscrit ?',
  preinscription_bouton_mentions_legales: 'Mentions légales',
  preinscription_bouton_faq: 'Une question ?',
  preinscription_magic_link_title: 'Recevez un lien de connexion',
  preinscription_magic_link_msg: 'Envoyez un Lien de connexion',
  preinscription_bouton_magic_link: 'Envoyez un Lien de connexion',
  preinscription_formulaire_invalide: 'Veuillez remplir le formulaire',
  preinscription_magic_link_invalide: 'Veuillez fournir votre adresse courriel',
  preinscription_magic_link_envoyé: 'Un lien de connexion vous a été envoyé. Veuillez consulter votre boîte courriel',
  home_choix_du_centre: 'Choix du centre',
  home_choix_date_creneau_message_de_penalite: `Vous avez annulé ou modifié votre réservation à moins de {numberOfDaysBeforeDate} jours de la date d'examen.
    Vous ne pouvez sélectionner une date qu'à partir du {displayDate}`,
  confirmation_reservation_title: 'Confirmation',
  confirmation_reservation_subtitle: 'Vous avez choisi de passer l’épreuve pratique du permis à',
  confirmation_reservation_word: 'Le',
  confirmation_reservation_checkbox_title: 'Pensez à vérifier',
  confirmation_reservation_checkbox_accompagner: 'qu’une personne peut vous accompagner *',
  confirmation_reservation_checkbox_double_commande: 'qu’une voiture à double commande est disponible *',
  confirmation_reservation_boutton_retour: 'Retour',
  confirmation_reservation_boutton_confirmation: 'Confirmer',
  confirmation_reservation_boutton_modification_confirmation: 'Confirmer',
  recap_reservation_confirmee: 'Votre réservation est confirmée',
  recap_reservation_email_confirmee: 'Un email de confirmation vous a été envoyé à l\'adresse renseignée à l\'inscription',
  recap_reservation_last_date_to_cancel: 'Si vous annulez après le {lastDateToCancelString} vous serez pénalisé·e de {penaltyDaysNumber} jours',
  recap_reservation_boutton_annuler: 'Annuler',
  recap_reservation_modal_annuler_body_with_penalty:
    `<p>
      En poursuivant, votre réservation du {dateCurrentResa} sera annulée.
    </p>
    <p>
      De plus, étant à moins de {nbOfDaysBeforeDate} jours de la date d'examen,
      <b>un délai de repassage de {penaltyNb} jours</b>
      s'appliquera à partir de la date de votre réservation annulée.
    </p>
    <p class="red--text">
      Souhaitez-vous confirmer ?
    </p>`,
  recap_reservation_modal_annuler_body_without_penalty:
    `<p>
      En poursuivant, votre réservation du {dateCurrentResa} sera annulée.
      </p>
    <p class="red--text">
      Souhaitez-vous confirmer ?
    </p>`,
  recap_reservation_modal_annuler_boutton_retour: 'Retour',
  recap_reservation_modal_annuler_boutton_confirmer: 'Confirmer',
  recap_reservation_modal_modification_boutton_continuer: 'Continuer',
  recap_reservation_modal_modification_body_info_penalty:
    `<p>
      Vous allez changer de date pour votre examen à l'épreuve pratique.
    </p>
    <p>
      Conformément aux règles de gestion de candilib vous ne pourrez pas choisir une nouvelle date avant un délai de
      <strong>
        {penaltyNb} jours
      </strong>
      après le
      <strong>
        {dateCurrentResa}
      </strong>.
      <p>
        Vous pourrez donc sélectionner une date qu'à partir du
        <strong>
          {canBookFrom}
        </strong>.
      </p>
    </p>
    <p>
      Souhaitez-vous néanmoins poursuivre votre modification ?
    </p>`,
  recap_reservation_boutton_modifier: 'Modifier',
  recap_reservation_boutton_renvoyer_email: 'Renvoyer',
  stepper_step_1_title: 'Pré-inscription',
  stepper_step_1_subtitle: 'Vous remplirez un formulaire en ligne',
  stepper_step_1_p: 'Vous devrez fournir votre nom et prénom, votre NEPH, et une adresse courriel valide, entre autres informations.',
  stepper_step_2_title: 'Validation de votre adresse courriel',
  stepper_step_2_subtitle: 'Vous validerez votre adresse courriel en cliquant sur le lien présent dans le courriel',
  stepper_step_2_p: 'Ce courriel arrivera à l\'adresse indiquée dans le formulaire de pré-inscription.',
  stepper_step_3_title: 'Validation de votre inscription',
  stepper_step_3_subtitle: 'Nous ferons les vérifications nécessaires',
  stepper_step_3_p1: 'Nous vérifierons votre nom et votre NEPH ainsi que les prérequis pour passer l\'épreuve pratique.',
  stepper_step_3_p2: 'Vous recevrez un courriel vous indiquant si votre inscription est validée ou non.',
  stepper_step_4_title: 'Réservation de votre place d\'examen',
  stepper_step_4_subtitle: 'Connexion à l\'application par le magic link envoyé par mail pour réserver votre place',
  stepper_step_4_p: 'Si votre inscription est validée, vous pouvez réserver votre place d\'examen sur l\'application.',
}
