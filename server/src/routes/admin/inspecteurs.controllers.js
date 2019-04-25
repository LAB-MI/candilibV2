import {
  findInspecteursMatching,
  findInspecteurByDepartement,
} from '../../models/inspecteur'

export const getInspecteurs = async (req, res) => {
  const { matching, departement } = req.query
  if (departement && !matching) {
    const inspecteurs = await findInspecteurByDepartement(departement)
    res.json(inspecteurs)
  } else if (matching) {
    const inspecteurs = await findInspecteursMatching(matching)
    res.json(inspecteurs)
  }
}
