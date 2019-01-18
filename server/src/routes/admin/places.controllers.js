import * as csvParser from 'fast-csv'
import moment from 'moment'

import logger from '../../util/logger'
import {
  PLACE_ALREADY_IN_DB_ERROR,
  findAllPlaces,
  createPlace,
} from '../../models/place'

export const importPlaces = (req, res, next) => {
  const csvFile = req.files.file

  csvParser
    .fromString(csvFile.data.toString(), { headers: false, ignoreEmpty: true })
    .on('data', async data => {
      if (data[0] === 'Date') return

      const [day, time, inspecteur, centre] = data

      const myDate = `${day.trim()} ${time.trim()}`
      const date = moment(
        moment(myDate, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
      )

      const place = {
        date,
        centre: centre.trim(),
        inspecteur: inspecteur.trim(),
      }

      try {
        await createPlace(place)
        logger.info(`Place ${centre} ${inspecteur} ${date} enregistrée en base`)
      } catch (error) {
        if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
          logger.error(error)
          logger.warn('Place déjà enregistrée en base')
          return
        }
        logger.error(error)
      }
    })
    .on('end', () => {
      next()
    })

  res.status(200).send({ name: csvFile.name })
}

export const getPlaces = async (req, res) => {
  const places = await findAllPlaces()
  res.json(places)
}
