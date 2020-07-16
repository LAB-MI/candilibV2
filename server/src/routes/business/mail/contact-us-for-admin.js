export const getContactUsForAdmin = (
  codeNeph,
  nomNaissance,
  prenom,
  email,
  portable,
  homeDepartement,
  hasSignUp,
  subject,
  message,
) => `<p>
  <strong>Infromation Candidat:</strong><br>
  <ul>
  <li>  NEPH: ${codeNeph}</li>
    <li>  Nom: ${nomNaissance}</li>
    <li>  Prénom: ${prenom}</li>
    <li>  Courriel: <a href="mailto:${email}?subject=RE:${subject}">${email}</a></li>
    <li>  Portable: ${portable}</li>
    <li>  Département de résidence: ${homeDepartement}</li>
    <li>  Candidat pré-inscrit ou inscrit: ${hasSignUp}</li>
  </ul>
  </p>
  <p>
  <strong>Message: </strong>
  ${message}
  </p>`
