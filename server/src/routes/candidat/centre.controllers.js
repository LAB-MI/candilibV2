import { findCentresByDepartement, findAllCentres } from '../../models/centre'

export async function getCentres (req, res) {
  const departement = req.param('departement')
  const centres = departement
    ? await findCentresByDepartement(departement)
    : await findAllCentres()
  res.status(200).json(centres)
}
