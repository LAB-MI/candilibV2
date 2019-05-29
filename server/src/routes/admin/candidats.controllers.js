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

export const importCandidats = async (req, res) => {
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
    const result = await synchroAurige(jsonFile.data)
    res.status(200).send({
      fileName: jsonFile.name,
      success: true,
      message: `Le fichier ${jsonFile.name} a été synchronisé.`,
      candidats: result,
    })
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const exportCandidats = async (req, res) => {
  const candidatsAsCsv = await getCandidatsAsCsv(req.candidats)
  let filename = 'candidatsLibresPrintel.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

export const exportBookedCandidats = async (req, res) => {
  const candidatsAsCsv = await getBookedCandidatsAsCsv(req.candidats)
  const filename = 'candidatsLibresReserve.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

export const getCandidats = async (req, res) => {
  const { id: candidatId } = req.params
  if (candidatId) {
    const candidatFound = await findCandidatById(
      candidatId,
      'codeNeph nomNaissance prenom email portable'
    )
    if (candidatFound) {
      res.json({ success: true, candidat: candidatFound })
      return
    }
    res.json({ success: false, message: "le candidat n'existe pas" })
    return
  }

  const { matching, format, filter } = req.query

  if (matching) {
    const candidats = await findCandidatsMatching(matching)
    res.json(candidats)
    return
  }

  if (filter === 'resa') {
    getBookedCandidats(req, res)
    return
  }

  const candidatsLean = await findAllCandidatsLean()
  const candidats = await Promise.all(
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

  const candidats = await findBookedCandidats(date, inspecteur, centre)

  if (format && format === 'csv') {
    req.candidats = candidats
    exportBookedCandidats(req, res)
    return
  }
  res.json(candidats)
}
