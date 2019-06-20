import { appLogger } from '../../util/logger'
import {
  synchroAurige,
  getCandidatsAsCsv,
  getBookedCandidatsAsCsv,
} from './business'
import {
  findAllCandidatsLean,
  findBookedCandidats,
  findCandidatsMatching,
  findCandidatById,
} from '../../models/candidat'
import { findPlaceByCandidatId } from '../../models/place'
import { statutReasonDictionnary } from '../common/reason.constants'

export const importCandidats = async (req, res) => {
  const loggerInfo = {
    section: 'admin-import-candidats',
    user: req.userId,
  }
  const files = req.files

  if (!files || !files.file) {
    res.status(400).json({
      success: false,
      message: 'Fichier manquant',
    })
    return
  }

  const jsonFile = files.file

  try {
    loggerInfo.filename = jsonFile.name
    appLogger.info({ ...loggerInfo })

    const result = await synchroAurige(jsonFile.data)
    res.status(200).send({
      fileName: jsonFile.name,
      success: true,
      message: `Le fichier ${jsonFile.name} a été synchronisé.`,
      candidats: result,
    })
  } catch (error) {
    appLogger.error({ ...loggerInfo, error })
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const exportCandidats = async (req, res) => {
  appLogger.info({
    section: 'admin-export-cvs',
    action: 'candidats',
    user: req.userId,
  })

  const candidatsAsCsv = await getCandidatsAsCsv(req.candidats)
  let filename = 'candidatsLibresPrintel.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

export const exportBookedCandidats = async (req, res) => {
  appLogger.info({
    section: 'admin-export-cvs',
    action: 'booked-candidats',
    user: req.userId,
  })

  const candidatsAsCsv = await getBookedCandidatsAsCsv(req.candidats)
  const filename = 'candidatsLibresReserve.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

export const getCandidats = async (req, res) => {
  const section = 'admin-get-candidats'
  const { id: candidatId } = req.params
  if (candidatId) {
    appLogger.info({ section, action: 'INFO-CANDIDAT', candidatId })
    const candidatFound = await findCandidatById(candidatId)

    if (candidatFound) {
      const placeFound = await findPlaceByCandidatId(candidatId, true)
      const candidat = candidatFound.toObject()
      candidat.places = candidat.places && candidat.places.map((place) => {
        const humanReadableReason = statutReasonDictionnary[place.archiveReason]
        return {
          ...place,
          archiveReason: humanReadableReason,
        }
      })
      res.json({
        success: true,
        candidat: { ...candidat, place: placeFound },
      })
      return
    }
    res.json({ success: false, message: "Le candidat n'existe pas" })
    return
  }

  const { matching, format, filter, for: actionAsk } = req.query

  if (matching) {
    appLogger.info({ section, action: 'SEARCH-CANDIDAT', matching })

    const candidats = await findCandidatsMatching(matching)
    res.json(candidats)
    return
  }

  if (filter === 'resa') {
    appLogger.info({ section, action: 'INFO-RESA', filter, format })

    getBookedCandidats(req, res)
    return
  }

  appLogger.info({ section, action: 'INFO-CANDIDATS', filter, format })

  const candidatsLean = await findAllCandidatsLean()
  appLogger.debug({ section, action: 'INFO-CANDIDATS', candidatsLean })
  let candidats
  if (actionAsk === 'aurige') {
    candidats = candidatsLean
  } else {
    candidats = await Promise.all(
      candidatsLean.map(async candidat => {
        const { _id } = candidat
        const places = await findPlaceByCandidatId(_id)
        if (places.length > 1) {
          appLogger.warn(
            `le candidat ${candidat.codeNeph} / '${
              candidat.nomNaissance
            } a plusieurs places d'examens`
          )
        }
        candidat.place = places[0] || {}
        return candidat
      })
    )
  }
  if (format && format === 'csv') {
    req.candidats = candidats
    exportCandidats(req, res)
    return
  }
  res.json(candidats)
}

export const getBookedCandidats = async (req, res) => {
  const {
    query: { format, date, inspecteur, centre },
  } = req

  appLogger.info({
    section: 'admin-get-booked-candidats',
    user: req.userId,
    format,
    date,
    inspecteur,
    centre,
  })

  const candidats = await findBookedCandidats(date, inspecteur, centre)

  if (format && format === 'csv') {
    req.candidats = candidats
    exportBookedCandidats(req, res)
    return
  }
  res.json(candidats)
}
