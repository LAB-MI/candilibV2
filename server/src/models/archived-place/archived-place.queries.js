/**
 * Ensemble des actions sur les places archivées dans la base de données
 * @module models/archived-place-queries
 */
import ArchivedPlace from './archived-place.model'

/**
 * Création d'un document archived-place
 * @function createArchivedPlace
 * @param {ArchivedPlaceModel} archiedPlaceData
 */
export const createArchivedPlace = async archiedPlaceData => {
  const archivedPlace = await ArchivedPlace.create(archiedPlaceData)
  return archivedPlace
}

/**
 * Création d'un document archived-place à partir de données de place
 * @function createArchivedPlaceFromPlace
 *
 * @param {PlaceModel} placeData La place à archiver qui ne contient pas le propriété candidat
 * @param {String[]} archiveReasons Les raisons de l'archivage
 * @param {String} byUser L'auteur de l'action (Admin (userId) ou Aurige )
 * @param {Boolean} isCandilib S'il y a eu une réussite ou un échec par le biais de candilib
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
 * @function findArchivedPlaceByPlaceId
 * @param {ObjectId} placeId id de la place supprimée
 */
export const findArchivedPlaceByPlaceId = async placeId => {
  const archivedPlace = await ArchivedPlace.findOne({ placeId })
  return archivedPlace
}
