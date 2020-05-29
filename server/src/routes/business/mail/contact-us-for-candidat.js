export const getContactUsForCandidat = departement => `<p> Madame, Monsieur, </p>
  <p>
    Votre demande a bien été transmise aux services
    ${departement ? 'du' : 'de votre'} département ${departement || 'déclaré'}. 
    <br>
    L'administration vous répondra dans les plus brefs délais. <br>
    Sans réponse de notre part au bout d'une semaine, nous vous invitons à réitérer votre demande.
  </p>
<br/>
<p align="right">L'équipe Candilib</p>`
