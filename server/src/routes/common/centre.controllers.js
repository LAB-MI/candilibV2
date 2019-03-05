import { findCentresWithNbPlaces } from './centre.business'
import { findCentreByNameAndDepartement } from '../../models/centre'

export async function getCentres (req, res) {
  const departement = req.param('departement')
  const nom = req.param('nom')
  if (!nom) {
    const centres = await findCentresWithNbPlaces(departement)
    res.status(200).json(centres)
  } else {
    const centre = await findCentreByNameAndDepartement(nom, departement)
    res.status(200).json(centre)
  }
}
