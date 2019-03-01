import * as csvParser from 'fast-csv'
import { DateTime } from 'luxon'

import logger from '../../util/logger'
import { PLACE_ALREADY_IN_DB_ERROR, createPlace } from '../../models/place'
import { findCentreByName } from '../../models/centre/centre.queries'

const getPlaceStatus = (
  departement,
  centre,
  inspecteur,
  date,
  status,
  details
) => ({
  departement,
  centre,
  inspecteur,
  date,
  status,
  details,
})
/**
 * TODO:departement a modifier
 * @param {*} data
 */
const transfomCsv = async data => {
  const departement = '93'
  const [day, time, inspecteur, centre] = data

  const myDate = `${day.trim()} ${time.trim()}`

  try {
    const date = DateTime.fromFormat(myDate, 'dd/MM/yy HH:mm', {
      zone: 'Europe/Paris',
      locale: 'fr',
    })
    if (!date.isValid) throw new Error('Date est invalide')

    const foundCentre = await findCentreByName(centre.trim())
    if (!foundCentre) throw new Error(`Le centre ${centre.trim()} est inconnu`)

    return {
      departement,
      centre: foundCentre,
      inspecteur: inspecteur.trim(),
      date,
    }
  } catch (error) {
    logger.error(error)
    return getPlaceStatus(
      departement,
      centre,
      inspecteur,
      myDate,
      'error',
      error.message
    )
  }
}

const createPlaceCsv = async place => {
  const { centre, inspecteur, date } = place
  try {
    const leanPlace = { inspecteur, date, centre: centre._id }
    await createPlace(leanPlace)
    logger.info(
      `Place {${centre.departement},${
        centre.nom
      }, ${inspecteur}, ${date}} enregistrée en base`
    )
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'success',
      `Place enregistrée en base`
    )
  } catch (error) {
    if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
      logger.error(error)
      logger.warn('Place déjà enregistrée en base')
      return getPlaceStatus(
        centre.departement,
        centre.nom,
        inspecteur,
        date,
        'error',
        'Place déjà enregistrée en base'
      )
    }
    logger.error(error)
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'error',
      error.message
    )
  }
}

export const importPlacesCsv = (csvFile, callback) => {
  let PlacesPromise = []

  csvParser
    .fromString(csvFile.data.toString(), { headers: true, ignoreEmpty: true })
    .transform((data, next) => {
      try {
        if (data[0] === 'Date') next()
        else {
          transfomCsv(data).then(result => {
            logger.debug(JSON.stringify({ func: 'then transfomCsv', result }))
            if (result.status && result.status === 'error') {
              PlacesPromise.push(result)
              next()
            } else {
              next(null, result)
            }
          })
        }
      } catch (error) {
        logger.error(error)
      }
    })
    .on('data', place => {
      createPlaceCsv(place).then(result => PlacesPromise.push(result))
    })
    .on('end', () => {
      Promise.all(PlacesPromise).then(callback)
    })
}
