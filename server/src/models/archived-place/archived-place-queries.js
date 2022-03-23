/**
 * Ensemble des actions sur les places archivées dans la base de données
 * @module
 */
import { isValidObjectId } from 'mongoose'
import { findCandidatById } from '../candidat'
import { candidatInfoFields } from '../candidat/candidat.model'
import ArchivedPlace from './archived-place-model'

/**
 * Création d'un document archived-place
 * @async
 * @function
 *
 * @param {ArchivedPlace~ArchivedPlaceSchema} archivedPlaceData Place à archiver
 * @returns {ArchivedPlace~ArchivedPlaceSchema}
 */
export const createArchivedPlace = async archivedPlaceData => {
  const archivedPlace = await ArchivedPlace.create(archivedPlaceData)
  return archivedPlace
}

/**
 * Création d'un document archived-place à partir de données de place
 * @async
 * @function
 *
 * @param {module:models/place/place-model~PlaceModel} placeData La place à archiver qui ne contient pas le propriété candidat
 * @param {string[]} archiveReasons Les raisons de l'archivage
 * @param {string} byUser L'auteur de l'action (Admin (userId) ou Aurige )
 * @param {boolean} isCandilib S'il y a eu une réussite ou un échec par le biais de candilib
 */
export const createArchivedPlaceFromPlace = async (
  placeData,
  archiveReasons,
  byUser,
  isCandilib,
) => {
  const { _id: placeId, ...infoPlace } = placeData._doc
  const { candidat } = infoPlace
  let candidatDoc
  if (candidat && isValidObjectId(candidat)) {
    const options = Object.keys(candidatInfoFields).reduce((obj, key) => ({ ...obj, [key]: 1 }), {})
    candidatDoc = await findCandidatById(candidat, options, undefined, true)
  }

  const archivedPlaceData = {
    placeId,
    ...infoPlace,
    candidat: candidatDoc || candidat,
    archiveReasons,
    isCandilib,
    byUser,
  }
  const archivedPlace = await ArchivedPlace.create(archivedPlaceData)
  return archivedPlace
}

/**
 * Retrouver une place supprimée par son id
 * @async
 * @function
 * @param {ObjectId|string} placeId id de la place supprimée
 */
export const findArchivedPlaceByPlaceId = async placeId => {
  const archivedPlace = await ArchivedPlace.findOne({ placeId })
  return archivedPlace
}

/**
 *
 * @param {*} ipcsrId
 * @param {*} begin
 * @param {*} end
 * @returns
 */
export const findArchivedPlaceByIpcsrIdAndDates = async (filters, withLean) => {
  const { ipcsrId, begin, end } = filters
  const query = ArchivedPlace.find({ inspecteur: ipcsrId.toString(), date: { $gte: begin.toString(), $lte: end.toString() } })
  if (withLean) {
    query.lean()
  }
  const archivedPlace = await query.exec()
  return archivedPlace
}
