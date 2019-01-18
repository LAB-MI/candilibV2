import Candidat from './candidat.model'
import Place from '../place/place.model'
import moment from 'moment'

export const findBookedCandidats = async (date, inspecteur, centre) => {
  console.debug(date)
  console.debug(inspecteur)
  console.debug(centre)
  let query = Place.where('bookedBy').exists(true)
  if (date && moment(date).isValid()) {
    const startDate = moment(date)
      .startOf('day')
      .toISOString()
    const endDate = moment(date)
      .endOf('day')
      .toISOString()
    query
      .where('date')
      .gte(startDate)
      .lt(endDate)
  }

  if (inspecteur && inspecteur.trim().length > 0) {
    query = query.where('inspecteur', inspecteur)
  }
  if (centre && centre.trim().length > 0) query = query.where('centre', centre)

  const places = await query.exec()
  if (places) {
    const candidats = await Promise.all(
      places.map(async place => {
        const { bookedBy: id } = place
        const candidat = await Candidat.findById(id)
        if (!candidat) return {}
        candidat.place = place
        return candidat
      })
    )
    return candidats
  }
  return null
}
