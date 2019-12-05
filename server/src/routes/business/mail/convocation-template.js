import config from '../../../config'

export const getConvocationTemplate = (
  nameCandidat,
  nameCentre,
  dateResa,
  houreResa,
  codeNeph,
  addressCentre,
  urlRESA,
  urlFAQ
) => `<p>Le présent mail vaut convocation.</p>
<p>Madame, Monsieur ${nameCandidat},</p>
<br>
<p>Nous avons bien pris en compte votre réservation à l'examen pratique du permis de conduire le ${dateResa} à ${houreResa}
avec le numéro NEPH ${codeNeph} sur le centre ${nameCentre.toUpperCase()} à l'adresse ${addressCentre}</p>
<p>Nous vous rappelons les éléments à vérifier le jour de l'examen :</p>
<ul>
  <li>
    Vous fournirez un véhicule en parfait état, équipé d’une double commande de frein et d’embrayage, de 2 rétroviseurs intérieurs et de 2 rétroviseurs latéraux.
  </li>
  <li>
    Votre accompagnateur sera soit un enseignant de la conduite en possession de l'original de son autorisation d'enseigner pour la présenter à l'inspecteur,
    soit une personne dont le permis B est en cours de validité. Cette dernière devra présenter son permis ainsi que la « <a href='https://www.legifrance.gouv.fr/jo_pdf.do?id=JORFTEXT000036251681'>charte de l’accompagnateur</a> » remplie et signée
    pour la remettre à l’inspecteur avant le début de l’examen.
  </li>
  <li>
      Vous présenterez un titre d’identité en cours de validité : Carte nationale d’identité, Passeport ou Titre de séjour (Liste complète :
      <a class="link-in-text-style" href="https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000033736411&categorieLien=id">
        arrêté du 23 décembre 2016 relatif à la justification de l&apos;identité, du domicile, de la résidence normale et de la régularité du séjour pour l&apos;obtention du permis de conduire
      </a>).
  </li>
  <li>
      Votre permis de conduire original si vous avez obtenu une autre catégorie depuis moins de 5 ans afin de bénéficier d’une dispense d’examen théorique général.
  </li>
  <li>
    L'attestation d'assurance du véhicule, en cours de validité, comportant obligatoirement les mentions suivantes :
    <uL>
      <li>la raison sociale de la société d'assurance ;</li>
      <li>les nom et prénom du candidat bénéficiant de la police d'assurance ;</li>
      <li>le numéro d'immatriculation du véhicule couvert ;</li>
      <li>le type d'assurance (couverture de l'ensemble des dommages pouvant être causés aux tiers à l'occasion de l'examen)</li>
    </ul>
  </li>
  <li>
    Vous serez muni d'une enveloppe affranchie à 20 g.
  </li>
  <li>
      Si vous avez fait l'objet d'une annulation de permis,
      vous apporterez le récépissé de la "fiche retour au permis de conduire"
      que vous aurez imprimé sur le site de l'<a href='https://www.permisdeconduire.ants.gouv.fr/'>ANTS</a>.
  </li>
</ul>
<p><b>Attention :</b></p>
<p>
  Le mauvais état du véhicule (pneus lisses, rétroviseurs cassés ou absents, dysfonctionnement d'un feu, etc.),
  l'absence ou la non-validité d'un des documents exigés ci-dessus,
  pour le candidat ou l'accompagnateur, entraîne le report de l'examen à une date ultérieure.
</p>
<p>
  Si besoin, vous avez la possibilité d'annuler ou modifier <a href=${urlRESA}>votre réservation</a>.
  Si vous annulez ou modifiez ${
    config.daysForbidCancel
  } jours avant la date prévue,
  vous pourrez librement choisir un autre créneau disponible.
  Si vous annulez ou modifiez à moins de ${
    config.daysForbidCancel
  } jours de la date prévue,
  un délai de repassage de ${
    config.timeoutToRetry
  } jours à partir de la date de réservation annulée ou modifiée, vous sera appliqué.
  Nous vous souhaitons une bonne préparation et le succès à l'examen.
  Pour toute information, vous pouvez consulter <a href=${urlFAQ}>notre aide en ligne</a>.
</p>
<div  style="border: 1px solid #2196f3; padding: 10px">
<p><strong> Résultat de votre examen: </strong></b></p>
<p>48h après le passage de votre examen (week-end et jours fériés non inclus) vous avez la possibilité de consulter <a href='https://www.securite-routiere.gouv.fr/resultats-du-permis-de-conduire'>votre résultat</a>. En cas de réussite, vous devrez solliciter par vous même la fabrication de votre permis de conduire sur le site de l'<a href='https://www.permisdeconduire.ants.gouv.fr/'>ANTS</a>.
</p>
</div>

<br/>
<p align="right">L'équipe Candilib</p>`
