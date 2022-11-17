import { candidat } from '../../../../messages'

export const NB_FOR_CENTERS_75 = (parisCenters = []) => {
  return `Les centres utilisés par le département 75 sont localisés hors 75 et sont les suivants : ${parisCenters.join(', ')}`
}

export const DEPARTEMENT_HAVE_DISABLE_DATE = (homeDepartement, disableDate) => `<p class="text-black">En raison du déploiement de RdvPermis dans votre département
(${homeDepartement}), l’application Candilib ne proposera plus de places d’examens
après la date du ${disableDate}.</p> <p class="text-black"> Pour plus d’informations sur les modalités
d’inscription sur RdvPermis, rapprochez-vous de votre formateur ou consultez la page suivante <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/passer-son-permis-de-conduire/inscription-et-formation/reserver-en-ligne-sa-place-pour-le" target="_blank" >Réserver en ligne sa place pour le permis | Sécurité Routière </a>.</p>`

export function faqJson (lineDelay, departements = [], parisCenters = []) {
  const returnArray = [
    {
      title: 'Qu\'est-ce que Candilib ?',
      content: [
        {
          textContent: 'Candilib est une expérimentation d\'un nouveau service de réservation en ligne des places d\'examen pratique du permis de conduire à destination des candidats libres.',
        },
      ],
    },
    {
      title: 'Qu\'est-ce qu\'un candidat libre ?',
      content: [
        {
          textContent: 'Est défini réglementairement comme « candidat libre » tout candidat qui n\'est pas présenté sur les droits à places d\'une école de conduite et qui fait l\'objet d\'une convocation nominative de la part de l\'administration.',
        },
        {
          subTitleContent: 'Source réglementaire :',
          textContent: '<a class="link-in-text-style" href="https://www.legifrance.gouv.fr/affichTexteArticle.do?idArticle=LEGIARTI000032966489&amp;cidTexte=LEGITEXT000029705598&amp;dateTexte=20181205" target="_blank">Arrêté du 22 octobre 2014 fixant la méthode nationale d\'attribution des places d\'examen du permis de conduire - Article 5</a>',
        },
      ],
    },
    {
      title: 'Qui peut utiliser le service ?',
      content: [
        {
          textContent: 'Tout « candidat libre » peut utiliser le service.',
        },
        {
          textContent: `Cependant, seuls les départements de la liste suivante proposent actuellement des places via ce service : ${departements.join(', ')}`,
        },
        {
          textContent: 'En raison du déploiement de RdvPermis sur les départements 45 – 75 – 76 – 77 – 78 – 91 – 92 – 93 – 94 et 95, l’application Candilib n’accepte plus d’inscription pour les départements concernés. <br> Pour les départements 45 – 75 – 77 – 78 – 91 – 92 – 93 – 94 et 95, Candilib ne propose plus aucune place examen. <br> Pour le département 76, Candilib ne proposera plus aucune place examen au-delà du 31/12/2022.',
        },
        {
          textContent: 'Si vous êtes lié à une auto-école (en ligne ou de proximité), vous devez vous rapprocher de la structure concernée afin d’être pris sous mandat, inscrit sur RdvPermis, et positionné sur une place d’examen.',
        },
        {
          textContent: 'Si vous êtes candidat libre (sans auto-école et formé par un proche), vous pouvez sur RdvPermis :',
          list: [
            'Prendre directement rendez-vous pour l’examen du permis de conduire accompagné par un de vos proches titulaire du permis de conduire ;',
            "Attention : <strong> l'accompagnement par un professionnel est interdit </strong> pour une prise de rendez-vous via ce site d'inscription et vous devrez fournir le jour de l'examen un véhicule assuré et équipé de double-commande",
          ],
        },
        {
          textContent: 'Pour plus d’informations sur les modalités d’inscription sur RdvPermis, vous pouvez consulter la page suivante <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/passer-son-permis-de-conduire/inscription-et-formation/reserver-en-ligne-sa-place-pour-le" target="_blank"> Réserver en ligne sa place pour le permis | Sécurité Routière </a>',
        },
      ],
    },
    {
      title: 'Comment ça marche ?',
      content: [
        {
          subTitleContent: '- Pour s\'inscrire:',
          textContent: 'Rendez-vous sur la page d\'accueil du service pour se pré-inscrire.',
        },
        {
          textContent: 'Vous saisirez sur le formulaire vos NEPH (le numéro que vous avez reçu pour l\'inscription au permis), nom de naissance, prénom, mail, téléphone et votre département de résidence.',
        },
        {
          textContent: 'Si celui-ci ne figure pas dans la liste déroulante, vous devrez choisir le département le plus proche de chez vous. Cela n’aura pas de conséquence pour le choix de votre lieu de passage de l’examen.',
        },
        {
          subTitleContent: '- Pour réserver:',
          textContent: 'Connectez-vous à Candilib après réception du mail « Validation de votre inscription à Candilib » (lien de connexion dans le mail de validation).',
        },
        {
          textContent: '<div style="display: flex; align-items: center;"> <span class="material-icons"> warning </span> <span style="padding-left: 5px"> Si vous êtes déjà inscrit sur Candilib, cliquez sur "Déjà inscrit" en indiquant l\'adresse mail utilisée pour votre inscription, vous recevrez un nouveau lien vous permettant d\'accéder au planning de réservation.</span></div> ',
        },
        {
          textContent: 'Sélectionnez le département choisi, puis votre centre d\'examen, puis un créneau disponible à la date qui vous convient (si besoin, déplacez-vous sur les vues « mois », « semaine » et « jour »).',
        },
        {
          textContent: 'Confirmez votre réservation.',
        },
        {
          subTitleContent: '- Je n’ai pas reçu la validation de ma pré-inscription après 48h:',
          textContent: 'Un problème technique peut avoir empêché la vérification de votre pré-inscription. Si vous n’avez pas reçu de mail de validation ou de rejet après 4 jours (hors week-ends et jours fériés), vous pourrez contacter votre service Candilib.',
        },
      ],
    },
    {
      title: "Où trouver mon résultat d'examen ?",
      content: [
        {
          subTitleContent: '- Où Consulter mon résultat ?',
          textContent: 'Vous pouvez accéder à votre résultat d\'examen en consultant le lien suivant : <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire" target="_blank">www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire</a>',
        },
        {
          subTitleContent: '- Je n’ai pas accès à mon résultat d\'examen:',
          textContent: 'Candilib me fait savoir que j’aurais réussi mon examen mais je ne vois pas le résultat sur <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire" target="_blank">le site de la Sécurité Routière</a>. Votre résultat est disponible entre 2 et 4 jours ouvrables après le passage de l\'examen (week-end et jours fériés non inclus).',
        },
        {
          subTitleContent: "- Je vois mon ancien résultat d'examen:",
          textContent: 'Votre ancien résultat d\'examen apparaît sur <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire" target="_blank">le site de la Sécurité Routière</a>. Votre résultat est disponible entre 2 et 4 jours ouvrables après le passage de l\'examen (week-end et jours fériés non inclus).<br><div style="display: flex; align-items: center;"> <span class="material-icons"> warning </span> <span style="padding-left: 5px"> D\'autre part, entre 2 visites sur le site, vous devez quitter votre navigateur et vous reconnecter, le simple "rafraîchissement" de la page ne permettant pas de provoquer un nouvel affichage des résultats.</span></div>',
        },
      ],
    },
    {
      title: 'Quand pourrai-je accéder au planning de réservation ?',
      content: [
        {
          textContent: `Après l'acceptation de votre inscription, vous devez attendre ${lineDelay} jours avant de pouvoir accéder au planning de réservation. Cette mise en file d'attente vous permet de planifier votre préparation en vue de réussir votre examen du permis de conduire.`,
        },
        {
          subTitleContent: '- Visibilité sur les places d’examen:',
        },
        {
          list: [
            `Les candidats en attente d’une place ont été classés des plus anciennes aux plus récentes inscriptions
            sur Candilib.`,
            `Chaque jour, les places d’examen vont apparaitre graduellement des plus anciennes aux plus
            récentes inscriptions toutes les 10 minutes, à partir de midi et ce jusqu’à midi cinquante.`,
            'Pour savoir à quelle heure les places apparaissent pour vous : consultez la page "Mon profil". Vous retrouvez également cette information sur la page dédiée au planning de réservation de places.',

          ],
        },
        {
          subTitleContent: 'Attention :',
        },
        {
          list: [
            'les candidats qui sont dans la période des 45 jours de délai d’attente, à la suite d’un échec, d’une annulation ou d’un refus sont classés durant ces 45 jours au même niveau que les inscriptions les plus récentes. Au terme de ces 45 jours, ces candidats sont réintégrés selon leur ancienneté d’inscription.',
            'les candidats qui sont dans la période des 60 jours de délai d’attente, à la suite d’une absence, sont classés durant ces 60 jours au même niveau que les inscriptions les plus récentes. Au terme de ces 60 jours, ces candidats sont réintégrés selon leur ancienneté d’inscription.',
          ],
        },
      ],
    },
    {
      title: 'Est-ce que je peux modifier ou annuler mon rendez-vous ?',
      content: [
        {
          textContent: 'Je ne peux pas modifier. Si la date réservée ne me convient plus, je dois annuler ma réservation avant de pouvoir réserver de nouveau sur le site.',
        },
        {
          textContent: 'Si j\'annule mon rendez-vous, je peux réserver une nouvelle place d\'examen à plus de 45 jours de la date d\'examen initialement réservée.',
        },
      ],
    },
    {
      title: 'Je n\'ai pas réussi mon examen, puis-je reprendre une place ?',
      content: [
        {
          textContent: 'Si j\'ai échoué ou j\'ai été refusé par l’inspecteur à l\'examen pratique du permis de conduire, je peux réserver une nouvelle place d\'examen à plus de 45 jours de la date de l\'examen où j\'ai échoué ou ai été refusé.',
        },
        {
          textContent: 'Si j\'ai été absent à l\'examen pratique du permis de conduire, je peux réserver une nouvelle place d\'examen à plus de 60 jours de la date de l\'examen où je ne me suis pas présenté.',
        },
      ],
    },
    {
      title: 'Quels sont les pré-requis le jour de l\'examen ?',
      content: [
        {
          textContent: 'Nous vous rappelons les éléments à vérifier le jour de l\'examen:',
        },
        {
          list: ['Vous fournirez un véhicule en parfait état, équipé d ’une double commande de frein et d’embrayage, de 2 rétroviseurs intérieurs et de 2 rétroviseurs latéraux.',
            'Votre accompagnateur sera :',
            'soit un enseignant de la conduite en possession de son autorisation d\'enseigner pour la présenter à l\'inspecteur,',
            'soit une personne dont le permis B est en cours de validité. Cette dernière devra présenter l’original de son permis de conduire ainsi que la «charte de l’accompagnateur» remplie et signée pour la remettre à l’inspecteur avant le début de l’examen.',
          ],
        },
        {
          textContent: 'Vous présenterez :',
        },
        {
          list: [
            // eslint-disable-next-line no-irregular-whitespace
            `un <b>titre d’identité en cours de validité</b> : Carte nationale d’identité, Passeport ou Titre de séjour
              (Liste complète : <a class="link-in-text-style" href="https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000033736411&amp;categorieLien=id" target="_blank">Arrêté du 23 décembre 2016 relatif à la justification de l'identité, du domicile, de la résidence normale et de la régularité du séjour pour l'obtention du permis de conduire</a>) ;`, // eslint-disable-line no-irregular-whitespace
            '<b>L\'attestation d\'assurance du véhicule<b>, en cours de validité, à votre nom ;',
            'une <b>enveloppe affranchie à 20g</b> ;',
            'votre <b>permis de conduire original si vous avez obtenu une autre catégorie</b> depuis moins de 5 ans afin de bénéficier d’une dispense d’examen théorique général ;',
          ],
        },
        {
          textContent: '<b>Attention</b> : en cas de mauvais état du véhicule (pneus lisses, rétroviseurs cassés ou absents, dysfonctionnement d\'un feu, etc.), ou d\'absence ou de non-validité d\'un des documents exigés ci-dessus, pour le candidat ou son accompagnateur, l\'inspecteur sera dans l\'obligation réglementaire de vous refuser le passage de l\'examen.',
        },
      ],
    },
    {
      title: 'Je ne trouve pas de place disponible ?',
      content: [
        {
          textContent: `- ${candidat.messsage_mise_a_disposition_des_places_faq}`,
        },
        {
          textContent: '- Vous pouvez aussi réserver une place dans un autre département.',
        },
      ],
    },
    {
      title: 'Je souhaite passer en boîte automatique',
      content: [
        {
          textContent: `Il n'y a pas d'examens en boîte automatique ou boîte manuelle.
          C'est le véhicule que vous utiliserez à l'examen qui déterminera si, en cas de réussite, vous avez une restriction à la seule conduite des véhicules à boîte automatique ou pas.`,
        },
      ],
    },
    {
      title: 'Aide / Contact',
      content: [
        {
          subTitleContent: "Si vous n'avez jamais réalisé de demande de NEPH, veuillez vous rendre sur le site de l'<a href='https://www.permisdeconduire.ants.gouv.fr/'>ANTS</a>.",
        },
        {
          subTitleContent: 'Si vous ne vous souvenez pas de votre NEPH, veuillez vous rapprocher du Bureau Éducation Routière de votre département.',
        },
        {
          subTitleContent: 'Sinon, contactez-nous via ce <a href="./contact-us">formulaire</a>.',
        },

      ],
    },
  ]

  return returnArray
}
