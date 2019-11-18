/**
 * Ensemble des actions sur les places archivées dans la base de données
 * @module
 */
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
  isCandilib
) => {
  const { _id: placeId, date, centre, inspecteur } = placeData
  const archivedPlaceData = {
    placeId,
    date,
    centre,
    inspecteur,
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
