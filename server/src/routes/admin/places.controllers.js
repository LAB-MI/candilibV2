import * as csvParser from 'fast-csv'
import moment from 'moment'

import logger from '../../util/logger'
import {
  PLACE_ALREADY_IN_DB_ERROR,
  findAllPlaces,
  createPlace,
} from '../../models/place'

const getPlaceStatus = (centre, inspecteur, date, status, details) => ({
  centre,
  inspecteur,
  date,
  status,
  details,
})

export const importPlaces = (req, res, next) => {
  const csvFile = req.files.file
  let PlacesPromise = []

  csvParser
    .fromString(csvFile.data.toString(), { headers: false, ignoreEmpty: true })
    .transform(data => {
      if (data[0] === 'Date') return

      const [day, time, inspecteur, centre] = data

      const myDate = `${day.trim()} ${time.trim()}`
      const date = moment(
        moment(myDate, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
      )

      return {
        date,
        centre: centre.trim(),
        inspecteur: inspecteur.trim(),
      }
    })
    .on('data', async place => {
      console.debug({ place })
      const fctPromise = new Promise(async resolve => {
        const { centre, inspecteur, date } = place
        try {
          await createPlace(place)
          logger.info(
            `Place ${centre} ${inspecteur} ${date} enregistrée en base`
          )
          resolve(
            getPlaceStatus(
              centre,
              inspecteur,
              date,
              'success',
              `Place enregistrée en base`
            )
          )
        } catch (error) {
          if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
            logger.error(error)
            logger.warn('Place déjà enregistrée en base')
            resolve(
              getPlaceStatus(
                centre,
                inspecteur,
                date,
                'error',
                'Place déjà enregistrée en base'
              )
            )
          }
          logger.error(error)
          resolve(
            getPlaceStatus(
              centre,
              inspecteur,
              date,
              'error',
              'erreur inconnue pour cet enregistrement'
            )
          )
        }
      })
      PlacesPromise.push(fctPromise)
    })
    .on('end', async () => {
      const result = await Promise.all(PlacesPromise)
      res.status(200).send({
        fileName: csvFile.name,
        success: true,
        message: `Le fichier ${csvFile.name} a été traité.`,
        places: result,
      })
      // next()
    })
}

export const getPlaces = async (req, res) => {
  const places = await findAllPlaces()
  res.json(places)
}
