export const getSheduleInspecteurTemplate = (
  nomInspecteur,
  dateExam,
  nomCentre,
  departement,
  planning
) => {
  const list = Object.keys(planning).map(heure => {
    const { neph, nom, prenom } = planning[heure]
    return ` <tr>
        <td>${heure || ''}</td>
        <td>${neph || ''}</td>
        <td>${nom || ''}</td> 
        <td>${prenom || ''}</td> 
        <td></td> 
        </tr>`
  })
  return `
  <h2 style="width: 100%; text-align: center">Bordereau Inspecteur</h2>
<p><span style="width: 50px"><strong>Inspecteur:</strong></span> ${nomInspecteur}</p>
<p><span style="width: 50px"><strong> date : </strong></span>  ${dateExam}</p>  
<p><span style="width: 50px"><strong>Centre: </strong></span> ${nomCentre}</p>  
<p><span style="width: 50px"><strong>Departement: </strong></span> ${departement}</p>
<table width="100%" border="1">
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
