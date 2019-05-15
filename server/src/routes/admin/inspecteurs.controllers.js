import {
  findInspecteursMatching,
  findInspecteurByDepartement,
} from '../../models/inspecteur'

export const getInspecteurs = async (req, res) => {
  const { matching, departement } = req.query
  if (departement && !matching) {
    try {
      const inspecteurs = await findInspecteurByDepartement(departement)
      res.json(inspecteurs)
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  } else if (matching) {
    try {
      const inspecteurs = await findInspecteursMatching(matching)
      res.json(inspecteurs)
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message,
        error,
      })
    }
  }
}
