import { findAllPlaces } from '../../models/place'
import { importPlacesCsv } from './places.business'
import { logger } from '../../util'

export const importPlaces = (req, res) => {
  const csvFile = req.files.file
  try {
    logger.info(`import places provenant dufichier ${csvFile.name}`)
    importPlacesCsv(csvFile, result => {
      logger.info(`import places: Le fichier ${csvFile.name} a été traité.`)
      res.status(200).send({
        fileName: csvFile.name,
        success: true,
        message: `Le fichier ${csvFile.name} a été traité.`,
        places: result,
      })
    })
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const getPlaces = async (req, res) => {
  const places = await findAllPlaces()
  res.json(places)
}
