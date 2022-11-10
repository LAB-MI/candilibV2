
export const getMessageTransistionRdvPermis = (departement, date) => {
  return `<br>
  <div style="border: 5px solid red; padding:5px;">
  <p><strong>Attention:</strong></p>
  <p>En raison du déploiement de RdvPermis sur le département ${departement},
l’application Candilib n’accepte plus d’inscription pour le département concerné.
Candilib ne proposera plus aucune place examen au-delà du ${date} pour ce département.
  </p>
<p>
Si vous êtes lié à une auto-école (en ligne ou de proximité), vous devez vous rapprocher de la structure concernée afin d’être pris sous mandat, inscrit sur RdvPermis, et positionné sur une place d’examen.
</p>
<p>
Si vous êtes candidat libre (sans auto-école et formé par un proche), vous pouvez sur RdvPermis:
<ul>
<li>
Prendre directement rendez-vous pour l’examen du permis de conduire accompagné par un de vos proches titulaire du permis de conduire ;
</li>
<li>
<strong>Attention :</strong> l'accompagnement par un professionnel est interdit pour une prise de rendez-vous via ce site d'inscription et vous devrez fournir le jour de l'examen un véhicule assuré et équipé de double-commandes
</li>
</ul>
</p>
<p>
Pour plus d’informations sur les modalités d’inscription sur RdvPermis, vous pouvez consulter la page suivante <a class="link-in-text-style" href="https://www.securite-routiere.gouv.fr/passer-son-permis-de-conduire/inscription-et-formation/reserver-en-ligne-sa-place-pour-le" target="_blank" >Réserver en ligne sa place pour le permis | Sécurité Routière </a></p>
</div>`
}
