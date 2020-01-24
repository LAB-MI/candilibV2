export const getInscriptionKOTemplate = (
  nomMaj,
  codeNeph,
  urlFAQ,
  contactezNous
) => `<p>Madame, Monsieur ${nomMaj},</p>
  <br>
  <p>
    Vous avez demandé à rejoindre le site de réservation des candidats libres. Malheureusement les informations
    que vous avez fournies sont erronées :
  </p>
  <p align="center">NEPH ${codeNeph} / NOM ${nomMaj}</p>
  <p>Merci de les vérifier avant de renouveler votre demande d’inscription.</p>
  <br>
  <p>Veuillez consulter notre <a href=${urlFAQ}>aide en ligne</a>.<p>
  <br>
  ${contactezNous}
  <br>
  <p align="right">L'équipe Candilib</p>`
