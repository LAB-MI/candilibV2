import { candidat } from '../../../../messages'

export const NB_FOR_CENTERS_75 = (parisCenters = []) => {
  return `Les centres utilisés par le département 75 sont localisés hors 75 et sont les suivants : ${parisCenters.join(', ')}`
}

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
          textContent: 'NB : ' + NB_FOR_CENTERS_75(parisCenters),
        },
        {
          textContent: "Pour rappel, il n'existe pas de centre d'examen localisé à Paris.",
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
        {
          subTitleContent: '- Je n’ai pas accès à mon résultat d\'examen:',
          textContent: 'Candilib me fait savoir que j’aurais réussi mon examen mais je ne vois pas le résultat sur le site de la Sécurité Routière. Les résultats sont généralement en ligne sous 72 h (hors week-ends et jours fériés mais il y a pu y avoir un problème de remontée informatique. À noter qu’entre 2 visites sur le site, vous devez quitter votre navigateur et vous reconnecter, le simple "rafraîchissement" de la page ne permettant pas de provoquer un nouvel affichage des résultats.',
        },
      ],
    },
    {
      title: 'Quand pourrai-je accéder au planning de réservation ?',
      content: [
        {
          textContent: `Après l'acceptation de votre inscription, vous devez attendre ${lineDelay} jours avant de pouvoir accéder au planning de réservation. Cette mise en file d'attente vous permet de planifier votre préparation en vue de réussir votre examen du permis de conduire.`,
        },
      ],
    },
    {
      title: 'Est-ce que je peux modifier ou annuler mon rendez-vous ?',
      content: [
        {
          textContent: 'Vous pouvez modifier ou annuler votre réservation jusqu’à 7 jours avant la date d’examen.',
        },

        {
          textContent: 'Si vous modifiez ou annulez à moins de 7 jours de la date d\'examen, ou si vous ne vous présentez pas à l’examen, il vous sera automatiquement appliqué une pénalité de 45 jours de délais avant de pouvoir effectuer une nouvelle réservation.',
        },
        {
          textContent: 'Merci de nous prévenir en cas d\'empêchement afin de libérer le créneau pour un autre candidat.',
        },
      ],
    },
    {
      title: 'Je n\'ai pas réussi mon examen, puis-je reprendre une place ?',
      content: [
        {
          textContent: 'Si vous avez échoué, avez été refusé par l’inspecteur ou avez été absent à l\'examen pratique du permis de conduire, il vous sera automatiquement appliqué une pénalité de 45 jours de délais avant de pouvoir effectuer une nouvelle réservation.',
        },
        {
          textContent: 'Vous devez, sans autre formalité, retourner dans votre espace Candilib pour réserver une nouvelle place.',
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
          textContent: `${candidat.messsage_mise_a_disposition_des_places}`,
        },
        {
          textContent: 'Vous pouvez aussi réserver une place dans un autre département.',
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
