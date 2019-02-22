import { findCentresByDepartement, findAllCentres } from '../../models/centre'
import { countPlacesByCentre } from '../../models/place'

export async function findCentresWithNbPlaces (departement, beginDate, endDate) {
  const centres = departement
    ? await findCentresByDepartement(departement)
    : await findAllCentres()

  return centres.map(async centre => {
    const count = await countPlacesByCentre(centre, beginDate, endDate)
    return {
      ...centre,
      count,
    }
  })
}
