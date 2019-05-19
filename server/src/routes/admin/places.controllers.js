import { findAllPlaces, findPlaceById, deletePlace } from '../../models/place'
import { createPlaceForInspector, importPlacesCsv } from './places.business'
import { findCentresWithPlaces } from '../common/centre.business'
import { dateTimeToFormatFr } from '../../util/date.util'
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

export const createPlaceByAdmin = async (req, res) => {
  const { centre, inspecteur, date } = req.body
  try {
    const createdPlaceResult = await createPlaceForInspector(centre, inspecteur, date)
    appLogger.info(
      `create by admin place: La place a bien été créée.`
    )
    res.json({ success: true, message: `La place du [${createdPlaceResult.date}] a bien été crée.` })
  } catch (error) {
    appLogger.info(
      `create by admin place: La place n'a pas été créée.`
    )
    res.json({ success: false, message: "La place n'a pas été créée", error: error.nessage })
  }
}

export const deletePlaceByAdmin = async (req, res) => {
  const { id } = req.params
  const place = await findPlaceById(id)
  if (!place) {
    appLogger.info(`delete place: La place id: [${id}] n'existe pas en base.`)
    res.json({ success: false, message: "La place n'existe pas en base" })
  } else if (place.candidat) {
    appLogger.info(
      `delete place: La place id: [${id}] a été reservé par le candidatId: [${
        place.candidat
      }].`
    )
    res.json({
      success: false,
      message: "La place vient d'etre reservé par un candidat",
    })
  } else {
    try {
      await deletePlace(place)
      appLogger.info(
        `delete place: La place id: [${id}] a bien été supprimé de la base.`
      )
      const { date, hour } = dateTimeToFormatFr(place.date)
      res.json({
        success: true,
        message: `La place du [${date} ${hour}] a bien été supprimé de la base`,
      })
    } catch (error) {
      appLogger.info(
        `delete place: La place id: [${id}] a bien été supprimé de la base.`
      )
      res.json({
        success: false,
        message: `La place id: [${id}] n'a pas été supprimé`,
        error: error.message,
      })
    }
  }
}
