import { findAllPlaces } from '../../models/place'
import { importPlacesCsv } from './places.business'
import { findCentresWithPlaces } from '../common/centre.business'
import { appLogger } from '../../util'

export const importPlaces = (req, res) => {
  const csvFile = req.files.file
  try {
    appLogger.info(`import places provenant dufichier ${csvFile.name}`)
    importPlacesCsv(csvFile, result => {
      appLogger.info(`import places: Le fichier ${csvFile.name} a été traité.`)
      res.status(200).send({
        fileName: csvFile.name,
        success: true,
        message: `Le fichier ${csvFile.name} a été traité.`,
        places: result,
      })
    })
  } catch (error) {
    appLogger.error(error)
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const getPlaces = async (req, res) => {
  let places
  const { departement, beginDate, endDate } = req.query

  if (!departement) {
    places = await findAllPlaces()
    res.json(places)
  } else {
    places = await findCentresWithPlaces(departement, beginDate, endDate)
    res.json(places)
  }
}
