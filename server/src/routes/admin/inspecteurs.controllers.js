import { findInspecteursMatching } from '../../models/inspecteur'

export const getInspecteurs = async (req, res) => {
  const { matching } = req.query

  if (matching) {
    const inspecteurs = await findInspecteursMatching(matching)
    res.json(inspecteurs)
  }
}
