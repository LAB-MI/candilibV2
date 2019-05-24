export const getSheduleInspecteurTemplate = (date, inspecteurs) => {
  const list = inspecteurs.reduce((acc, insp) => acc + '<li>' + insp + '</li>')
  return `
    <p> Le mail pour le planning des inspecteurs du ${date} n'a pu être envoyé pour les inspecteurs ci-dessous: </p>
    <ul>
      ${list}
    </ul>
  `
}
