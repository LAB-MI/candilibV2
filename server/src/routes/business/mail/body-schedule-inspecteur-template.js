export const getSheduleInspecteurTemplate = (
  inspecteurName,
  inspecteurMatricule,
  dateExam,
  nomCentre,
  departement,
  planning
) => {
  const list = Object.keys(planning)
    .sort((heure1, heure2) => {
      if (heure1 < heure2) {
        return -1
      }
      if (heure1 > heure2) {
        return 1
      }
      return 0
    })
    .map(heure => {
      const { neph, nom, prenom } = planning[heure]
      return `
        <tr>
          <td>${heure || ''}</td>
          <td>${neph || ''}</td>
          <td>${nom || ''}</td> 
          <td>${prenom || ''}</td> 
          <td></td> 
        </tr>`
    })
    .reduce((lines, line) => lines + line)
  return `
  <h2 style="width: 100%; text-align: center">Bordereau Inspecteur</h2>
  <p><span style="width: 50px"><strong>Inspecteur: </strong></span> ${inspecteurName}</p>
  <p><span style="width: 50px"><strong>Matricule: </strong></span>${inspecteurMatricule}</p>
  <p><span style="width: 50px"><strong> date : </strong></span>  ${dateExam}</p>  
  <p><span style="width: 50px"><strong>Centre: </strong></span> ${nomCentre}</p>  
  <p><span style="width: 50px"><strong>Departement: </strong></span> ${departement}</p>
  <table width="100%" border="1" style="border-collapse: collapse;">
    <thead>
      <tr>
        <th>Heure</th>
        <th>Neph</th>
        <th>Nom</th>
        <th>prénom</th>
        <th>Resultat</th>
      </tr>
    </thead>
    <tbody>
      ${list}
    </tbody>
  </table>
  `
}
