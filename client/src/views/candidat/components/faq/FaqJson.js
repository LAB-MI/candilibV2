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
          textContent: `Cependant, seuls les départements de la liste suivante proposent des places via ce service : ${departements.join(', ')}`,
        },
        {
          textContent: `NB : les candidats du 75, du fait des conditions de circulation dans Paris intramuros, pourront choisir parmi les centres d'examen suivants : ${parisCenters.join(', ')}`,
        },
      ],
    },
    {
      title: 'Comment ça marche ?',
      content: [
        {
          textContent: 'Vous avez reçu une invitation nominative par mail à vous inscrire sur Candilib.',
        },
        {
          subTitleContent: 'Pour s\'inscrire',
          textContent: 'Rendez-vous sur la page d\'accueil du service pour se pré-inscrire.',
        },
        {
          textContent: 'Vous saisirez sur le formulaire vos NEPH (le numéro que vous avez reçu pour l\'inscription au permis), nom de naissance, prénom, mail, téléphone et adresse postale.',
        },
        {
          subTitleContent: 'Pour réserver',
          textContent: 'Connectez-vous à Candilib après réception du mail « Validation de votre inscription à Candilib » (lien de connexion dans le mail de validation).',
        },
        {
          textContent: 'Sélectionnez votre centre d\'examen, puis un créneau disponible à la date qui vous convient (si besoin, déplacez-vous sur les vues « mois », « semaine » et « jour »).',
        },
        {
          textContent: 'Confirmez votre réservation.',
        },
      ],
    },
    {
      title: 'Quand pourrais-je accéder au planning de réservation ?',
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

      ],
    },
    {
      title: 'Quels sont les pré-requis le jour de l\'examen ?',
      content: [
        {
          textContent: 'Nous vous rappelons les éléments à vérifier le jour de l\'examen:',
        },
        {
          list: [ 'Vous fournirez un véhicule en parfait état, équipé d ’une double commande de frein et d’embrayage, de 2 rétroviseurs intérieurs et de 2 rétroviseurs latéraux.',
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
          textContent: '<b>Attention</b> : le mauvais état du véhicule (pneus lisses, rétroviseurs cassés ou absents, dysfonctionnement d’un feu, etc.), ou l\'absence ou la non-validité d\'un des documents exigés ci-dessus, pour le candidat ou son accompagnateur,l’inspecteur sera dans l’obligation réglementaire de vous refuser le passage de l’examen.',
        },
      ],
    },
    {
      title: 'Je ne trouve pas de place disponible ?',
      content: [
        {
          textContent: 'De nouveaux créneaux sont ajoutés régulièrement.',
        },
      ],
    },
    {
      title: 'Je n’ai pas été invité à participer à l’expérimentation ?',
      content: [
        {
          textContent: `L’inscription à candilib se fait obligatoirement après réception d’un mail d’invitation envoyé par les services départementaux en charge de l’expérimentation. La priorité est donnée aux candidat·e·s qui sont en attente depuis plusieurs mois.`,
        },
        {
          textContent: `Pour rappel, les candidat·e·s qui peuvent faire partie de l’expérimentation sont inscrits sur le <a href="https://permisdeconduire.ants.gouv.fr/Services-associes/Effectuer-une-demande-de-permis-de-conduire-en-ligne" rel="nofollow">site Permis de conduire de l’ANTS</a>, ont réussi l’épreuve théorique du code de la route et ont effectué une demande de place d’examen en candidat libre.`,
        },
        {
          textContent: `La demande de place d’examen en candidat libre s’effectue auprès du service en charge des examens du permis de conduire de votre lieu de résidence (information et précisions disponibles sur le site <a href="https://www.service-public.fr/particuliers/vosdroits/F2825" rel="nofollow">site services-public.fr</a>). Toute demande en dehors de ce circuit ne peut pas être prise en compte.`,
        },
      ],
    },
    {
      title: 'Aide / Contact',
      content: [
        {
          subTitleContent: 'Si vous vous êtes déjà pré-inscrit, posez vos questions à l\'adresse de contact personnalisée que vous avez reçue par courriel.',
        },
        {
          subTitleContent: 'Si vous n\'êtes pas pré-inscrit ou si vous n\'avez pas trouvé de réponse à vos questions dans ces informations, vous pouvez nous contacter à cette adresse <a href="mailto:candilib@interieur.gouv.fr">candilib@interieur.gouv.fr</a>.',
        },
      ],
    },
  ]

  return returnArray
}
