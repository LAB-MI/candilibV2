import { findCentresWithNbPlaces } from './centre.business'

export async function getCentres (req, res) {
  const departement = req.param('departement')
  const centres = await findCentresWithNbPlaces(departement)
  res.status(200).json(centres)
}
