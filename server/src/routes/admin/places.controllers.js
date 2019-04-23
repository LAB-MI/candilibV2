import { findAllPlaces } from '../../models/place'
import { importPlacesCsv } from './places.business'
import { findCentresWithPlaces } from '../common/centre.business'
import { appLogger } from '../../util'

export const importPlaces = async (req, res) => {
  const csvFile = req.files.file
  const { departement } = req.body

  try {
    appLogger.info(
      `import places provenant du fichier ${
        csvFile.name
      } et du departement ${departement}`
    )
    const result = await importPlacesCsv({ csvFile, departement })
    appLogger.info(
      `import places: Le fichier ${
        csvFile.name
      } a été traité pour le departement ${departement}.`
    )
    res.status(200).send({
      fileName: csvFile.name,
      success: true,
      message: `Le fichier ${
        csvFile.name
      } a été traité pour le departement ${departement}.`,
      places: result,
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
